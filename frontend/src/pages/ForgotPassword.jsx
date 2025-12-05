import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './Login.css'; // Reuse login styles

import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

function ForgotPassword() {
    const [employeeId, setEmployeeId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await API.post('/auth/forgot-password', { employeeId });
            setMessage('If an account exists with this ID, a password reset link has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <PublicNavbar />
            <div className="bg-gradient-orb orb-1"></div>
            <div className="bg-gradient-orb orb-2"></div>

            <div className="login-content fade-in">
                <div className="login-header">
                    <h1 className="login-title">Reset Password</h1>
                    <p className="login-subtitle">Enter your Employee ID to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form glass">
                    <div className="input-group">
                        <label htmlFor="employeeId">Employee ID</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            <input
                                id="employeeId"
                                type="text"
                                className="input input-with-icon"
                                placeholder="Enter your Employee ID"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="success-message fade-in" style={{
                            padding: '0.75rem 1rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '0.5rem',
                            color: '#34d399',
                            fontSize: '0.875rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.043l4.25-5.5z" clipRule="evenodd" />
                            </svg>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message fade-in">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="form-footer">
                        <button type="button" className="link-button" onClick={() => navigate('/')}>
                            Back to Login
                        </button>
                    </div>
                </form>

                <Footer />
            </div>
        </div>
    );
}

export default ForgotPassword;
