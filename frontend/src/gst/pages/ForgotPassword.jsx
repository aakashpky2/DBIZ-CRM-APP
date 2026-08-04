import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './ForgotPassword.css'; // design stylesheet

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1 – Validate & check username, then generate OTP
  const handleGenerateOtp = async () => {
    setError('');
    setSuccess('');
    if (!username.trim()) { 
      setError('Username is required'); 
      return; 
    }

    setLoading(true);
    try {
      // 1. Check if user exists
      const chkRes = await api.post('/auth/check-username', { username: username.trim() });
      if (!chkRes.data.success) {
        setError(chkRes.data.message || 'Invalid username');
        setLoading(false);
        return;
      }
      
      // 2. User exists, generate a 6-digit OTP automatically
      const otpRes = await api.post('/auth/generate-forgot-otp', { username: username.trim() });
      if (otpRes.data.success) {
        setGeneratedOtp(otpRes.data.otp);
        setStep(2);
      } else {
        setError(otpRes.data.message || 'Failed to generate OTP');
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Invalid username. Please check your spelling and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 – Verify OTP
  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');
    if (!inputOtp.trim()) { 
      setError('OTP is required'); 
      return; 
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-forgot-otp', { 
        username: username.trim(), 
        otp: inputOtp.trim() 
      });
      if (res.data.success) {
        setStep(3);
      } else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Invalid OTP. Please enter the correct code shown.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 – Reset Password
  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');
    if (!newPassword || !confirmPassword) { 
      setError('Both password fields are required'); 
      return; 
    }
    if (newPassword !== confirmPassword) { 
      setError('Passwords do not match'); 
      return; 
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { 
        username: username.trim(), 
        newPassword 
      });
      if (res.data.success) {
        setSuccess('Password updated successfully! Redirecting you to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(res.data.message || 'Failed to update password');
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Server error occurred. Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Render Step Forms
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Forgot Password</h2>
              <div className="mandatory-note">
                <span className="mandatory-bullet">●</span> indicates mandatory fields
              </div>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">
                Username
                <span className="red-star">*</span>
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateOtp()}
                autoFocus
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn-submit" 
                onClick={handleGenerateOtp}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'GENERATE OTP'}
              </button>
              <Link to="/login" className="btn-back">
                BACK TO LOGIN
              </Link>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">OTP Verification</h2>
              <div className="mandatory-note">
                <span className="mandatory-bullet">●</span> indicates mandatory fields
              </div>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            {/* Show OTP for demo testing */}
            <div className="otp-display-box">
              Your system generated OTP is: <strong>{generatedOtp}</strong> (Use this to verify)
            </div>

            <div className="form-group">
              <label htmlFor="otp">
                Enter OTP
                <span className="red-star">*</span>
              </label>
              <input
                id="otp"
                type="text"
                className="form-input"
                placeholder="Enter OTP"
                value={inputOtp}
                onChange={e => setInputOtp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                autoFocus
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn-submit" 
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'VERIFY OTP'}
              </button>
              <button 
                className="btn-back" 
                onClick={() => { setStep(1); setError(''); }}
              >
                BACK
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">New Credentials</h2>
              <div className="mandatory-note">
                <span className="mandatory-bullet">●</span> indicates mandatory fields
              </div>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="newPassword">
                New Password
                <span className="red-star">*</span>
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
                <span className="red-star">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn-submit" 
                onClick={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'SUBMIT'}
              </button>
              <Link to="/login" className="btn-back">
                BACK TO LOGIN
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="forgot-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> › <Link to="/login">Login</Link> › Forgot Password
      </div>
      
      <div className="panel">
        {/* Progress Bar steps */}
        <div className="progress-bar-container">
          <div className="progress-line"></div>
          <div className="progress-steps">
            <div className={`circle-step ${step >= 1 ? 'active' : ''}`}>
              <div className="circle">1</div>
              <span className="step-label">User Credentials</span>
            </div>
            <div className={`circle-step ${step >= 2 ? 'active' : ''}`}>
              <div className="circle">2</div>
              <span className="step-label">OTP Verification</span>
            </div>
            <div className={`circle-step ${step >= 3 ? 'active' : ''}`}>
              <div className="circle">3</div>
              <span className="step-label">New Credentials</span>
            </div>
          </div>
        </div>

        {/* Step Contents */}
        {renderStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;
