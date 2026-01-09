import React from 'react';
import { X } from 'lucide-react';

const FeatureGuide = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                color: '#e2e8f0',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="prose prose-invert" style={{ lineHeight: '1.6' }}>
                    <h1 style={{ color: '#3b82f6', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginTop: 0 }}>
                        🦅 FALCONS – SimVerse: The Ultimate Guide
                    </h1>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: '#60a5fa' }}>🌟 1. The "Big Idea"</h2>
                        <p><strong>"Digital Twin for Earth's Water Crisis"</strong>: A living, breathing simulation. See, touch, and predict how human actions destroy or save water resources in real-time.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: '#60a5fa' }}>🎮 2. Interactive 3D World</h2>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li><strong>Infinite 3D Globe:</strong> Spin, zoom, and explore anywhere (CesiumJS).</li>
                            <li><strong>Smart Biome Detection:</strong>
                                <ul>
                                    <li>Mumbai → "Urban Megacity" (High Impact)</li>
                                    <li>Sahara → "Desert" (Uninhabited)</li>
                                    <li>Pacific Ocean → "Water" (Zero Pop)</li>
                                </ul>
                            </li>
                            <li><strong>Glassmorphism UI:</strong> Sci-fi "Iron Man" style interface.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: '#60a5fa' }}>🧮 3. Simulation Engine (The Brain)</h2>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li><strong>WPI (Water Pollution Index):</strong> 0.0 (Pure) to 1.0 (Toxic).</li>
                            <li><strong>What-If Scenarios:</strong> Change sliders (e.g., treat 50% sewage) and watch WPI drop.</li>
                            <li><strong>Projections:</strong> 20-year timeline graph.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: '#60a5fa' }}>🤖 4. AI & Smart Tech</h2>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li><strong>AI Mitigation:</strong> "Too much chemical waste?" → AI suggests "Zero Liquid Discharge (ZLD)".</li>
                            <li><strong>Real-World Data (OSM):</strong> Toggle to find <em>actual</em> factories near you using OpenStreetMap.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: '#60a5fa' }}>📊 5. Professional Reporting</h2>
                        <p>Generate a PDF <strong>"Environmental Impact Statement"</strong> with one click. Includes graphs, coordinates, and AI plans.</p>
                    </section>

                    <section style={{ marginBottom: '0' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>🗣️ Elevator Pitch</h3>
                            <p style={{ margin: 0, fontStyle: 'italic' }}>
                                "SimVerse is a 3D simulation tool that lets anyone check the water pollution level of any place on Earth. It uses satellite data logic to detect population and geography, calculates a toxicity score in real-time, and uses AI to recommend engineering solutions. It's like 'SimCity' but for saving the planet."
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FeatureGuide;
