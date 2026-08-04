import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './MyProfile.css'; // Design stylesheet

const MyProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Accordion toggles
  const [directorsOpen, setDirectorsOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [coreOpen, setCoreOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        const username = localStorage.getItem('gst_username') || localStorage.getItem('username') || 'gst1234';
        const res = await api.post('/auth/profile', { username });
        
        if (res.data.success && res.data.data) {
          setProfileData(res.data.data);
        } else {
          setError('Profile details not found.');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch profile data from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="profile-page">
      {/* Breadcrumbs */}
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link> › My Profile
      </div>

      <div className="profile-layout">
        {/* Left Side: Quick Links Card */}
        <aside className="quick-links-card">
          <h3>Quick Links</h3>
          <ul className="quick-links-list">
            <li><a href="#">History of Amendment</a></li>
            <li><Link to="/change-password">Change Password</Link></li>
            <li><a href="#">Manage API Access</a></li>
            <li><a href="#">Register / Update DSC</a></li>
            <li><a href="#">Activate / Deactivate STAK</a></li>
            <li><Link to="/aadhaar-authentication">Aadhaar Authentication Status</Link></li>
            <li><a href="#">My Registration Certificate</a></li>
            <li><a href="#">Core Business Activity Status</a></li>
            <li><a href="#">Bank Account Status</a></li>
          </ul>
        </aside>

        {/* Right Side: Main Content Panel */}
        <main className="profile-main-panel">
          {/* Top Horizontal Menu Tabs */}
          <ul className="profile-tabs">
            <li className="tab-item active">Profile</li>
            <li className="tab-item">Place of Business</li>
            <li className="tab-item">Geocoded Places of Business</li>
            <li className="tab-item">Address and Contacts</li>
            <li className="tab-item">Other Business</li>
          </ul>

          {/* Details Content Area */}
          <div className="profile-details-box">
            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>Fetching profile details from secure database...</p>
              </div>
            )}

            {error && !loading && (
              <div className="alert alert-danger">
                ⚠️ {error}
              </div>
            )}

            {profileData && !loading && (
              <>
                {/* 3-Column details layout matching GST portal */}
                <div className="details-grid">
                  <div className="grid-field">
                    <span className="field-label">GSTIN / UIN / Temporary ID</span>
                    <span className="field-value">{profileData.gstin}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Legal Name of Business</span>
                    <span className="field-value">{profileData.legal_name}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Trade Name</span>
                    <span className="field-value">{profileData.trade_name || 'N/A'}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Centre Jurisdiction</span>
                    <span className="field-value">{profileData.centre_jurisdiction}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">State Jurisdiction</span>
                    <span className="field-value">{profileData.state_jurisdiction}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Date of Registration</span>
                    <span className="field-value">{profileData.date_of_registration}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Constitution of Business</span>
                    <span className="field-value">{profileData.constitution_of_business}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Taxpayer Type</span>
                    <span className="field-value">{profileData.taxpayer_type}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">GSTIN / UIN / Temporary ID Status</span>
                    <span className="field-value">
                      <span className="status-active">{profileData.status}</span>
                    </span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Compliance Rating</span>
                    <span className="field-value" style={{ color: '#15803d' }}>{profileData.compliance_rating}</span>
                  </div>

                  <div className="grid-field">
                    <span className="field-label">Field Visit Conducted?</span>
                    <span className="field-value">{profileData.field_visit_conducted}</span>
                  </div>
                </div>

                {/* Accordion 1: Directors details */}
                <div className="accordion-container">
                  <div 
                    className={`accordion-header ${directorsOpen ? 'open' : ''}`}
                    onClick={() => setDirectorsOpen(!directorsOpen)}
                  >
                    <span>Name of the Proprietor / Director(s) / Partner(s) / Promoter(s)</span>
                    <span className="accordion-icon">{directorsOpen ? '▲' : '▼'}</span>
                  </div>
                  {directorsOpen && (
                    <div className="accordion-content">
                      <ul className="details-list">
                        {profileData.directors && profileData.directors.map((name, i) => (
                          <li key={i}><strong>{name}</strong> - Authorized Signatory / Executive Partner</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Nature of Business Activities */}
                <div className="accordion-container">
                  <div 
                    className={`accordion-header ${activitiesOpen ? 'open' : ''}`}
                    onClick={() => setActivitiesOpen(!activitiesOpen)}
                  >
                    <span>Nature of Business Activities</span>
                    <span className="accordion-icon">{activitiesOpen ? '▲' : '▼'}</span>
                  </div>
                  {activitiesOpen && (
                    <div className="accordion-content">
                      <ul className="details-list">
                        {profileData.business_activities && profileData.business_activities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Nature of Core Business Activity */}
                <div className="accordion-container">
                  <div 
                    className={`accordion-header ${coreOpen ? 'open' : ''}`}
                    onClick={() => setCoreOpen(!coreOpen)}
                  >
                    <span>Nature Of Core Business Activity</span>
                    <span className="accordion-icon">{coreOpen ? '▲' : '▼'}</span>
                  </div>
                  {coreOpen && (
                    <div className="accordion-content">
                      <p style={{ margin: 0 }}>
                        Core business activity selected by taxpayer: <strong>{profileData.core_business_activity}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;
