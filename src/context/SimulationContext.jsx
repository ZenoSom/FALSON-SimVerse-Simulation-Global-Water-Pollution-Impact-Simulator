import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGeoData } from '../utils/geoDataService';

const SimulationContext = createContext();

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
    const [params, setParams] = useState({
        // Normalized Input Sliders (0-1)
        sewageDropping: 0.5,     // S
        industrialDensity: 0.5,  // I
        yearsActive: 0,          // Time Factor
        radius: 200,             // Influence Radius (km)
    });

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [localData, setLocalData] = useState(null); // { population, classification, isWater, explanation }
    const [wpi, setWpi] = useState(0.01); // Baseline safe
    const [qualityStatus, setQualityStatus] = useState("Safe (Drinking)");

    /* New Factors State */
    const [regionType, setRegionType] = useState('Urban'); // Hint for multipliers if manual override is needed, but we derive from location mostly.
    const [sewageTreatment, setSewageTreatment] = useState('None');
    const [industryType, setIndustryType] = useState('Chemical');

    /* Real Data Mode */
    const [realDataMode, setRealDataMode] = useState(false);
    const [osmData, setOsmData] = useState(null); // { count, hasWastewaterPlant, source }

    /* Logic Constants */
    const TREATMENT_FACTOR = { None: 1.0, Partial: 0.5, Full: 0.1 };
    const INDUSTRY_TOXICITY = { Chemical: 1.0, Textile: 0.6, Heavy: 0.3 }; // Updated specs: Textile 0.6, Light 0.3 (Using Heavy as Light/Other placeholder or generic)
    const URBAN_FACTOR_MAP = { 'Rural': 0.2, 'Urban': 0.6, 'Metro': 1.0, 'Megacity': 1.0, 'Ocean': 0.0, 'Remote Wilderness': 0.0 };
    const GLOBAL_MAX_DENSITY = 20000; // people/km2 reference max

    // Update Local Data when location changes
    useEffect(() => {
        if (selectedLocation) {
            const data = getGeoData(selectedLocation.lat, selectedLocation.lon);
            setLocalData(data);
        }
    }, [selectedLocation]);

    // Query OSM when Real Data Mode is enabled
    useEffect(() => {
        if (realDataMode && selectedLocation && localData?.habitability === 'Habitable') {
            // Dynamic import to prevent bundle bloat
            import('../utils/osmService').then(({ debouncedQuery }) => {
                debouncedQuery(selectedLocation.lat, selectedLocation.lon, (result) => {
                    setOsmData(result);

                    // Auto-adjust industry based on real data
                    if (result.count > 5) {
                        setIndustryType('Chemical');
                        updateParam('industrialDensity', Math.min(0.5 + (result.count * 0.05), 0.9));
                    }
                    if (result.hasWastewaterPlant) {
                        setSewageTreatment('Full');
                    }
                });
            });
        } else {
            setOsmData(null);
        }
    }, [realDataMode, selectedLocation, localData]);

    // LAYERED WPI LOGIC
    useEffect(() => {
        // Defaults
        if (!localData || !selectedLocation) {
            setWpi(0.01);
            setQualityStatus("Safe (Start)");
            return;
        }

        // --- LAYER 1: HABITABILITY FILTER ---
        // If GeoData says "Uninhabited" (Ice, Desert, High Mtn, Ocean), force Safe.
        // User Exception: "Ocean/Water body... LocalPop=0... SewageImpact=0". 
        // Note: Industrial Rigs *can* exist in ocean, but pure Ocean with no sliders = Safe.
        // If habitability is Uninhabited due to "Hostile Biome", we generally assume pristine unless explicitly polluted.

        // HOWEVER, User Rule: "Ocean... LocalPopulation=0... Sliders still control pollution sources".
        // So we only force strict 0 IF Sliders are 0.
        // But for "Habitat Filter" (e.g. Himalayas), do we allow pollution?
        // User Rule: "Uninhabited -> LocalPop=0, Sewage=0, Industry=0 (forced 0? likely implicit natural state)".
        // Wait, User text: "If ANY condition is true (Elevation/Desert/...) THEN SewageImpact=0, IndustryImpact=0... Status=Safe".
        // "No sliders may override this." => STRONG RULE.

        if (localData.habitability === "Uninhabited") {
            setWpi(0.01);
            setQualityStatus("Safe (Natural / Uninhabited)");
            return; // EXIT IMMEDIATELY
        }

        // --- LAYER 2: POLLUTION SOURCE GATE ---
        // P must not generate pollution.
        const S = params.sewageDropping;
        const I = params.industrialDensity;

        if (S === 0 && I === 0) {
            setWpi(0.01);
            setQualityStatus("Safe (No Pollution Sources)");
            return; // EXIT IMMEDIATELY
        }

        // --- LAYER 3: POPULATION AS MULTIPLIER ONLY ---
        // Only if S or I > 0 (passed Layer 2)
        const P_abs = localData.population;
        // MaxRegionalPopulation for Norm: 20 Million
        const popRatio = Math.min(P_abs / 20000000, 1);
        const populationFactor = popRatio; // 0 to 1

        // Urbanization Modifier (optional, but requested in previous steps, lets keep it simple as multiplier)
        // Multiplier = 1 + 0.4 * PopFactor. (Max single factor boost 1.4x)

        // --- LAYER 4: FINAL COMPUTATION ---

        // Impact Calc
        const sewageImpact = S * TREATMENT_FACTOR[sewageTreatment];
        // Toxicity map
        const indTox = INDUSTRY_TOXICITY[industryType] || 0.5;
        const industryImpact = I * indTox;

        // Base WPI Component (0.45 * S + 0.35 * I)
        // Note: Weights sum to 0.8. Max without pop = 0.8.
        const basePollution = (0.45 * sewageImpact) + (0.35 * industryImpact);

        // Apply Pop Multiplier
        const popMultiplier = 1 + (0.4 * populationFactor);

        // Time & Distance
        // Time Factor (Accumulation)
        const timeFactor = 1 + (params.yearsActive * 0.05); // +5% per year
        let decay = 1;
        if (sewageTreatment === 'Full') {
            decay = Math.pow(0.9, params.yearsActive); // 10% decay per year if treated
        }

        // Total WPI
        let finalWpi = basePollution * popMultiplier * timeFactor * decay;

        // Safety Clamp (never below baseline if sources exist? Or allow strict 0?)
        // If sources exist, it's likely > 0.01.

        setWpi(finalWpi);

        // --- LAYER 5: STATUS LOGIC ---
        // Context Aware
        if (finalWpi < 0.1) setQualityStatus("Safe (Drinking)");
        else if (finalWpi < 0.3) setQualityStatus("Safe (General Use)");
        else if (finalWpi < 0.6) setQualityStatus("Stressed");
        else {
            // Unsafe is ONLY allowed if Sewage or Industry > 0 (Guaranteed by Layer 2 check)
            setQualityStatus("Unsafe (Dangerous)");
        }

    }, [params, localData, sewageTreatment, industryType]);

    // --- CHART DATA GENERATION (Used for UI & Report) ---
    // TIMELINE DATA (0-20 Years Projection)
    const timelineData = (() => {
        const years = Array.from({ length: 21 }, (_, i) => i);
        const yWPI = years.map(year => {
            if (!localData) return 0.01;
            const S = params.sewageDropping;
            const I = params.industrialDensity;
            const P = localData.population / 20000000;
            if (S === 0 && I === 0) return 0.01;
            const treat = (sewageTreatment === 'None' ? 1.0 : sewageTreatment === 'Partial' ? 0.5 : 0.1);
            const tox = (industryType === 'Chemical' ? 1.0 : industryType === 'Textile' ? 0.6 : 0.3);
            const sewImp = S * treat;
            const indImp = I * tox;
            const base = (0.45 * sewImp) + (0.35 * indImp);
            const popMult = 1 + (0.4 * Math.min(P, 1));
            let val = base * popMult;
            const tFactor = 1 + (year * 0.05);
            const decay = (sewageTreatment === 'Full') ? Math.pow(0.9, year) : 1;
            return Math.min(Math.max(0.01, val * tFactor * decay), 1.0);
        });
        return { x: years, y: yWPI };
    })();

    // SCATTER DATA (Regional Simulated Trend)
    const scatterData = (() => {
        if (!localData) return { x: [], y: [] };
        const currentDens = (localData.population / 314);
        const ptrs = [];
        for (let i = 0; i < 30; i++) {
            const d = Math.max(0, currentDens * (0.5 + Math.random()));
            const baseWPI = wpi * (d / Math.max(1, currentDens)) * (0.8 + Math.random() * 0.4);
            ptrs.push({ x: d, y: Math.min(1, baseWPI) });
        }
        return { x: ptrs.map(p => p.x), y: ptrs.map(p => p.y) };
    })();

    // BAR DATA (Contribution)
    const barData = (() => {
        if (wpi <= 0.01) return { x: [], y: [] };
        const S = params.sewageDropping;
        const I = params.industrialDensity;
        const treat = (sewageTreatment === 'None' ? 1.0 : sewageTreatment === 'Partial' ? 0.5 : 0.1);
        const tox = (industryType === 'Chemical' ? 1.0 : industryType === 'Textile' ? 0.6 : 0.3);
        const rawSew = 0.45 * S * treat;
        const rawInd = 0.35 * I * tox;
        const totalBase = rawSew + rawInd;
        const popRatio = Math.min(localData?.population / 20000000 || 0, 1);
        const popBoost = totalBase * (0.4 * popRatio);
        return { x: ['Sewage', 'Industry', 'Pop. Multiplier'], y: [rawSew, rawInd, popBoost] };
    })();

    // --- AI MITIGATION LOGIC ---
    const mitigationPlan = (() => {
        if (!localData || wpi <= 0.05) return ["✅ Zone is safe. No intervention required.", "Expected Action: Continue routine monitoring."];

        const strategies = [];

        // Criticality Check
        if (wpi > 0.8) {
            strategies.push("🚨 CRITICAL: Limit water usage immediately.");
            strategies.push("deploy mobile filtration units.");
        } else if (wpi > 0.6) {
            strategies.push("⚠️ HIGH RISK: Issue boil-water advisories.");
        }

        // Cause Analysis
        const S = params.sewageDropping * (sewageTreatment === 'None' ? 1 : 0.5);
        const I = params.industrialDensity * (industryType === 'Chemical' ? 1 : 0.6);

        if (S > I) {
            // Sewage Dominant
            strategies.push("🛠️ INFRASTRUCTURE: Retrofit 3-stage STP (Sewage Treatment Plants).");
            strategies.push("🌱 NATURE-BASED: Construct wetlands to absorb organic load.");
            strategies.push("📉 POLICY: Mandate greywater recycling for residential blocks.");
        } else {
            // Industry Dominant
            strategies.push("🏭 INDUSTRY: Enforce Zero Liquid Discharge (ZLD) protocols.");
            strategies.push("🧪 TOXICITY: Install heavy metal precipitation units.");
            strategies.push("⚖️ LEGAL: Penalty for untreated effluent discharge.");
        }

        // General
        if (localData.population > 1000000) strategies.push("🏙️ URBAN: Implement rainwater harvesting to dilute groundwater salinity.");

        return strategies;
    })();

    const plotsData = { timelineData, scatterData, barData };

    // Added regionType dependency if used

    const updateParam = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <SimulationContext.Provider value={{
            params,
            updateParam,
            regionType, setRegionType,
            sewageTreatment, setSewageTreatment,
            industryType, setIndustryType,
            selectedLocation,
            setSelectedLocation,
            localData,
            wpi,
            qualityStatus,
            plotsData,
            mitigationPlan,
            realDataMode,
            setRealDataMode,
            osmData
        }}>
            {children}
        </SimulationContext.Provider>
    );
};
