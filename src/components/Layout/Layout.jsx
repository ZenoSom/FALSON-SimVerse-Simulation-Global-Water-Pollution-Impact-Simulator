import React, { useState } from 'react';
import './Layout.css';
import { useSimulation } from '../../context/SimulationContext';

const Layout = ({ leftPanel, rightPanel, mainContent, footer }) => {
    const { params, wpi, localData, qualityStatus, sewageTreatment, industryType, plotsData, mitigationPlan } = useSimulation();

    const handlePrint = async () => {
        const printRoot = document.getElementById('print-root');
        if (!printRoot) {
            alert("Print System Error: #print-root missing");
            return;
        }

        const printBtn = document.getElementById('print-btn');
        if (printBtn) printBtn.innerText = "Loading Plotly...";

        // Dynamic Import to prevent Main Bundle bloat/crash
        let MainPlotly;
        try {
            const module = await import('plotly.js-dist-min');
            MainPlotly = module.default || module;
        } catch (e) {
            console.error("Plotly Load Failed", e);
            alert("Failed to load Plotly for printing. Please try again.");
            if (printBtn) printBtn.innerText = "Error (Retry)";
            return;
        }

        // 1. Cleanup & Reset
        printRoot.innerHTML = '';
        if (printBtn) printBtn.innerText = "Generating Report...";

        try {
            // 2. Heatmap Snapshot - REMOVED per user request
            // (step skipped)

            // 3. Generate Graph Images (Off-screen)
            const graphWidth = 900;
            const graphHeight = 300;
            const commonLayout = {
                paper_bgcolor: 'white',
                plot_bgcolor: 'white',
                font: { color: 'black', size: 14 }
            };

            // Bar Chart
            const barFig = {
                data: [{
                    x: plotsData.barData.x,
                    y: plotsData.barData.y,
                    type: 'bar',
                    marker: { color: ['#3b82f6', '#a855f7', '#10b981'] }
                }],
                layout: { ...commonLayout, title: 'Pollution Source Contributions', width: graphWidth, height: graphHeight }
            };

            // Timeline Chart
            const timelineFig = {
                data: [{
                    x: plotsData.timelineData.x,
                    y: plotsData.timelineData.y,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: '#f59e0b' },
                    line: { shape: 'spline', width: 3 }
                }],
                layout: { ...commonLayout, title: '20-Year WPI Projection', width: graphWidth, height: graphHeight }
            };

            // Population Density V WPI (Scatter)
            const scatterFig = {
                data: [
                    {
                        x: plotsData.scatterData.x,
                        y: plotsData.scatterData.y,
                        mode: 'markers',
                        type: 'scatter',
                        marker: { color: 'rgba(0,0,0,0.2)', size: 8 },
                        name: 'Regional'
                    },
                    {
                        x: [localData?.population / 314 || 0],
                        y: [wpi],
                        mode: 'markers',
                        type: 'scatter',
                        marker: { color: '#ef4444', size: 14, line: { color: 'black', width: 2 } },
                        name: 'Selected'
                    }
                ],
                layout: { ...commonLayout, title: 'Regional Density Analysis', width: graphWidth, height: graphHeight, showlegend: false }
            };

            // Generate Blobs/Base64
            // We use the imported Plotly to generate images
            const barImg = await MainPlotly.toImage(barFig, { format: 'png', width: graphWidth, height: graphHeight });
            const timelineImg = await MainPlotly.toImage(timelineFig, { format: 'png', width: graphWidth, height: graphHeight });
            const scatterImg = await MainPlotly.toImage(scatterFig, { format: 'png', width: graphWidth, height: graphHeight });

            // 4. Construct HTML Content
            const dateStr = new Date().toLocaleString();

            const htmlContent = `
                <div style="font-family: sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto;">
                    
                    <!-- HEADER -->
                    <div style="border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: end;">
                        <div>
                            <h1 style="margin: 0; font-size: 32px; color: #111;">FALCONS – SimVerse Simulation</h1>
                            <p style="margin: 5px 0 0; font-size: 16px; color: #666;">Global Water Pollution Impact Simulator</p>
                        </div>
                        <div style="text-align: right; color: #555; font-size: 14px;">
                            Report Generated: ${dateStr}
                        </div>
                    </div>

                    <!-- METRICS GRID -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border: 1px solid #ddd;">
                        <div>
                            <h3 style="margin: 0 0 10px; color: #444; font-size: 14px; text-transform: uppercase;">Location Analysis</h3>
                            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">
                                ${localData?.classification || "Unknown"} <span style="font-weight: normal; font-size: 18px; color: #666;">(${localData?.biome || "Biome"})</span>
                            </div>
                            <div style="font-size: 16px;">Population: <strong>${localData?.population?.toLocaleString() || 0}</strong></div>
                        </div>
                        <div style="text-align: right; border-left: 2px solid #ddd; padding-left: 40px;">
                            <h3 style="margin: 0 0 10px; color: #444; font-size: 14px; text-transform: uppercase;">Quality Assessment</h3>
                            <div style="font-size: 36px; font-weight: bold; color: ${wpi > 0.6 ? '#dc2626' : wpi < 0.3 ? '#16a34a' : '#d97706'}; margin-bottom: 5px;">
                                WPI: ${wpi.toFixed(2)}
                            </div>
                            <div style="font-size: 18px; font-weight: 500;">${qualityStatus}</div>
                        </div>
                    </div>

                    <!-- HEATMAP REMOVED -->

                    <!-- GRAPHS -->
                    <div style="display: grid; grid-template-columns: 1fr; gap: 30px; margin-bottom: 40px;">
                        <div style="border: 1px solid #eee;">
                             <img src="${barImg}" style="width: 100%; height: auto;" alt="Bar Chart" />
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="border: 1px solid #eee;">
                                <img src="${timelineImg}" style="width: 100%; height: auto;" alt="Timeline" />
                            </div>
                             <div style="border: 1px solid #eee;">
                                <img src="${scatterImg}" style="width: 100%; height: auto;" alt="Scatter" />
                            </div>
                        </div>
                    </div>

                    <!-- AI RECOMMENDATIONS -->
                    <div style="margin-bottom: 40px; padding: 20px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px;">
                        <h3 style="margin: 0 0 10px; color: #1e3a8a; font-size: 16px;">🤖 AI-Recommended Mitigation Actions</h3>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #333;">
                            ${mitigationPlan.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>

                    <!-- SUMMARY TABLES -->
                    <div style="margin-top: 50px;">
                        <h3 style="background: #333; color: white; padding: 10px; margin: 0;">📊 PROJECT & ANALYSIS SUMMARY</h3>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #333; font-size: 14px;">
                            <tbody>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold; width: 40%;">Project Name</td><td style="padding: 8px;">FALCONS – SimVerse Simulation</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Simulation Title</td><td style="padding: 8px;">Global Water Pollution Impact Simulator</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Selected Place</td><td style="padding: 8px;">${localData?.classification || "N/A"}</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Area Type</td><td style="padding: 8px;">${localData?.biome || "N/A"}</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Population</td><td style="padding: 8px;">${localData?.population?.toLocaleString() || 0}</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Population Density</td><td style="padding: 8px;">${(localData?.population / 314).toFixed(1)} /km²</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Sewage (Untreated %)</td><td style="padding: 8px;">${((params?.sewageDropping || 0) * 100).toFixed(0)}%</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Industry Type</td><td style="padding: 8px;">${industryType}</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">WPI Score</td><td style="padding: 8px;">${wpi.toFixed(3)}</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Status</td><td style="padding: 8px;">${qualityStatus}</td></tr>
                                <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold;">Dominant Cause</td><td style="padding: 8px;">${(params?.sewageDropping * 0.45 > params?.industrialDensity * 0.35) ? 'Sewage' : 'Industry'}</td></tr>
                            </tbody>
                        </table>

                        <h3 style="background: #333; color: white; padding: 10px; margin: 30px 0 0;">👥 DEVELOPED BY</h3>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #333; font-size: 14px;">
                            <thead>
                                <tr style="background: #f0f0f0;">
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #333;">Name</th>
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #333;">Branch</th>
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #333;">Institute</th>
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #333;">Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 8px;">Shubham Sharma</td>
                                    <td style="padding: 8px;">Applied AI & Data Science</td>
                                    <td style="padding: 8px;">IIT Jodhpur</td>
                                    <td style="padding: 8px;">marksrv047@gmail.com</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px;">Somnath Singh</td>
                                    <td style="padding: 8px;">Applied AI & Data Science</td>
                                    <td style="padding: 8px;">IIT Jodhpur</td>
                                    <td style="padding: 8px;">singhsomnath2006@gmail.com</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            printRoot.innerHTML = htmlContent;

            // 5. Trigger Print
            if (printBtn) printBtn.innerText = "🖨️ Print Report";
            window.print();

            // 6. Cleanup (Optional, strict mode kept it cleaner for debugging)
            // printRoot.innerHTML = ''; 

        } catch (e) {
            console.error("Print Generation Failed:", e);
            alert("Failed to generate report: " + e.message);
            if (printBtn) printBtn.innerText = "Error (Retry)";
        }
    };

    return (
        <div className="layout-container">
            {/* Main Application UI */}
            <main className="main-content">
                <div className="globe-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {mainContent}

                    {/* Fixed Print Button */}
                    <button
                        id="print-btn"
                        onClick={handlePrint}
                        title="Generate Printable Report"
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '340px',
                            zIndex: 9999,
                            background: '#2563eb',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>🖨️ Print Report</span>
                    </button>
                </div>
            </main>

            {/* Side Panels */}
            <aside className="panel left-panel glass-panel">
                {leftPanel}
            </aside>

            <aside className="panel right-panel glass-panel">
                {rightPanel}
            </aside>

            {/* Footer */}
            <footer className="footer glass-panel">
                {footer}
            </footer>
        </div>
    );
};

export default Layout;
