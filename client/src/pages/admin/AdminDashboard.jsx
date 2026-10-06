import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fitnessAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExercises: 0,
    totalWorkouts: 0,
    totalRecords: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fitnessAPI.getStats();
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentActivities(res.data.recentActivities || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch real-time statistics from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="container py-4 fade-in">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-danger mb-1 text-uppercase">
            <i className="bi bi-shield-check me-1"></i> Administrator Control Center
          </span>
          <h2 className="fw-bolder mb-0">Admin Dashboard</h2>
          <small className="text-muted">Live metrics and system activity fetched from MongoDB</small>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button onClick={fetchDashboardData} className="btn btn-outline-secondary btn-sm" title="Refresh Live Data">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <Link to="/admin/operations" className="btn btn-repx-primary btn-sm">
            <i className="bi bi-sliders me-1"></i> Operations Page
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-lg-3">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* 4 Core Statistics Cards (Requirement 11) */}
          <div className="row g-3 mb-4">
            {/* Total Users */}
            <div className="col-sm-6 col-xl-3">
              <div className="card card-custom p-3 border-start border-4 border-primary">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Total Users</span>
                    <h3 className="fw-bolder mt-1 mb-0 text-primary">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalUsers}
                    </h3>
                  </div>
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-people-fill"></i>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-top">
                  <Link to="/admin/users" className="small text-decoration-none fw-semibold text-primary">
                    Manage Users <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Total Exercises */}
            <div className="col-sm-6 col-xl-3">
              <div className="card card-custom p-3 border-start border-4 border-danger">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Exercises</span>
                    <h3 className="fw-bolder mt-1 mb-0 text-danger">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalExercises}
                    </h3>
                  </div>
                  <div className="stat-icon bg-danger bg-opacity-10 text-danger">
                    <i className="bi bi-heart-pulse-fill"></i>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-top">
                  <Link to="/admin/exercises" className="small text-decoration-none fw-semibold text-danger">
                    Manage Catalog <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Total Workouts */}
            <div className="col-sm-6 col-xl-3">
              <div className="card card-custom p-3 border-start border-4 border-success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Workouts</span>
                    <h3 className="fw-bolder mt-1 mb-0 text-success">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalWorkouts}
                    </h3>
                  </div>
                  <div className="stat-icon bg-success bg-opacity-10 text-success">
                    <i className="bi bi-journal-check"></i>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-top">
                  <Link to="/admin/workouts" className="small text-decoration-none fw-semibold text-success">
                    Manage Workouts <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Total Fitness Records */}
            <div className="col-sm-6 col-xl-3">
              <div className="card card-custom p-3 border-start border-4 border-warning">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Fitness Records</span>
                    <h3 className="fw-bolder mt-1 mb-0 text-warning">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalRecords}
                    </h3>
                  </div>
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-clipboard-data-fill"></i>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-top">
                  <Link to="/admin/operations" className="small text-decoration-none fw-semibold text-warning">
                    View Records <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="card card-custom p-3 mb-4 bg-light border-0">
            <h6 className="fw-bold mb-3 text-secondary text-uppercase small">
              <i className="bi bi-lightning-charge me-1"></i> Quick Management Hub
            </h6>
            <div className="row g-2">
              <div className="col-md-3">
                <Link to="/admin/operations" className="btn btn-outline-danger w-100 py-2 fw-semibold">
                  <i className="bi bi-sliders d-block fs-5 mb-1"></i> CRUD Operations
                </Link>
              </div>
              <div className="col-md-3">
                <Link to="/admin/exercises" className="btn btn-outline-dark w-100 py-2 fw-semibold">
                  <i className="bi bi-plus-circle d-block fs-5 mb-1"></i> Exercises CRUD
                </Link>
              </div>
              <div className="col-md-3">
                <Link to="/admin/workouts" className="btn btn-outline-dark w-100 py-2 fw-semibold">
                  <i className="bi bi-journal-plus d-block fs-5 mb-1"></i> Workouts CRUD
                </Link>
              </div>
              <div className="col-md-3">
                <Link to="/admin/users" className="btn btn-outline-dark w-100 py-2 fw-semibold">
                  <i className="bi bi-person-plus d-block fs-5 mb-1"></i> User Management
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Stream (Requirement 11) */}
          <div className="card card-custom">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Recent System Activity</h5>
                <small className="text-muted">Audit trail of actions performed within REPX</small>
              </div>
              <span className="badge bg-secondary">{recentActivities.length} Recent Events</span>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" role="status"></div>
                  <div className="text-muted mt-2">Loading system activity...</div>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  No recent activities recorded yet.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivities.map((act) => (
                    <div key={act._id} className="list-group-item p-3 d-flex align-items-start gap-3">
                      <div
                        className={`rounded-circle p-2 mt-1 text-white small ${
                          act.action.includes('deleted')
                            ? 'bg-danger'
                            : act.action.includes('added') || act.action.includes('created') || act.action.includes('registered')
                            ? 'bg-success'
                            : 'bg-primary'
                        }`}
                      >
                        <i
                          className={`bi ${
                            act.action.includes('deleted')
                              ? 'bi-trash'
                              : act.action.includes('user') || act.action.includes('registered')
                              ? 'bi-person-check'
                              : act.action.includes('Exercise')
                              ? 'bi-heart-pulse'
                              : act.action.includes('Workout')
                              ? 'bi-journal-check'
                              : 'bi-check2-circle'
                          }`}
                        ></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark">{act.action}</strong>
                          <span className="text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-secondary small mb-1">{act.details}</p>
                        <div className="d-flex gap-2">
                          <span className="badge bg-light text-dark border small">
                            Actor: {act.performedBy}
                          </span>
                          <span className={`badge ${act.role === 'admin' ? 'bg-danger' : 'bg-primary'} small text-uppercase`}>
                            {act.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
