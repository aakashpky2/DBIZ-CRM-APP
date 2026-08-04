import React from 'react';
import { Link } from 'react-router-dom';
import './Logout.css';

const Logout = () => {
    return (
        <div className="logout-wrapper">
            <div className="logout-breadcrumb">Home</div>
            <div className="logout-page">
                <div className="logout-box">
                    <div className="lock-icon-container">
                        <div className="lock-icon">
                            <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    </div>
                    <h2 className="logout-message">You have successfully logged out of GST Portal.</h2>
                    <p className="logout-subtext">
                        Click <Link to="/login" className="login-link">here</Link> to login again. You are requested to close this page for security reasons.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Logout;
