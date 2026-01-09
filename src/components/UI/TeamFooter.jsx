import React from 'react';

const TeamFooter = () => {
    return (
        <div className="team-footer" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>FALCONS – SimVerse Simulation</strong>
            </div>
            <div style={{ opacity: 0.9 }}>
                <span style={{ fontWeight: 600 }}>Developed By:</span>
                <span style={{ margin: '0 8px' }}>Shubham Sharma (marksrv047@gmail.com)</span>
                <span style={{ margin: '0 8px' }}>|</span>
                <span style={{ margin: '0 8px' }}>Somnath Singh (singhsomnath2006@gmail.com)</span>
            </div>
            <div style={{ opacity: 0.6, fontSize: '0.75rem', marginTop: '2px' }}>
                Applied AI and Data Science | IIT Jodhpur
            </div>
        </div>
    );
};

export default TeamFooter;
