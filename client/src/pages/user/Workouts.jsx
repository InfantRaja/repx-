import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import WorkoutVoiceLogger from '../../components/WorkoutVoiceLogger';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View Details Modal State
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await workoutAPI.getAll();
        if (res.data.success) {
          setWorkouts(res.data.workouts);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch workouts.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const openDetails = (workout) => {
    setSelectedWorkout(workout);
    setShowDetailModal(true);
  };

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-primary mb-1">
            <i className="bi bi-eye me-1"></i> VIEW-ONLY ACCESS
          </span>
          <h2 className="fw-bolder mb-0">Workout Routines</h2>
          <small className="text-muted">Structured workout routines and splits designed for balanced training</small>
        </div>
        <div className="mt-2 mt-md-0">
          <span className="badge bg-secondary px-3 py-2 fs-6">
            {workouts.length} Routines Available
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          {/* Integrated Voice Workout Logger (Requirement: Microphone button on workout page) */}
          <WorkoutVoiceLogger />

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted mt-2">Loading workout routines...</div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="card card-custom p-5 text-center text-muted">
              <i className="bi bi-journal-x fs-1 mb-2"></i>
              <h5>No workouts currently published</h5>
              <p className="small mb-0">Check back later or contact your system administrator.</p>
            </div>
          ) : (
            <div className="row g-4">
              {workouts.map((w) => (
                <div key={w._id} className="col-md-6">
                  <div className="card card-custom h-100 p-4 d-flex flex-column border-0 shadow-sm">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h4 className="fw-bold text-dark mb-0">{w.name}</h4>
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

                    <div className="mb-3">
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                        <i className="bi bi-crosshair me-1"></i> {w.targetMuscle}
                      </span>
                    </div>

                    <div className="p-3 bg-light rounded border mb-3 flex-grow-1">
                      <small className="text-muted text-uppercase fw-bold d-block mb-1">
                        Exercises Included:
                      </small>
                      <p className="mb-0 text-dark small fw-semibold">
                        {w.exercise}
                      </p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                      <span>
                        <i className="bi bi-clock-history me-1"></i> {w.duration}
                      </span>
                      <span>
                        <i className="bi bi-repeat me-1"></i> {w.sets} sets x {w.reps} reps
                      </span>
                    </div>

                    <div className="mt-auto pt-2 border-top">
                      {/* Notice: Only VIEW DETAILS button is displayed. NO Add/Edit/Delete buttons appear for normal users! */}
                      <button
                        onClick={() => openDetails(w)}
                        className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                      >
                        <i className="bi bi-info-circle"></i> VIEW DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VIEW DETAILS MODAL (Requirement 19) */}
      {showDetailModal && selectedWorkout && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-journal-text text-danger me-2"></i> Workout Routine Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3 pb-3 border-bottom">
                  <h3 className="fw-bold text-dark mb-2">{selectedWorkout.name}</h3>
                  <div className="d-flex justify-content-center gap-2">
                    <span className="badge bg-primary px-3 py-2">
                      Target: {selectedWorkout.targetMuscle}
                    </span>
                    <span className="badge bg-dark border px-3 py-2">
                      Duration: {selectedWorkout.duration}
                    </span>
                    <span
                      className={`badge px-3 py-2 ${
                        selectedWorkout.difficulty === 'Beginner'
                          ? 'badge-diff-beginner'
                          : selectedWorkout.difficulty === 'Intermediate'
                          ? 'badge-diff-intermediate'
                          : 'badge-diff-advanced'
                      }`}
                    >
                      {selectedWorkout.difficulty}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold text-secondary small d-block mb-1">
                    Structured Exercise Plan:
                  </label>
                  <div className="p-3 bg-light rounded border">
                    <ul className="mb-0 ps-3">
                      {selectedWorkout.exercise.split(',').map((item, idx) => (
                        <li key={idx} className="mb-1 text-dark fw-semibold">
                          {item.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="row g-2 text-center mb-3">
                  <div className="col-6">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Target Sets</small>
                      <strong className="fs-5 text-danger">{selectedWorkout.sets}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Target Reps</small>
                      <strong className="fs-5 text-primary">{selectedWorkout.reps}</strong>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info py-2 small d-flex align-items-center mb-0" role="alert">
                  <i className="bi bi-shield-lock-fill me-2 fs-5"></i>
                  <div>
                    Normal User Mode: View-only access. Modification privileges are restricted to Administrators.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
