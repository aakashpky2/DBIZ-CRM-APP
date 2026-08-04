import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './ChangePassword.css'; // Design stylesheet

const ChangePassword = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Basic validations
    if (!oldPassword) {
      setError('Old password is required.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    // 2. Length check (8 to 15)
    if (newPassword.length < 8 || newPassword.length > 15) {
      setError('Password should be of 8 to 15 characters.');
      return;
    }

    // 3. Password complexity checks
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError(
        'Password should contain at least one number, one special character, letters, at least one uppercase and lowercase.'
      );
      return;
    }

    // 4. Password match checks
    if (newPassword !== confirmPassword) {
      setError('New Password and Re-confirm Password do not match.');
      return;
    }

    // 5. Get current username from localStorage
    const username = localStorage.getItem('gst_username') || localStorage.getItem('username');
    if (!username) {
      setError('Session expired. Please login again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        username,
        oldPassword,
        newPassword
      });

      if (res.data.success) {
        setSuccess('Password changed successfully! Redirecting you to login...');
        
        // Log out user for security after 2 seconds
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2500);
      } else {
        setError(res.data.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Old password is incorrect.');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-pwd-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div className="panel">
        {/* Header containing title and mandatory indicators */}
        <div className="form-header">
          <h2 className="form-title">Change Password</h2>
          <div className="mandatory-note">
            <span className="mandatory-bullet">●</span> indicates mandatory fields
          </div>
        </div>

        {/* Display Alert Messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Compact Aligned Form Container */}
        <form className="form-container" onSubmit={handleSubmit}>
          {/* Old Password */}
          <div className="form-group">
            <label htmlFor="oldPassword">
              Old Password
              <span className="red-star">*</span>
            </label>
            <input
              id="oldPassword"
              type="password"
              className="form-input"
              placeholder="Enter old Password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              autoFocus
            />
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">
              New Password
              <span className="red-star">*</span>
            </label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          {/* Re-confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Re-confirm Password
              <span className="red-star">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Re-enter New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Rules/Hint Box */}
          <div className="password-note-box">
            <span className="info-icon">ℹ</span>
            <div>
              Password should be of 8 to 15 characters (where the <strong>minimum length</strong> is 8 characters and <strong>maximum length</strong> is 15 characters) which should comprise of at least one number, special character and letters( at least one upper and lower case)
            </div>
          </div>

          {/* Action button */}
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? 'Please Wait...' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
