import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    // Remove auth details but KEEP theme settings
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('employeeId');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo-icon">
            <img src="/logo.png" alt="Feedback Hub Logo" width="48" height="48" style={{ borderRadius: '8px' }} />
          </div>
          <span className="brand-text">
            Feedback Hub
          </span>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{name}</span>
            <span className="user-role badge badge-info">{role}</span>
          </div>
          {role === 'ADMINISTRATOR' && (
            <button onClick={() => navigate('/administrator/users')} className="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12.93 11.93A6.96 6.96 0 008 10a6.96 6.96 0 00-4.93 1.93A7.96 7.96 0 008 16a7.96 7.96 0 004.93-4.07z" />
                <path d="M14 5a1 1 0 011 1v1a1 1 0 11-2 0V6a1 1 0 011-1zM14 9a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
              </svg>
              Work as Administrator
            </button>
          )}
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-logout btn-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1a2 2 0 00-2 2v10a2 2 0 002 2h4a1 1 0 010 2H3a4 4 0 01-4-4V3a4 4 0 014-4h4a1 1 0 010 2H3z" />
              <path d="M11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L12.586 9H6a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
