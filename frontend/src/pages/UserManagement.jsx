import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserManagement.css";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [currentUserId, setCurrentUserId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is administrator
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("employeeId");

        if (role !== "ADMINISTRATOR") {
            navigate("/admin");
            return;
        }

        setCurrentUserId(userId);
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await API.get("/administrator/users");
            setUsers(res.data.users);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, employeeId) => {
        if (!window.confirm(`Are you sure you want to delete user ${employeeId}?`)) {
            return;
        }

        try {
            await API.delete(`/administrator/users/${userId}`);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.patch(`/administrator/users/${userId}/role`, { role: newRole });
            setUsers(
                users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update role");
        }
    };

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadResult(null);
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please select a CSV file");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setUploading(true);
            const res = await API.post("/administrator/users/bulk-upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setUploadResult(res.data.results);
            setSelectedFile(null);
            fetchUsers(); // Refresh user list
        } catch (err) {
            alert(err.response?.data?.message || "Bulk upload failed");
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleCSV = () => {
        const csvContent = "employeeId,name,email,password\nEMP100,John Doe,john@company.com,Password@123\nEMP101,Jane Smith,jane@company.com,Password@123";
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample-employees.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="users-management">
            <div className="dashboard-container">
                <Navbar />

                <div className="dashboard-content">
                    <div className="page-header">
                        <div>
                            <h1>User Management</h1>
                            <p className="page-subtitle">Manage employee accounts and roles</p>
                        </div>
                        <button onClick={() => navigate("/admin")} className="btn btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Bulk Upload Section */}
                    <div className="card bulk-upload-section">
                        <h2>Bulk Employee Upload</h2>
                        <p className="section-description">
                            Upload a CSV file to add or update multiple employees at once
                        </p>

                        <div className="upload-area">
                            <form onSubmit={handleBulkUpload} className="upload-form">
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        id="csvFile"
                                        className="file-input"
                                    />
                                    <label htmlFor="csvFile" className="file-input-label">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                                        </svg>
                                        {selectedFile ? selectedFile.name : "Choose CSV File"}
                                    </label>
                                </div>

                                <div className="upload-actions">
                                    <button
                                        type="button"
                                        onClick={downloadSampleCSV}
                                        className="btn btn-secondary"
                                    >
                                        Download Sample CSV
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!selectedFile || uploading}
                                    >
                                        {uploading ? "Uploading..." : "Upload CSV"}
                                    </button>
                                </div>
                            </form>

                            {uploadResult && (
                                <div className="upload-result">
                                    <h3>Upload Results</h3>
                                    <div className="result-stats">
                                        <div className="stat-item stat-success">
                                            <span className="stat-label">Created:</span>
                                            <span className="stat-value">{uploadResult.created}</span>
                                        </div>
                                        <div className="stat-item stat-info">
                                            <span className="stat-label">Updated:</span>
                                            <span className="stat-value">{uploadResult.updated}</span>
                                        </div>
                                        <div className="stat-item stat-error">
                                            <span className="stat-label">Errors:</span>
                                            <span className="stat-value">{uploadResult.errors.length}</span>
                                        </div>
                                    </div>
                                    {uploadResult.errors.length > 0 && (
                                        <div className="error-list">
                                            <h4>Errors:</h4>
                                            {uploadResult.errors.map((err, idx) => (
                                                <div key={idx} className="error-item">
                                                    Row {err.row}: {err.error}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="card users-table-section">
                        <h2>All Users</h2>

                        {loading ? (
                            <div className="loading-state">
                                <svg className="spinner" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="100.53" strokeDashoffset="50" />
                                </svg>
                                <p>Loading users...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>{error}</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id}>
                                                <td>{user.employeeId}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email || "N/A"}</td>
                                                <td>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className="role-select"
                                                        disabled={user.employeeId === currentUserId}
                                                    >
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id, user.employeeId)}
                                                        className="btn btn-danger btn-sm"
                                                        disabled={user.employeeId === currentUserId}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5 3V1h6v2h4v2h-1v9a2 2 0 01-2 2H4a2 2 0 01-2-2V5H1V3h4zm2 3a1 1 0 00-1 1v5a1 1 0 102 0V7a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v5a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default UserManagement;
