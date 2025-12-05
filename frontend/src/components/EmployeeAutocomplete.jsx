import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import './EmployeeAutocomplete.css';

function EmployeeAutocomplete({ selectedEmployees, onSelectionChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    // Debounced search
    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await API.get(`/admin/employees/search?q=${encodeURIComponent(searchTerm)}`);
                // Filter out already selected employees
                const filtered = res.data.employees.filter(
                    emp => !selectedEmployees.find(sel => sel.employeeId === emp.employeeId)
                );
                setSearchResults(filtered);
                setShowDropdown(filtered.length > 0);
                setHighlightedIndex(-1);
            } catch (err) {
                console.error('Search error:', err);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, selectedEmployees]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectEmployee = (employee) => {
        onSelectionChange([...selectedEmployees, employee]);
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleRemoveEmployee = (employeeId) => {
        onSelectionChange(selectedEmployees.filter(emp => emp.employeeId !== employeeId));
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
                    handleSelectEmployee(searchResults[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSearchTerm('');
                break;
            default:
                break;
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'ADMINISTRATOR': return 'role-badge role-administrator';
            case 'ADMIN': return 'role-badge role-admin';
            case 'USER': return 'role-badge role-user';
            default: return 'role-badge';
        }
    };

    return (
        <div className="employee-autocomplete" ref={dropdownRef}>
            <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or Employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                />
                {loading && (
                    <svg className="loading-spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="50.265" strokeDashoffset="25" />
                    </svg>
                )}
            </div>

            {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                    {searchResults.map((employee, index) => (
                        <div
                            key={employee.employeeId}
                            className={`dropdown-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                            onClick={() => handleSelectEmployee(employee)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <div className="employee-info">
                                <span className="employee-name">{employee.name}</span>
                                <span className="employee-id">({employee.employeeId})</span>
                            </div>
                            <span className={getRoleBadgeClass(employee.role)}>{employee.role}</span>
                        </div>
                    ))}
                </div>
            )}

            {selectedEmployees.length > 0 && (
                <div className="selected-employees">
                    <div className="selected-label">Selected ({selectedEmployees.length}):</div>
                    <div className="employee-chips">
                        {selectedEmployees.map(employee => (
                            <div key={employee.employeeId} className="employee-chip">
                                <span className="chip-text">
                                    {employee.name} ({employee.employeeId})
                                </span>
                                <button
                                    type="button"
                                    className="chip-remove"
                                    onClick={() => handleRemoveEmployee(employee.employeeId)}
                                    aria-label={`Remove ${employee.name}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeAutocomplete;
