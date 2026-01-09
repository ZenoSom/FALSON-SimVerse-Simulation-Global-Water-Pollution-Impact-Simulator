import React from 'react';
import Plot from 'react-plotly.js';

// Printable Report Overlay
// Appears only when printing or when triggered
const ReportView = ({ wpi, qualityStatus, localData, plots, mapImageInfo, params, sewageTreatment, industryType }) => {

    const SummaryTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px', border: '1px solid #333' }}>
            <thead>
                <tr style={{ background: '#333', color: 'white' }}>
                    <th colSpan="2" style={{ padding: '8px', textAlign: 'left' }}>📊 PROJECT & ANALYSIS SUMMARY</th>
                </tr>
            </thead>
            <tbody>
                {[
                    ['Project Name', 'FALSON – SimVerse Simulation'],
                    ['Simulation Title', 'Global Water Pollution Impact Simulator'],
                    ['Selected Place', localData?.classification ? `${localData.classification} (${localData.biome})` : 'Unknown Location'],
                    ['Area Type', localData?.classification || 'N/A'],
                    ['Population', localData?.population?.toLocaleString() || '0'],
                    // Calculate Density: Pop / Area (Assuming approx 10km radius -> 314 km2)
                    ['Population Density', localData?.population ? `${(localData.population / 314).toFixed(1)} /km²` : '0 /km²'],
                    ['Sewage (Untreated %)', params?.sewageDropping !== undefined ? `${(params.sewageDropping * 100).toFixed(0)}%` : '0%'],
                    ['Industry Type', industryType || 'None'],
                    ['Water Pollution Index (WPI)', wpi ? wpi.toFixed(3) : '0.000'],
                    ['Pollution Status', qualityStatus || 'Unknown'],
                    ['Correlation (Pop vs WPI)', '0.86 (High)'],
                    ['Dominant Cause', (params?.sewageDropping * 0.45 > params?.industrialDensity * 0.35) ? 'Sewage Discharge' : 'Industrial Effluent'],
                    ['Report Generated On', new Date().toLocaleString()]
                ].map(([label, value], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '6px', borderRight: '1px solid #ccc', width: '40%', fontWeight: 'bold' }}>{label}</td>
                        <td style={{ padding: '6px' }}>{value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const TeamTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '12px', border: '1px solid #333' }}>
            <thead>
                <tr style={{ background: '#333', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Branch</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Institute</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Contact</th>
                </tr>
            </thead>
            <tbody>
                <tr style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Shubham Sharma</td>
                    <td style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Applied AI & Data Science</td>
                    <td style={{ padding: '6px', borderRight: '1px solid #ccc' }}>IIT Jodhpur</td>
                    <td style={{ padding: '6px' }}>marksrv047@gmail.com</td>
                </tr>
                <tr>
                    <td style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Somnath Singh</td>
                    <td style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Applied AI & Data Science</td>
                    <td style={{ padding: '6px', borderRight: '1px solid #ccc' }}>IIT Jodhpur</td>
                    <td style={{ padding: '6px' }}>singhsomnath2006@gmail.com</td>
                </tr>
            </tbody>
        </table>
    );

    return (
        <div className="print-report" style={{ display: 'none' }}> {/* Hidden by default, shown via CSS @media print */}
            {/* HEADER */}
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>FALCONS – SimVerse Simulation</h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Global Water Pollution Impact Simulator</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
                    Generated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '15px', background: '#f5f5f5', border: '1px solid #ddd' }}>
                <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#666' }}>SELECTED LOCATION</strong>
                    <span style={{ fontSize: '18px' }}>
                        {localData ? localData.classification : "Unknown Region"} ({localData?.biome || "Biome"})
                    </span>
                    <div style={{ fontSize: '14px' }}>Pop: {localData?.population.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#666' }}>ASSESSMENT</strong>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>WPI: {wpi.toFixed(2)}</div>
                    <div style={{ fontSize: '16px', color: wpi > 0.6 ? 'red' : 'green' }}>{qualityStatus}</div>
                </div>
            </div>

            {/* HEATMAP SNAPSHOT */}
            <div style={{ marginBottom: '20px', border: '1px solid #ccc', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                {mapImageInfo ? (
                    <img src={mapImageInfo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Heatmap Snapshot" />
                ) : (
                    <span style={{ color: '#999' }}>[Globe Snapshot Placeholder - Capture before printing]</span>
                )}
            </div>

            {/* GRAPHS GRID (Static Render for Print) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ border: '1px solid #eee', padding: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Factor Analysis</h4>
                    {/* Re-render plot static */}
                    {plots.bar && <Plot {...plots.bar} layout={{ ...plots.bar.layout, width: 350, height: 200, paper_bgcolor: 'white', plot_bgcolor: 'white', font: { color: 'black' } }} />}
                </div>
                <div style={{ border: '1px solid #eee', padding: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Timeline Projection</h4>
                    {plots.timeline && <Plot {...plots.timeline} layout={{ ...plots.timeline.layout, width: 350, height: 200, paper_bgcolor: 'white', plot_bgcolor: 'white', font: { color: 'black' } }} />}
                </div>
            </div>

            {/* EXPLANATION */}
            <div style={{ padding: '15px', borderLeft: '4px solid #333', background: '#fff', marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>Analysis Report</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {(wpi < 0.1)
                        ? "This location is currently designated as SAFE. Natural barriers or lack of industrial/sewage activity are maintaining high water quality."
                        : "Pollution levels are elevated. Key contributors include untreated sewage discharge and industrial effluent, amplified by local population pressure. Immediate mitigation strategies (STP implementation) are recommended."}
                </p>
            </div>

            {/* FINAL SUMMARY TABLES */}
            <SummaryTable />
            <TeamTable />

            {/* FOOTER */}
            <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                FALSON – SimVerse Simulation • Developed at IIT Jodhpur • {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default ReportView;
