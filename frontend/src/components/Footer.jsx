import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>
                    <span style={{ color: "white" }}>Copyright © 2025 Feedback Hub |</span>
                    <a href="#" className="footer-link"> Privacy Policy </a> |
                    <a href="#" className="footer-link"> Terms of Use </a>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
