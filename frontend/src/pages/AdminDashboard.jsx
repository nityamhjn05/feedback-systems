import React, { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EmployeeAutocomplete from "../components/EmployeeAutocomplete";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [forms, setForms] = useState([]);
  const [assignedForms, setAssignedForms] = useState([]); // NEW: Forms assigned to this admin
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalForms: 0,
    totalResponses: 0,
    employeeStats: [],
  });
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search state for responses

  // Form creation/edit state
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    questions: [],
    assignedTo: "", // Employee IDs as comma-separated string
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    questions: [],
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    type: "short",
    options: [],
    isRequired: false,
  });

  // Assignment state - NEW: Using autocomplete
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmployeesForNewForm, setSelectedEmployeesForNewForm] = useState([]); // For form creation

  useEffect(() => {
    fetchForms();
    fetchAnalytics();
    fetchAssignedForms(); // NEW: Fetch forms assigned to this admin
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      // Use per-admin endpoint to show only MY forms
      const res = await API.get("/admin/my-forms");
      setForms(res.data);
    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Use per-admin analytics endpoint
      const res = await API.get("/admin/my-analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  // NEW: Fetch forms assigned to this admin
  const fetchAssignedForms = async () => {
    try {
      const res = await API.get("/admin/assigned-forms");
      setAssignedForms(res.data.forms || []);
    } catch (err) {
      console.error("Error fetching assigned forms:", err);
    }
  };

  const handleAddOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    });
  };

  const handleRemoveOption = (index) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index),
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    });
  };

  const handleQuestionTypeChange = (type) => {
    setNewQuestion({
      ...newQuestion,
      type,
      options: type === "mcq" ? [""] : [], // Initialize with one empty option for MCQ
    });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      alert("Please enter a question");
      return;
    }

    if (newQuestion.type === "mcq" && newQuestion.options.filter(opt => opt.trim()).length < 2) {
      alert("Please add at least 2 options for MCQ");
      return;
    }

    // Filter out empty options for MCQ
    const questionToAdd = {
      ...newQuestion,
      options: newQuestion.type === "mcq"
        ? newQuestion.options.filter(opt => opt.trim())
        : [],
    };

    setNewForm({
      ...newForm,
      questions: [...newForm.questions, questionToAdd],
    });

    setNewQuestion({
      questionText: "",
      type: "short",
      options: [],
      isRequired: false,
    });
  };

  const handleRemoveQuestion = (index) => {
    setNewForm({
      ...newForm,
      questions: newForm.questions.filter((_, i) => i !== index),
    });
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    if (!newForm.title.trim() || newForm.questions.length === 0) {
      alert("Please add a title and at least one question");
      return;
    }

    try {
      // Create the form
      const formResponse = await API.post("/admin/forms", {
        title: newForm.title,
        description: newForm.description,
        questions: newForm.questions,
      });

      // If employees are selected, assign the form
      if (selectedEmployeesForNewForm.length > 0) {
        const ids = selectedEmployeesForNewForm.map(emp => emp.employeeId);
        await API.post(`/admin/forms/${formResponse.data._id}/assign`, {
          employeeIds: ids,
        });
      }

      alert("Form created and assigned successfully!");
      setShowCreateModal(false);
      setNewForm({ title: "", description: "", questions: [], assignedTo: "" });
      setSelectedEmployeesForNewForm([]);
      fetchForms();
    } catch (err) {
      console.error("Error creating form:", err);
      alert("Failed to create form");
    }
  };

  const handleAssignForm = async (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee");
      return;
    }

    const ids = selectedEmployees.map(emp => emp.employeeId);

    try {
      await API.post(`/admin/forms/${selectedForm._id}/assign`, {
        employeeIds: ids,
      });
      alert(`Form assigned successfully to ${selectedEmployees.length} employee(s)!`);
      setShowAssignModal(false);
      setSelectedEmployees([]);
      setSelectedForm(null);
    } catch (err) {
      console.error("Error assigning form:", err);
      alert("Failed to assign form");
    }
  };

  // NEW: Select All functionality
  const handleSelectAll = async () => {
    try {
      const res = await API.get("/admin/employees/all");
      setSelectedEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Error fetching all employees:", err);
      alert("Failed to fetch employees");
    }
  };

  const handleViewResponses = async (formId) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/forms/${formId}/responses`);
      setResponses(res.data);
      setActiveTab("responses");
    } catch (err) {
      console.error("Error fetching responses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setShowViewModal(true);
  };

  const handleEditForm = (form) => {
    setEditForm({
      title: form.title,
      description: form.description,
      questions: form.questions,
    });
    setSelectedForm(form);
    setShowEditModal(true);
  };

  const handleUpdateForm = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || editForm.questions.length === 0) {
      alert("Please add a title and at least one question");
      return;
    }

    try {
      await API.put(`/admin/forms/${selectedForm._id}`, {
        title: editForm.title,
        description: editForm.description,
        questions: editForm.questions,
      });

      alert("Form updated successfully!");
      setShowEditModal(false);
      setEditForm({ title: "", description: "", questions: [] });
      setSelectedForm(null);
      fetchForms();
    } catch (err) {
      console.error("Error updating form:", err);
      alert("Failed to update form");
    }
  };

  const handleAddQuestionToEdit = (question) => {
    setEditForm({
      ...editForm,
      questions: [...editForm.questions, question],
    });
  };

  const handleRemoveQuestionFromEdit = (index) => {
    setEditForm({
      ...editForm,
      questions: editForm.questions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="admin-dashboard">
      <Navbar />

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header fade-in">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage feedback forms and view responses</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create New Form
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs slide-in">
          <button
            className={`tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Analytics
          </button>
          <button
            className={`tab ${activeTab === "forms" ? "active" : ""}`}
            onClick={() => setActiveTab("forms")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            All Forms ({forms.length})
          </button>
          <button
            className={`tab ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.5 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10 11a3 3 0 00-3 3v1h6v-1a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
            Assigned to Me ({assignedForms.length})
          </button>
          <button
            className={`tab ${activeTab === "responses" ? "active" : ""}`}
            onClick={() => setActiveTab("responses")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Responses ({responses.length})
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {activeTab === "analytics" && (
            <div className="analytics-container">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card card">
                  <div className="stat-icon stat-icon-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Forms</p>
                    <h3 className="stat-value">{analytics.totalForms}</h3>
                  </div>
                </div>

                <div className="stat-card card">
                  <div className="stat-icon stat-icon-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Responses</p>
                    <h3 className="stat-value">{analytics.totalResponses}</h3>
                  </div>
                </div>

                <div className="stat-card card">
                  <div className="stat-icon stat-icon-success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Active Employees</p>
                    <h3 className="stat-value">{analytics.employeeStats.length}</h3>
                  </div>
                </div>
              </div>

              {/* Employee Productivity Chart */}
              <div className="chart-container card">
                <div className="chart-header">
                  <h3>Employee Productivity</h3>
                  <p>Top {analytics.employeeStats.length} employees by completed forms</p>
                </div>

                {analytics.employeeStats.length > 0 ? (
                  <div className="bar-chart">
                    {analytics.employeeStats.map((emp, idx) => {
                      const maxValue = Math.max(...analytics.employeeStats.map(e => e.completedForms));
                      const percentage = (emp.completedForms / maxValue) * 100;

                      return (
                        <div key={emp.employeeId} className="bar-item">
                          <div className="bar-label">
                            <span className="bar-rank">#{idx + 1}</span>
                            <div className="bar-employee-info">
                              <span className="bar-name">{emp.name}</span>
                              <span className="bar-id">{emp.employeeId}</span>
                            </div>
                          </div>
                          <div className="bar-wrapper">
                            <div
                              className="bar-fill"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="bar-value">{emp.completedForms}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="32" fill="var(--bg-tertiary)" />
                      <path
                        d="M32 20v24M20 32h24"
                        stroke="var(--text-muted)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <h3>No data yet</h3>
                    <p>Employee productivity data will appear once forms are submitted</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "forms" && (
            <div className="forms-grid">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner-large"></div>
                  <p>Loading forms...</p>
                </div>
              ) : forms.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="var(--bg-tertiary)" />
                    <path
                      d="M32 20v24M20 32h24"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <h3>No forms yet</h3>
                  <p>Create your first feedback form to get started</p>
                </div>
              ) : (
                forms.map((form) => (
                  <div key={form._id} className="form-card card">
                    <div className="form-card-header">
                      <h3>{form.title}</h3>
                      <span className="badge badge-info">
                        {form.questions.length} questions
                      </span>
                    </div>
                    <p className="form-description">{form.description}</p>
                    <div className="form-card-footer">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewForm(form)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 4.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
                        </svg>
                        View
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditForm(form)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedForm(form);
                          setShowAssignModal(true);
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 00-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" />
                        </svg>
                        Assign
                      </button>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handleViewResponses(form._id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 3.5a.5.5 0 00-1 0V9a.5.5 0 00.252.434l3.5 2a.5.5 0 00.496-.868L8 8.71V3.5z" />
                          <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm7-8A7 7 0 111 8a7 7 0 0114 0z" />
                        </svg>
                        Responses
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "assigned" && (
            <div className="forms-container">
              {assignedForms.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="var(--bg-tertiary)" />
                    <path
                      d="M32 20v24M20 32h24"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <h3>No forms assigned to you</h3>
                  <p>Forms assigned to you by other admins will appear here</p>
                </div>
              ) : (
                assignedForms.map((form) => (
                  <div key={form._id} className="form-card card">
                    <div className="form-header">
                      <div>
                        <h3>{form.title}</h3>
                        <p className="form-description">{form.description}</p>
                        <p className="form-meta">
                          Assigned by: {form.createdBy?.name} ({form.createdBy?.employeeId})
                        </p>
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            // Navigate to fill form (reuse user dashboard logic)
                            window.location.href = `/user?formId=${form._id}`;
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" />
                          </svg>
                          Fill Form
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "responses" && (
            <div className="responses-container">
              {/* Search Bar */}
              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label style={{ color: "maroon" }}>Search Responses by Employee Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="text"
                    className="input input-with-icon"
                    placeholder="Search by employee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && (
                  <small style={{ marginTop: "0.5rem", display: "block" }}>
                    Showing {responses.filter(r => r.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())).length} of {responses.length} responses
                  </small>
                )}
              </div>

              {responses.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="var(--bg-tertiary)" />
                    <path
                      d="M32 20v24M20 32h24"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <h3>No responses yet</h3>
                  <p>Responses will appear here once users submit the form</p>
                </div>
              ) : responses.filter(response =>
                !searchQuery || response.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="var(--bg-tertiary)" />
                    <path
                      d="M32 20v24M20 32h24"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <h3>No matching responses</h3>
                  <p>Try a different search term</p>
                </div>
              ) : (
                responses
                  .filter(response =>
                    !searchQuery || response.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((response) => (
                    <div key={response._id} className="response-card card">
                      <div className="response-header">
                        <div>
                          <h4>{response.employee?.name}</h4>
                          <p className="response-meta">
                            ID: {response.employee?.employeeId} •{" "}
                            {new Date(response.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge badge-success">Submitted</span>
                      </div>
                      <div className="response-answers">
                        {response.answers.map((answer, idx) => (
                          <div key={idx} className="answer-item">
                            <p className="answer-question">
                              Question {idx + 1}
                            </p>
                            <p className="answer-text">{answer.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Form Modal */}
      {
        showViewModal && selectedForm && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal glass view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>View Form</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowViewModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                <div className="form-view-section">
                  <h3>{selectedForm.title}</h3>
                  {selectedForm.description && <p className="form-description">{selectedForm.description}</p>}
                </div>

                <div className="questions-view-section">
                  <h4>Questions ({selectedForm.questions.length})</h4>
                  {selectedForm.questions.map((q, idx) => (
                    <div key={idx} className="question-view-item">
                      <div className="question-view-header">
                        <span className="question-number">Q{idx + 1}</span>
                        <div className="question-view-content">
                          <p className="question-text">{q.questionText}</p>
                          <div className="question-meta">
                            <span className="badge badge-info">{q.type}</span>
                            {q.isRequired && <span className="badge badge-warning">Required</span>}
                          </div>
                        </div>
                      </div>
                      {q.type === "mcq" && q.options && q.options.length > 0 && (
                        <div className="options-view">
                          <p className="options-title">Options:</p>
                          <ul className="options-list-view">
                            {q.options.map((opt, optIdx) => (
                              <li key={optIdx}>
                                <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditForm(selectedForm);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5z" />
                    </svg>
                    Edit Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Form Modal */}
      {
        showEditModal && selectedForm && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal glass" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Form</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateForm} className="modal-body">
                <div className="input-group">
                  <label>Form Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Employee Satisfaction Survey"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    className="textarea"
                    placeholder="Brief description of this form"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="questions-section">
                  <h3>Questions ({editForm.questions.length})</h3>

                  {editForm.questions.map((q, idx) => (
                    <div key={idx} className="question-item">
                      <div className="question-item-header">
                        <span className="question-number">Q{idx + 1}</span>
                        <div className="question-details">
                          <p>{q.questionText}</p>
                          <div className="question-meta-inline">
                            <span className="badge badge-info">{q.type}</span>
                            {q.type === "mcq" && q.options && (
                              <span className="options-count">{q.options.length} options</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => handleRemoveQuestionFromEdit(idx)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  <p className="edit-note">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z" clipRule="evenodd" />
                      <path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z" />
                    </svg>
                    Note: You can only remove questions. To add new questions, create a new form.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Create Form Modal */}
      {
        showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal glass" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Form</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateForm} className="modal-body">
                <div className="input-group">
                  <label>Form Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Employee Satisfaction Survey"
                    value={newForm.title}
                    onChange={(e) =>
                      setNewForm({ ...newForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    className="textarea"
                    placeholder="Brief description of this form"
                    value={newForm.description}
                    onChange={(e) =>
                      setNewForm({ ...newForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="questions-section">
                  <h3>Questions ({newForm.questions.length})</h3>

                  {newForm.questions.map((q, idx) => (
                    <div key={idx} className="question-item">
                      <div className="question-item-header">
                        <span className="question-number">Q{idx + 1}</span>
                        <p>{q.questionText}</p>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => handleRemoveQuestion(idx)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <span className="badge badge-info">{q.type}</span>
                    </div>
                  ))}

                  <div className="add-question-form">
                    <div className="input-group">
                      <label>Question Text</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter your question"
                        value={newQuestion.questionText}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            questionText: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label>Type</label>
                        <select
                          className="select"
                          value={newQuestion.type}
                          onChange={(e) => handleQuestionTypeChange(e.target.value)}
                        >
                          <option value="short">Short Answer</option>
                          <option value="long">Long Answer</option>
                          <option value="mcq">Multiple Choice</option>
                        </select>
                      </div>

                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={newQuestion.isRequired}
                            onChange={(e) =>
                              setNewQuestion({
                                ...newQuestion,
                                isRequired: e.target.checked,
                              })
                            }
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {newQuestion.type === "mcq" && (
                      <div className="mcq-options-builder">
                        <label className="options-label">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path fillRule="evenodd" d="M2 2.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                          </svg>
                          Options (minimum 2)
                        </label>

                        <div className="options-list">
                          {newQuestion.options.map((option, idx) => (
                            <div key={idx} className="option-input-row">
                              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                              <input
                                type="text"
                                className="input"
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                value={option}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                              />
                              {newQuestion.options.length > 1 && (
                                <button
                                  type="button"
                                  className="btn-icon-danger"
                                  onClick={() => handleRemoveOption(idx)}
                                  title="Remove option"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAddOption}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path fillRule="evenodd" d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" clipRule="evenodd" />
                          </svg>
                          Add Option
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAddQuestion}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" clipRule="evenodd" />
                      </svg>
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Employee Assignment Section */}
                <div className="assignment-section">
                  <h3>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Assign to Employees (Optional)
                  </h3>
                  <div className="input-group">
                    <label>Select Employees</label>
                    <EmployeeAutocomplete
                      selectedEmployees={selectedEmployeesForNewForm}
                      onSelectionChange={setSelectedEmployeesForNewForm}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        try {
                          const res = await API.get("/admin/employees/all");
                          setSelectedEmployeesForNewForm(res.data.employees || []);
                        } catch (err) {
                          console.error("Error fetching all employees:", err);
                          alert("Failed to fetch employees");
                        }
                      }}
                      style={{ marginTop: "0.5rem" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 00-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" />
                      </svg>
                      Select All Employees
                    </button>
                    <small>Search and select employees by name or ID. You can also assign later.</small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Assign Form Modal */}
      {
        showAssignModal && selectedForm && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal glass" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign Form</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowAssignModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAssignForm} className="modal-body">
                <div className="form-info">
                  <h3>{selectedForm.title}</h3>
                  <p>{selectedForm.description}</p>
                </div>

                <div className="input-group">
                  <label>Search and Select Employees</label>
                  <EmployeeAutocomplete
                    selectedEmployees={selectedEmployees}
                    onSelectionChange={setSelectedEmployees}
                  />
                </div>

                <div className="button-group" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSelectAll}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedEmployees([])}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear All
                  </button>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedEmployees([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={selectedEmployees.length === 0}>
                    Assign to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      <Footer />
    </div >
  );
}

export default AdminDashboard;