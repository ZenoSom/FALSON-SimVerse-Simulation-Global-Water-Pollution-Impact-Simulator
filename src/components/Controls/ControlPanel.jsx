import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Sliders, Droplets, Factory, Users, MapPin, Clock } from 'lucide-react';

const ControlSection = ({ title, icon: Icon, children }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
            <Icon size={18} style={{ marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
        </div>
        {children}
    </div>
);

const SliderControl = ({ label, value, onChange, min = 0, max = 1, step = 0.01, format = (v) => v }) => (
    <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
            <span>{label}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{format(value)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
    </div>
);

const ControlPanel = () => {
    const {
        params, updateParam, selectedLocation, localData, wpi, qualityStatus,
        regionType, setRegionType, // Not used heavily but kept for compatibility
        sewageTreatment, setSewageTreatment,
        industryType, setIndustryType,
        realDataMode, setRealDataMode,
        osmData
    } = useSimulation();

    return (
        <div style={{ height: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                <div>FALCONS – SimVerse</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal', marginTop: '4px', letterSpacing: '0.5px' }}>
                    Global Water Pollution Impact Simulator
                </div>
            </h2>

            {/* Location Status */}
            <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <MapPin size={16} style={{ marginRight: '8px', color: selectedLocation ? 'var(--accent-secondary)' : 'var(--color-text-muted)' }} />
                    <span>
                        {selectedLocation
                            ? `Lat: ${selectedLocation.lat.toFixed(2)}, Lon: ${selectedLocation.lon.toFixed(2)}`
                            : "Select a location on the globe"}
                    </span>
                </div>

                {localData && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#a0a0a0' }}>Environment:</span>
                            <span style={{ fontWeight: 600, color: localData.classification === 'Ocean' ? '#60a5fa' : '#e0e0e0' }}>{localData.classification}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#a0a0a0' }}>Population:</span>
                            <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>{localData.population.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#a0a0a0' }}>Status:</span>
                            <span style={{ fontWeight: 600, color: wpi < 0.1 ? '#10b981' : wpi < 0.6 ? '#f59e0b' : '#ef4444' }}>
                                {qualityStatus}
                            </span>
                        </div>

                        {/* "Why" Explanation */}
                        <div style={{ marginTop: '0.8rem', padding: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.75rem', fontStyle: 'italic', color: '#cbd5e1' }}>
                            <strong>Analysis:</strong>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '14px' }}>
                                {localData.explanation.map((exp, i) => (
                                    <li key={i}>{exp}</li>
                                ))}
                                {params.sewageDropping === 0 && params.industrialDensity === 0 && (
                                    <li>All pollution sources are zero. Area Safe.</li>
                                )}
                                {localData.isWater && (
                                    <li>Ocean environment: No resident population.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <ControlSection title="Timeline" icon={Clock}>
                <SliderControl
                    label="Years Active"
                    value={params.yearsActive}
                    min={0} max={50} step={1}
                    onChange={(v) => updateParam('yearsActive', v)}
                    format={(v) => `${v} yrs`}
                />
            </ControlSection>

            <ControlSection title="Sewage Management" icon={Droplets}>
                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Treatment Level</label>
                    <select
                        value={sewageTreatment}
                        onChange={(e) => setSewageTreatment(e.target.value)}
                        style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '4px' }}
                    >
                        <option value="None">No Treatment (100%)</option>
                        <option value="Partial">Partial STP (50%)</option>
                        <option value="Full">Full STP (10%)</option>
                    </select>
                </div>
                <SliderControl
                    label="Untreated Discharge"
                    value={params.sewageDropping}
                    onChange={(v) => updateParam('sewageDropping', v)}
                    format={(v) => `${(v * 100).toFixed(0)}%`}
                />
            </ControlSection>

            <ControlSection title="Industrial Activity" icon={Factory}>
                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Industry Type</label>
                    <select
                        value={industryType}
                        onChange={(e) => setIndustryType(e.target.value)}
                        style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '4px' }}
                    >
                        <option value="Chemical">Chemical (High Toxicity)</option>
                        <option value="Textile">Textile (Med Toxicity)</option>
                        <option value="Heavy">Heavy/Other (Med-High)</option>
                    </select>
                </div>
                <SliderControl
                    label="Density"
                    value={params.industrialDensity}
                    onChange={(v) => updateParam('industrialDensity', v)}
                    format={(v) => `${(v * 100).toFixed(0)}%`}
                />
            </ControlSection>

            <ControlSection title="Parameters" icon={Sliders}>
                <SliderControl
                    label="Influence Radius (km)"
                    value={params.radius}
                    min={10} max={1000} step={10}
                    onChange={(v) => updateParam('radius', v)}
                    format={(v) => `${v} km`}
                />
            </ControlSection>

            {/* Real Data Mode Toggle */}
            {selectedLocation && localData?.habitability === 'Habitable' && (
                <div style={{ marginTop: '1.5rem', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            checked={realDataMode}
                            onChange={(e) => setRealDataMode(e.target.checked)}
                            style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                        />
                        <span style={{ flex: 1 }}>
                            🌐 Use Real Industrial Data
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                Queries OpenStreetMap for nearby factories
                            </div>
                        </span>
                    </label>

                    {osmData && (
                        <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {osmData.source === 'fallback' ? (
                                <div style={{ color: '#f59e0b' }}>⚠️ API unavailable, using synthetic data</div>
                            ) : (
                                <>
                                    <div>✅ Detected {osmData.count} industrial facilities</div>
                                    {osmData.hasWastewaterPlant && <div>🏭 Wastewater treatment plant found</div>}
                                    <div style={{ marginTop: '4px', color: '#94a3b8' }}>Source: {osmData.source}</div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ControlPanel;
