import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotUsername = () => {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link> &gt; <Link to="/login">Login</Link> &gt; Forgot Username
            </div>

            <div className="registration-card">
                <div className="registration-steps-indicator">
                    <div className="step active">
                        <div className="step-number">1</div>
                        <div className="step-label">User Credentials</div>
                    </div>
                    <div className="step-line"></div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-label">OTP Verification</div>
                    </div>
                </div>

                <div className="login-header">
                    <h2>Forgot Username</h2>
                    <span className="mandatory-label">
                        <span className="red-dot">●</span> indicates mandatory fields
                    </span>
                </div>

                <form className="login-form">
                    <div className="form-group">
                        <label>Provisional ID / GSTIN / UIN <span className="red-dot">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter Provisional ID/GSTIN/UIN/GSTP ID/User ID"
                        />
                    </div>

                    <div className="forgot-username-buttons">
                        <button type="button" className="btn-generate-otp">GENERATE OTP</button>
                        <button
                            type="button"
                            className="btn-back-login"
                            onClick={() => navigate('/login')}
                        >
                            BACK TO LOGIN
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotUsername;
