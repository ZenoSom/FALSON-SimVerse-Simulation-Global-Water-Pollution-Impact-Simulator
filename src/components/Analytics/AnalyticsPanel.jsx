import React from 'react';
import Plot from 'react-plotly.js';
import { useSimulation } from '../../context/SimulationContext';

const AnalyticsPanel = () => {
    const { wpi, qualityStatus, localData, params, plotsData } = useSimulation();
    const { timelineData, scatterData, barData } = plotsData;

    if (!localData) return (
        <div style={{ height: '100%', padding: '1rem', color: '#94a3b8' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Analytics Dashboard</h3>
            <div>Select a location on the globe to view analytics.</div>
        </div>
    );

    const plotConfig = { displayModeBar: false, responsive: true };
    const darkLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e2e8f0', size: 10 },
        margin: { t: 30, b: 30, l: 40, r: 10 }, // Tight margins
        xaxis: { showgrid: false, zeroline: false, color: '#94a3b8' },
        yaxis: { showgrid: true, gridcolor: '#334155', zeroline: false, color: '#94a3b8' }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Analytics Dashboard</h3>

            {/* STATUS CARD */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: `4px solid ${wpi < 0.1 ? '#10b981' : wpi > 0.6 ? '#ef4444' : '#f59e0b'}` }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>CURRENT WPI (Water Pollution Index)</span>
                    <span
                        title="Water Pollution Index (0-1 Scale):&#013;0.0-0.3: Safe / Potable&#013;0.3-0.6: Moderately Polluted&#013;0.6-0.8: High Risk / Non-Potable&#013;> 0.8: Critical Biohazard (Class E)"
                        style={{ cursor: 'help', fontSize: '1.2rem', opacity: 0.7 }}
                    >
                        ℹ️
                    </span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{wpi.toFixed(2)}</div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px' }}>{qualityStatus}</div>
            </div>

            {/* 1. FACTOR CONTRIBUTION */}
            <div style={{ marginBottom: '1.5rem', height: '220px' }}>
                <h4 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#94a3b8' }}>POLLUTION SOURCE BREAKDOWN</h4>
                <Plot
                    data={[{
                        x: barData.x,
                        y: barData.y,
                        type: 'bar',
                        marker: { color: ['#3b82f6', '#a855f7', '#10b981'] }
                    }]}
                    layout={{ ...darkLayout, title: '' }}
                    config={plotConfig}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* AI RECOMMENDATIONS CARD */}
            <div style={{ marginBottom: '1.5rem', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🤖</span> AI Mitigation Strategy
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#e0e0e0', lineHeight: '1.6' }}>
                    {useSimulation().mitigationPlan.map((step, i) => (
                        <li key={i}>{step}</li>
                    ))}
                </ul>
            </div>

            {/* 2. TIMELINE PROJECTION */}
            <div style={{ marginBottom: '1.5rem', height: '220px' }}>
                <h4 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#94a3b8' }}>20-YEAR PROJECTION</h4>
                <Plot
                    data={[{
                        x: timelineData.x,
                        y: timelineData.y,
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: '#f59e0b' },
                        line: { shape: 'spline' }
                    }]}
                    layout={{
                        ...darkLayout,
                        xaxis: { ...darkLayout.xaxis, title: 'Years Future' },
                        yaxis: { ...darkLayout.yaxis, title: 'WPI' }
                    }}
                    config={plotConfig}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* 3. SCATTER TREND */}
            <div style={{ marginBottom: '1rem', height: '300px' }}>
                <h4 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                    REGIONAL COMPARISON (DENSITY vs WPI) <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#64748b' }}>(Hover over points)</span>
                </h4>
                <Plot
                    data={[
                        {
                            x: scatterData.x,
                            y: scatterData.y,
                            mode: 'markers',
                            type: 'scatter',
                            marker: { color: 'rgba(255,255,255,0.3)', size: 6 },
                            name: 'Region',
                            hovertemplate: 'Density: %{x:.1f}/km²<br>WPI: %{y:.2f}<extra></extra>'
                        },
                        {
                            x: [localData?.population / 314], // Current point
                            y: [wpi],
                            mode: 'markers',
                            type: 'scatter',
                            marker: { color: '#ef4444', size: 12, line: { color: 'white', width: 2 } },
                            name: 'You',
                            hovertemplate: '<b>YOUR LOCATION</b><br>Density: %{x:.1f}/km²<br>WPI: %{y:.2f}<extra></extra>'
                        }
                    ]}
                    layout={{ ...darkLayout, showlegend: false }}
                    config={plotConfig}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default AnalyticsPanel;
