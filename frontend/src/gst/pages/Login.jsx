import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showTempLoginAlert, setShowTempLoginAlert] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();
            const response = await api.post('/auth/login', { username: trimmedUsername, password: trimmedPassword });
            const { token, user } = response.data;
            const actualTrn = user?.trn || trimmedUsername;

            // Store token and user details in localStorage
            localStorage.setItem('gst_token', token);
            localStorage.setItem('gst_trn', actualTrn);
            localStorage.setItem('trn', actualTrn);
            localStorage.setItem('username', user?.username || trimmedUsername);
            localStorage.setItem('gst_legal_name', user?.legal_name || '');
            localStorage.setItem('gst_pan', user?.pan || '');
            localStorage.setItem('gst_state', user?.state || '');
            
            // Redirect to dashboard
            navigate('/dashboard');

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Invalid username or password';
            if (errorMsg.includes('Invalid temporary username')) {
                setShowTempLoginAlert(true);
                setError('');
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link> &gt; Login
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h2>Login</h2>
                    <span className="mandatory-label">
                        <span className="red-dot">●</span> indicates mandatory fields
                    </span>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username <span className="red-dot">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password <span className="red-dot">*</span></label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>



                    <button type="submit" className="btn-login-submit" disabled={loading}>
                        {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>


                    <div className="login-footer-links">
                        <Link to="/forgot-username" className="link-blue">Forgot Username</Link>
                        <Link to="/forgot-password" className="link-blue">Forgot Password</Link>
                    </div>

                    <div className="first-time-login">
                        <p>
                            <span className="info-icon-dark">ⓘ</span> <strong>First time login:</strong> If you are logging in for the first time, click <Link to="/new-login" className="link-blue">here</Link> to log in.
                        </p>
                    </div>
                </form>
            </div>

            {showTempLoginAlert && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '24px', borderRadius: '12px',
                        width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', background: '#fee2e2', color: '#dc2626',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '24px', margin: '0 auto 16px'
                        }}>!</div>
                        <h3 style={{ color: '#1e293b', marginTop: 0, marginBottom: '12px', fontSize: '20px' }}>Login Failed</h3>
                        <p style={{ color: '#475569', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
                            Invalid temporary username or password. Please use the temporary username and password generated after registration.
                        </p>
                        <button 
                            onClick={() => setShowTempLoginAlert(false)}
                            style={{
                                width: '100%', padding: '12px', background: '#1a3a6e', color: 'white',
                                border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
