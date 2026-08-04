import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NewUserLogin = () => {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link> &gt; New User Login
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h2>New User Login</h2>
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

                    <div className="form-group">
                        <label>Password <span className="red-dot">*</span></label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter Password"
                        />
                    </div>

                    <button type="submit" className="btn-login-submit">LOGIN</button>

                    <div className="first-time-login">
                        <p>
                            <span className="info-icon-dark">ⓘ</span> <strong>Existing User:</strong> If you have already created your Username and Password, click <Link to="/login" className="link-blue">here</Link> to log In.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewUserLogin;
