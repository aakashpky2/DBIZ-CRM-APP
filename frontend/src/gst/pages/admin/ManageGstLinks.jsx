import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageGstLinks = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/gst-law/all');
            if (response.data.success) {
                setLinks(response.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName || !newUrl) return;

        try {
            const response = await api.post('/gst-law', { name: newName, url: newUrl, is_active: true });
            if (response.data.success) {
                setNewName('');
                setNewUrl('');
                fetchLinks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await api.put(`/gst-law/${id}`, { is_active: !currentStatus });
            if (response.data.success) {
                fetchLinks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this link?")) return;
        try {
            const response = await api.delete(`/gst-law/${id}`);
            if (response.data.success) {
                fetchLinks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#001b5c', borderBottom: '2px solid #1eb3a6', paddingBottom: '10px' }}>Manage GST Law Links (Admin)</h1>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
                <h3>Add New Link</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Name (State/Authority)</label>
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="e.g. Haryana" required />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>URL</label>
                        <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="https://..." required />
                    </div>
                    <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#0f4c81', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Link</button>
                </form>
            </div>

            {loading ? <p>Loading data...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0f4c81', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>URL</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map(link => (
                            <tr key={link.id} style={{ backgroundColor: '#fff' }}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{link.name}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '12px', 
                                        fontSize: '11px', 
                                        fontWeight: 'bold',
                                        backgroundColor: link.is_active ? '#dcfce7' : '#fee2e2',
                                        color: link.is_active ? '#15803d' : '#b91c1c'
                                    }}>
                                        {link.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <button onClick={() => toggleStatus(link.id, link.is_active)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '3px', backgroundColor: '#f1f5f9' }}>
                                        {link.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button onClick={() => handleDelete(link.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '3px' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageGstLinks;
