import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const GstLaw = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await api.get('/gst-law/active');
                if (response.data.success) {
                    setLinks(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching GST Law links:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, []);

    // Split links into 3 columns
    const numColumns = 3;
    const itemsPerColumn = Math.ceil(links.length / numColumns);
    const columns = [];
    for (let i = 0; i < numColumns; i++) {
        columns.push(links.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 80px', minHeight: 'calc(100vh - 200px)' }}>
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <span style={{ color: '#4b5563' }}>Home</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>GST LAW</span>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    GST LAW
                </h2>

                <div style={{ 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    marginBottom: '30px', 
                    backgroundColor: '#fff', 
                    color: '#333', 
                    fontSize: '14px', 
                    lineHeight: '1.6' 
                }}>
                    "Act, Rule, Amendment, Notifications, etc. relating to GST Law issued by Central and/or State Government may be accessed from the websites of Centre and State respectively through the links provided below."
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading links...</div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '30px', 
                        marginBottom: '40px',
                        padding: '0 20px'
                    }}>
                        {columns.map((colLinks, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {colLinks.map((link) => (
                                    <a 
                                        key={link.id} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            color: '#0056b3', 
                                            textDecoration: 'none', 
                                            fontSize: '14px', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            transition: 'text-decoration 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                    >
                                        {link.name}
                                        <svg style={{ marginLeft: '6px', width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    backgroundColor: '#fff', 
                    color: '#333', 
                    fontSize: '13px', 
                    lineHeight: '1.6' 
                }}>
                    <strong>GST Law* :</strong> GST Law comprising<br/>
                    (i) Central Goods and Services Tax Act, 2017,<br/>
                    (ii) State Goods and Services Tax Act, 2017,<br/>
                    (iii) Union Territory Goods and Services Tax Act, 2017,<br/>
                    (iv) Integrated Goods and Services Tax Act, 2017,<br/>
                    (v) Goods and Services Tax (Compensation to States) Act, 2017,<br/>
                    (vi) Rules, Notifications, Amendments and Circulars issued under the respective Acts.
                </div>
            </div>
        </div>
    );
};

export default GstLaw;
