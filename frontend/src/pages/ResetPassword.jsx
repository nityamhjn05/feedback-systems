import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import './Login.css'; // Reuse login styles

import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const navigate = useNavigate();
    const { token } = useParams();

    useEffect(() => {
        // Verify token on load
        const verifyToken = async () => {
            try {
                await API.get(`/auth/verify-reset-token/${token}`);
                setVerifying(false);
            } catch (err) {
                setError('Invalid or expired reset token. Please request a new one.');
                setVerifying(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await API.post('/auth/reset-password', { token, newPassword: password });
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="login-container">
                <PublicNavbar />
                <div className="login-content fade-in" style={{ textAlign: 'center', color: 'white' }}>
                    <svg className="spinner" width="40" height="40" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="50.265" strokeDashoffset="25" />
                    </svg>
                    <p style={{ marginTop: '1rem' }}>Verifying link...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="login-container">
            <PublicNavbar />
            <div className="bg-gradient-orb orb-1"></div>
            <div className="bg-gradient-orb orb-3"></div>

            <div className="login-content fade-in">
                <div className="login-header">
                    <h1 className="login-title">Set New Password</h1>
                    <p className="login-subtitle">Create a new secure password for your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form glass">
                    <div className="input-group">
                        <label htmlFor="password">New Password</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <input
                                id="password"
                                type="password"
                                className="input input-with-icon"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading || !!message}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input input-with-icon"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading || !!message}
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

                    {!message && (
                        <button type="submit" className="btn btn-primary btn-login" disabled={loading || !!error}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    )}

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

export default ResetPassword;
