import React from 'react';
import './PublicNavbar.css';

function PublicNavbar() {
    return (
        <nav className="public-navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <div className="logo-icon">
                        <img src="/logo.png" alt="Feedback Hub Logo" width="48" height="48" style={{ borderRadius: '8px' }} />
                    </div>
                    <span className="brand-text">
                        Feedback Hub
                    </span>
                </div>
            </div>
        </nav>
    );
}

export default PublicNavbar;
