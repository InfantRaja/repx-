import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { exerciseAPI, workoutAPI, fitnessAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import WorkoutVoiceLogger from '../../components/WorkoutVoiceLogger';

const UserDashboard = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [exRes, workRes, fitRes] = await Promise.all([
          exerciseAPI.getAll(),
          workoutAPI.getAll(),
          fitnessAPI.getAll()
        ]);

        if (exRes.data.success) setExercises(exRes.data.exercises);
        if (workRes.data.success) setWorkouts(workRes.data.workouts);
        if (fitRes.data.success) setUserRecords(fitRes.data.records);
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleVoiceRecordAdded = (newRecord) => {
    setUserRecords(prev => [newRecord, ...prev]);
  };

  return (
    <div className="container py-4 fade-in">
      {/* Welcome Banner */}
      <div className="card card-custom bg-dark text-white p-4 mb-4 border-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <div className="d-inline-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary text-uppercase">
                <i className="bi bi-person-badge me-1"></i> Normal User Account
              </span>
              <span className="badge bg-secondary">View-Only Access</span>
            </div>
            <h2 className="fw-bolder mb-1">
              Welcome, <span className="text-danger">{user?.name}</span>!
            </h2>
            <p className="text-secondary small mb-0">
              Explore your personalized fitness dashboard, view training routines, and browse available exercises.
            </p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <Link to="/user/exercises" className="btn btn-repx-primary btn-sm">
              <i className="bi bi-search me-1"></i> Browse Exercises
            </Link>
            <Link to="/user/workouts" className="btn btn-outline-light btn-sm">
              <i className="bi bi-journal-check me-1"></i> View Workouts
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          {/* Quick Voice Workout Logger Component */}
          <WorkoutVoiceLogger onRecordAdded={handleVoiceRecordAdded} />

          {/* Quick Metrics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-4">
              <div className="card card-custom p-3 border-start border-4 border-primary">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Exercises</span>
                    <h3 className="fw-bolder text-primary mb-0 mt-1">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : exercises.length}
                    </h3>
                  </div>
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-heart-pulse"></i>
                  </div>
                </div>
                <small className="text-muted d-block mt-2">Available for training</small>
              </div>
            </div>

            <div className="col-sm-4">
              <div className="card card-custom p-3 border-start border-4 border-success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Workouts</span>
                    <h3 className="fw-bolder text-success mb-0 mt-1">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : workouts.length}
                    </h3>
                  </div>
                  <div className="stat-icon bg-success bg-opacity-10 text-success">
                    <i className="bi bi-journal-text"></i>
                  </div>
                </div>
                <small className="text-muted d-block mt-2">Curated workout plans</small>
              </div>
            </div>

            <div className="col-sm-4">
              <div className="card card-custom p-3 border-start border-4 border-warning">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">My Records</span>
                    <h3 className="fw-bolder text-warning mb-0 mt-1">
                      {loading ? <span className="spinner-border spinner-border-sm" /> : userRecords.length}
                    </h3>
                  </div>
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-clipboard2-pulse"></i>
                  </div>
                </div>
                <small className="text-muted d-block mt-2">Your logged sessions</small>
              </div>
            </div>
          </div>

          {/* Section: Available Workouts Preview */}
          <div className="card card-custom mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Recommended Workouts</h5>
                <small className="text-muted">Structured workout splits for maximum performance</small>
              </div>
              <Link to="/user/workouts" className="btn btn-sm btn-outline-primary">
                View All ({workouts.length})
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : workouts.length === 0 ? (
                <p className="text-muted text-center py-3 mb-0">No workouts currently available.</p>
              ) : (
                <div className="row g-3">
                  {workouts.slice(0, 2).map((w) => (
                    <div key={w._id} className="col-md-6">
                      <div className="card p-3 border h-100 bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0 text-dark">{w.name}</h6>
                          <span
                            className={`badge ${
                              w.difficulty === 'Beginner'
                                ? 'badge-diff-beginner'
                                : w.difficulty === 'Intermediate'
                                ? 'badge-diff-intermediate'
                                : 'badge-diff-advanced'
                            }`}
                          >
                            {w.difficulty}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">
                          <strong>Target:</strong> {w.targetMuscle}
                        </p>
                        <p className="small mb-3 text-secondary text-truncate">
                          <strong>Exercises:</strong> {w.exercise}
                        </p>
                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                          <span className="small text-muted">
                            <i className="bi bi-clock me-1"></i> {w.duration}
                          </span>
                          <span className="small text-muted">
                            {w.sets} sets x {w.reps} reps
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Available Exercises Preview */}
          <div className="card card-custom mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Featured Exercises</h5>
                <small className="text-muted">Explore movement techniques and muscle targets</small>
              </div>
              <Link to="/user/exercises" className="btn btn-sm btn-outline-danger">
                Browse All ({exercises.length})
              </Link>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-danger" role="status"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Exercise</th>
                        <th>Muscle</th>
                        <th>Equipment</th>
                        <th>Difficulty</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercises.slice(0, 4).map((ex) => (
                        <tr key={ex._id}>
                          <td><strong>{ex.name}</strong></td>
                          <td><span className="badge bg-light text-dark border">{ex.muscleGroup}</span></td>
                          <td>{ex.equipment}</td>
                          <td>
                            <span
                              className={`badge ${
                                ex.difficulty === 'Beginner'
                                  ? 'badge-diff-beginner'
                                  : ex.difficulty === 'Intermediate'
                                  ? 'badge-diff-intermediate'
                                  : 'badge-diff-advanced'
                              }`}
                            >
                              {ex.difficulty}
                            </span>
                          </td>
                          <td>
                            <Link to="/user/exercises" className="btn btn-sm btn-outline-primary py-0">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Section: Your Recent Fitness Records */}
          <div className="card card-custom">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Your Fitness Activity Records</h5>
                <small className="text-muted">Personal records logged under your account</small>
              </div>
              <span className="badge bg-secondary">{userRecords.length} Records</span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status"></div>
                </div>
              ) : userRecords.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-check fs-2 d-block mb-1"></i>
                  No personal records logged yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Exercise</th>
                        <th>Weight</th>
                        <th>Volume</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRecords.slice(0, 5).map((rec) => (
                        <tr key={rec._id}>
                          <td><strong>{rec.exercise}</strong></td>
                          <td><span className="fw-bold text-danger">{rec.weight} kg</span></td>
                          <td>{rec.sets} sets x {rec.reps} reps</td>
                          <td><small className="text-muted">{new Date(rec.date).toLocaleDateString()}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
