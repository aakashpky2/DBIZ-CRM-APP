import React from 'react';

const Home = () => {
    return (
        <>
            {/* Hero Section with Hex Grid */}
            <section className="hero-section">
                <div className="hex-pattern">
                    <div className="hex-grid-container">
                        <div className="hex-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=300)' }}></div>
                        <div className="hex-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=300)' }}></div>
                        <div className="hex-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=300)' }}></div>
                        <div className="hex-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300)' }}></div>
                        <div className="hex-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300)' }}></div>
                        <div className="hex-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=300)' }}></div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
