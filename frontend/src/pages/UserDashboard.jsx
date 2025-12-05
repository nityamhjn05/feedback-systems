import React, { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserDashboard.css";

function UserDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/user/forms");
      const assignmentsData = res.data;
      setAssignments(assignmentsData);

      // Calculate analytics
      const completed = assignmentsData.filter(a => a.submitted).length;
      const pending = assignmentsData.filter(a => !a.submitted).length;

      setAnalytics({
        totalAssigned: assignmentsData.length,
        completed,
        pending,
      });
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartForm = (assignment) => {
    setSelectedForm(assignment);
    // Initialize answers object
    const initialAnswers = {};
    assignment.form.questions.forEach((q) => {
      initialAnswers[q._id] = "";
    });
    setAnswers(initialAnswers);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validate required questions
    const unansweredRequired = selectedForm.form.questions.filter(
      (q) => q.isRequired && !answers[q._id]?.trim()
    );

    if (unansweredRequired.length > 0) {
      alert("Please answer all required questions");
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await API.post(`/response/submit/${selectedForm.form._id}`, {
        answers: formattedAnswers,
      });

      alert("Form submitted successfully!");
      setSelectedForm(null);
      setAnswers({});
      fetchAssignments();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedForm) {
    return (
      <div className="user-dashboard">
        <Navbar />

        <div className="dashboard-container">
          <div className="form-view fade-in">
            <div className="form-view-header">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedForm(null)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Forms
              </button>
            </div>

            <div className="form-view-content card glass">
              <div className="form-view-title">
                <h1>{selectedForm.form.title}</h1>
                {selectedForm.form.description && (
                  <p className="form-description">{selectedForm.form.description}</p>
                )}
              </div>

              <form onSubmit={handleSubmitForm} className="questions-form">
                {selectedForm.form.questions.map((question, index) => (
                  <div key={question._id} className="question-block">
                    <label className="question-label">
                      <span className="question-number">{index + 1}</span>
                      {question.questionText}
                      {question.isRequired && <span className="required-mark">*</span>}
                    </label>

                    {question.type === "short" && (
                      <input
                        type="text"
                        className="input"
                        placeholder="Your answer"
                        value={answers[question._id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question._id, e.target.value)
                        }
                        required={question.isRequired}
                      />
                    )}

                    {question.type === "long" && (
                      <textarea
                        className="textarea"
                        placeholder="Your detailed answer"
                        value={answers[question._id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question._id, e.target.value)
                        }
                        required={question.isRequired}
                        rows={5}
                      />
                    )}

                    {question.type === "mcq" && (
                      <div className="mcq-options">
                        {question.options.map((option, idx) => (
                          <label key={idx} className="mcq-option">
                            <input
                              type="radio"
                              name={question._id}
                              value={option}
                              checked={answers[question._id] === option}
                              onChange={(e) =>
                                handleAnswerChange(question._id, e.target.value)
                              }
                              required={question.isRequired}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="form-submit-section">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg className="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="50.265" strokeDashoffset="25" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Submit Form
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header fade-in">
          <div>
            <h1>My Assigned Forms</h1>
            <p>Complete your feedback forms to help improve our workplace</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="user-analytics slide-in">
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-icon stat-icon-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Assigned</p>
                <h3 className="stat-value">{analytics.totalAssigned}</h3>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon stat-icon-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Completed</p>
                <h3 className="stat-value">{analytics.completed}</h3>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon stat-icon-warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Pending</p>
                <h3 className="stat-value">{analytics.pending}</h3>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          {analytics.totalAssigned > 0 && (
            <div className="progress-chart card">
              <div className="chart-header">
                <h3>Your Progress</h3>
                <p>Completion rate: {Math.round((analytics.completed / analytics.totalAssigned) * 100)}%</p>
              </div>
              <div className="progress-bars">
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Completed</span>
                    <span className="progress-count">{analytics.completed} / {analytics.totalAssigned}</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar-fill progress-bar-success"
                      style={{ width: `${(analytics.completed / analytics.totalAssigned) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Pending</span>
                    <span className="progress-count">{analytics.pending} / {analytics.totalAssigned}</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar-fill progress-bar-warning"
                      style={{ width: `${(analytics.pending / analytics.totalAssigned) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="assignments-grid slide-in">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading your forms...</p>
            </div>
          ) : assignments.length === 0 ? (
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
              <h3>No forms assigned yet</h3>
              <p>You don't have any feedback forms to complete at the moment</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} className="assignment-card card">
                <div className="assignment-header">
                  <h3>{assignment.form.title}</h3>
                  {assignment.submitted ? (
                    <span className="badge badge-success">Completed</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                </div>

                {assignment.form.description && (
                  <p className="assignment-description">
                    {assignment.form.description}
                  </p>
                )}

                <div className="assignment-meta">
                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M6 2a.5.5 0 01.47.33L10 12.036l1.53-4.208A.5.5 0 0112 7.5h3.5a.5.5 0 010 1h-3.15l-1.88 5.17a.5.5 0 01-.94 0L6 3.964 4.47 8.171A.5.5 0 014 8.5H.5a.5.5 0 010-1h3.15l1.88-5.17A.5.5 0 016 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{assignment.form.questions.length} questions</span>
                  </div>
                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M7.5 3a.5.5 0 01.5.5v5.21l3.248 1.856a.5.5 0 01-.496.868l-3.5-2A.5.5 0 017 9V3.5a.5.5 0 01.5-.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!assignment.submitted && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStartForm(assignment)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Start Form
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserDashboard;
