// Deterministic Geodata Simulator - LAYER 1: HABITABILITY & BIOMES

// Major Cities "Gravity Wells" (Only these generate high pop)
const POPULATION_HUBS = [
    // Asia
    [28.61, 77.20, 32, 5.0], // Delhi
    [19.07, 72.87, 20, 4.0], // Mumbai
    [35.67, 139.65, 37, 4.0], // Tokyo
    [31.23, 121.47, 27, 4.0], // Shanghai
    [13.75, 100.50, 10, 3.0], // Bangkok
    [22.31, 114.16, 7, 2.0], // Hong Kong
    [1.35, 103.81, 5, 2.0], // Singapore

    // Europe
    [51.50, -0.12, 9, 3.0],  // London
    [48.85, 2.35, 11, 3.0],  // Paris
    [52.52, 13.40, 4, 3.0],  // Berlin
    [41.90, 12.49, 3, 3.0],  // Rome
    [55.75, 37.61, 12, 4.0], // Moscow

    // Americas
    [40.71, -74.00, 19, 4.0], // NYC
    [34.05, -118.24, 13, 4.0], // LA
    [41.87, -87.62, 9, 3.0], // Chicago
    [-23.55, -46.63, 22, 4.0], // Sao Paulo
    [19.43, -99.13, 21, 3.0], // Mexico City

    // Africa / Middle East
    [30.04, 31.23, 21, 3.0], // Cairo
    [6.52, 3.37, 15, 3.5],   // Lagos
    [25.20, 55.27, 3, 2.0],  // Dubai
    [-33.92, 18.42, 4, 2.0], // Cape Town

    // Oceania
    [-33.86, 151.20, 5, 2.0], // Sydney
];

// UNINHABITED ZONES (Strict Exclusion Zones)
const UNINHABITED_ZONES = [
    // [MinLat, MaxLat, MinLon, MaxLon, Name]
    [27, 36, 75, 100, "Himalayas / Tibetan Plateau"],      // High Elevation
    [18, 30, -10, 35, "Sahara Desert"],                    // Northern Africa
    [-25, -20, 120, 140, "Australian Outback (Deep)"],     // Australia Center
    [72, 90, -180, 180, "Arctic / Ice Cap"],               // North Pole
    [-90, -60, -180, 180, "Antarctica"],                   // South Pole
    [-5, 2, -70, -60, "Amazon Deep Rainforest"],           // Dense Jungle (Sparse)
    [60, 75, -160, -100, "Northern Canada / Tundra"],      // Tundra
    [55, 75, 60, 130, "Siberian Tundra"],                  // Siberia

    // STRICT OCEAN EXCLUSIONS (Fixes "Rural Town" in Ocean bugs)
    // These override the broad land boxes
    [10, 25, 60, 73, "Arabian Sea"],        // Narrowed from 50-75 to 60-73
    [8, 22, 86, 95, "Bay of Bengal"],       // Narrowed from 80-100 to 86-95 (east coast only)
    [-40, 5, 50, 85, "Indian Ocean (Deep)"], // Adjusted to not overlap India
    [-5, 25, 110, 130, "South China Sea"],
    [5, 30, 130, 160, "Philippine Sea / Pacific"],
    [25, 50, 135, 180, "North Pacific"],
    [20, 40, -160, -125, "North Pacific (East)"],
    [10, 40, -70, -40, "North Atlantic (Mid)"],
    [-40, 10, -30, 10, "South Atlantic (Mid)"],
    [-60, -40, -180, 180, "Southern Ocean"]
];

// Rough Continental Boxes (Refined for better Land/Water accuracy)
const LAND_BOXES = [
    // Asia - India Subcontinent
    [8, 37, 68, 97],
    // Asia - China / East Asia
    [18, 53, 98, 135],
    // Asia - SE Asia (Thai, Vietnam, Malaysia)
    [5, 25, 95, 110],
    // Asia - Indonesia (NARROWED - was too broad)
    [-10, 5, 95, 120],  // Changed from 140 to 120 to exclude Pacific
    // Asia - Philippines only
    [5, 20, 120, 127],
    // Asia - Japan / Korea
    [33, 45, 125, 145],
    // Europe (Broad but safer)
    [36, 70, -10, 40],
    // Africa
    [-35, 37, -18, 52],
    // North America (US/Canada/Mexico)
    [15, 70, -140, -50],
    // South America
    [-56, 13, -82, -34],
    // Australia
    [-40, -10, 112, 154]
];

function deterministicNoise(lat, lon) {
    let x = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

export const getGeoData = (lat, lon) => {
    let population = 0;
    let habitability = "Habitable";
    let biomeName = "Generic Land";
    let isWater = true;
    let explanation = [];

    // --- CHECK 1: GRAVITY WELLS (Cities) - PRIORITY OVERRIDE ---
    // Coastal cities (Mumbai, NYC) must NOT be blocked by Ocean exclusion zones.
    let hubImpact = 0;
    let isCity = false;

    POPULATION_HUBS.forEach(([hLat, hLon, pop, spread]) => {
        const dLat = lat - hLat;
        const dLon = lon - hLon;
        const dist = Math.sqrt(dLat * dLat + dLon * dLon);

        if (dist < spread) {
            const factor = Math.exp(-(dist * dist) / (2 * (spread / 2) * (spread / 2)));
            hubImpact += pop * factor * 1000000;
            isCity = true;
        }
    });

    if (isCity && hubImpact > 10000) {
        // High confidence city hit
        let population = Math.floor(hubImpact);
        let classification = "Urban";
        if (population > 5000000) classification = "Megacity";
        else if (population > 1000000) classification = "Metro";

        return {
            population,
            classification,
            biome: "Urban Center",
            isWater: false,
            habitability: "Habitable",
            explanation: [`Major Urban Hub detected.`, `Population: ${population.toLocaleString()}`]
        };
    }

    // --- CHECK 2: UNINHABITED ZONES (Strict Exclusion Zones) ---
    // Only applies if NOT a major city.
    for (const zone of UNINHABITED_ZONES) {
        if (lat >= zone[0] && lat <= zone[1] && lon >= zone[2] && lon <= zone[3]) {
            return {
                population: 0,
                classification: "Uninhabited",
                biome: zone[4],
                isWater: true, // Force Water/Uninhabited behavior
                habitability: "Uninhabited",
                explanation: [
                    `Biome: ${zone[4]}`,
                    "Environment is Uninhabited or Open Water.",
                    "Natural State: Preserved."
                ]
            };
        }
    }

    // --- CHECK 3: OCEAN / WATER (Implicit) ---
    // Default is water unless likely land
    let likelyLand = false;
    for (const box of LAND_BOXES) {
        if (lat >= box[0] && lat <= box[1] && lon >= box[2] && lon <= box[3]) {
            likelyLand = true;
            isWater = false;
            break;
        }
    }

    // --- CHECK 4: RURAL POPULATION ASSIGNMENT ---
    // Logic if not a major city but still on land

    // --- CHECK 4: POPULATION ASSIGNMENT ---
    if (!likelyLand) {
        // Ocean
        return {
            population: 0,
            classification: "Ocean",
            biome: "Deep Ocean",
            isWater: true,
            habitability: "Uninhabited",
            explanation: ["Location is in a major water body.", "Zero permanent population."]
        };
    }

    // It is land and habitable
    // Recalculate city influence for suburban/rural classification
    // (hubImpact from CHECK 1 is only for early city returns with >10k pop)
    let finalHubImpact = 0;
    POPULATION_HUBS.forEach(([hLat, hLon, pop, spread]) => {
        const dLat = lat - hLat;
        const dLon = lon - hLon;
        const dist = Math.sqrt(dLat * dLat + dLon * dLon);
        if (dist < spread * 1.5) {  // Slightly wider net for suburban influence
            const factor = Math.exp(-(dist * dist) / (2 * (spread / 2) * (spread / 2)));
            finalHubImpact += pop * factor * 1000000;
        }
    });

    if (finalHubImpact > 100 && finalHubImpact <= 10000) {
        // Minor influence from city (Suburban)
        population = Math.floor(finalHubImpact + 500);
        biomeName = "Suburban";
    } else {
        // Pure Rural scattering
        const varA = deterministicNoise(lat, lon);
        const varB = deterministicNoise(lat * 0.5, lon * 0.5);
        // Ensure MINIMUM population for any valid land mass
        population = Math.floor(2000 + (varA * 5000) + (varB * 15000));
        biomeName = "Rural Settlement";
    }

    // Classification
    let classification = "Rural";
    if (population > 5000000) classification = "Megacity";
    else if (population > 1000000) classification = "Metro";
    else if (population > 100000) classification = "Urban";
    else if (population > 5000) classification = "Town";

    explanation.push(`Biome: ${biomeName}`);
    explanation.push(`Estimated Population: ${population.toLocaleString()}`);

    return {
        population,
        classification,
        biome: biomeName,
        isWater: false,
        habitability: "Habitable",
        explanation
    };
};
