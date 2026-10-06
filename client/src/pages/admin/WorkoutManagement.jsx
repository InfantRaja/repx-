import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

const WorkoutManagement = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetMuscle: '',
    exercise: '',
    sets: 4,
    reps: 10,
    duration: '45 mins',
    difficulty: 'Intermediate'
  });

  const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];

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
      setError('Failed to fetch workouts list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      targetMuscle: '',
      exercise: '',
      sets: 4,
      reps: 10,
      duration: '45 mins',
      difficulty: 'Intermediate'
    });
    setShowAddModal(true);
  };

  const openEditModal = (w) => {
    setCurrentWorkout(w);
    setFormData({
      name: w.name,
      targetMuscle: w.targetMuscle,
      exercise: w.exercise,
      sets: w.sets,
      reps: w.reps,
      duration: w.duration,
      difficulty: w.difficulty
    });
    setShowEditModal(true);
  };

  const openViewModal = (w) => {
    setCurrentWorkout(w);
    setShowViewModal(true);
  };

  const openDeleteModal = (w) => {
    setCurrentWorkout(w);
    setShowDeleteModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await workoutAPI.create(formData);
      if (res.data.success) {
        setSuccess('Workout created successfully!');
        setShowAddModal(false);
        fetchWorkouts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workout.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await workoutAPI.update(currentWorkout._id, formData);
      if (res.data.success) {
        setSuccess('Workout updated successfully!');
        setShowEditModal(false);
        fetchWorkouts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update workout.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await workoutAPI.delete(currentWorkout._id);
      if (res.data.success) {
        setSuccess('Workout deleted successfully!');
        setShowDeleteModal(false);
        fetchWorkouts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout.');
    }
  };

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-danger mb-1">WORKOUT MANAGEMENT</span>
          <h2 className="fw-bolder mb-0">Workout Routines</h2>
          <small className="text-muted">Create and manage curated workout regimens and training splits</small>
        </div>
        <div>
          <button onClick={openAddModal} className="btn btn-repx-primary">
            <i className="bi bi-journal-plus me-1"></i> ADD WORKOUT
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i> {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          <div className="card card-custom">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">All Workouts</h5>
                <small className="text-muted">Total workouts created: {workouts.length}</small>
              </div>
              <button onClick={fetchWorkouts} className="btn btn-outline-secondary btn-sm" title="Refresh">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" role="status"></div>
                  <div className="text-muted mt-2">Loading workouts...</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-custom mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Workout Name</th>
                        <th>Target Muscle</th>
                        <th>Volume</th>
                        <th>Duration</th>
                        <th>Difficulty</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workouts.map((w) => (
                        <tr key={w._id}>
                          <td>
                            <strong>{w.name}</strong>
                            <small className="d-block text-muted text-truncate" style={{ maxWidth: '200px' }}>
                              {w.exercise}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {w.targetMuscle}
                            </span>
                          </td>
                          <td>
                            <span className="fw-semibold">{w.sets} sets x {w.reps} reps</span>
                          </td>
                          <td>{w.duration}</td>
                          <td>
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
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => openViewModal(w)}
                                className="btn btn-outline-primary"
                                title="View Workout"
                              >
                                <i className="bi bi-eye"></i> VIEW
                              </button>
                              <button
                                onClick={() => openEditModal(w)}
                                className="btn btn-outline-secondary"
                                title="Edit Workout"
                              >
                                <i className="bi bi-pencil-square"></i> EDIT
                              </button>
                              <button
                                onClick={() => openDeleteModal(w)}
                                className="btn btn-outline-danger"
                                title="Delete Workout"
                              >
                                <i className="bi bi-trash"></i> DELETE
                              </button>
                            </div>
                          </td>
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

      {/* ADD WORKOUT MODAL */}
      {showAddModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-journal-plus text-danger me-2"></i> Add New Workout
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Workout Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Upper Body Hypertrophy"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Target Muscle Group(s)</label>
                    <input
                      type="text"
                      name="targetMuscle"
                      className="form-control"
                      placeholder="e.g. Chest + Shoulders + Triceps"
                      value={formData.targetMuscle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Exercises Included</label>
                    <input
                      type="text"
                      name="exercise"
                      className="form-control"
                      placeholder="e.g. Bench Press, Incline Dumbbell Press, Tricep Dips"
                      value={formData.exercise}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label fw-semibold">Sets</label>
                      <input
                        type="number"
                        name="sets"
                        min="1"
                        className="form-control"
                        value={formData.sets}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label fw-semibold">Reps</label>
                      <input
                        type="number"
                        name="reps"
                        min="1"
                        className="form-control"
                        value={formData.reps}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label fw-semibold">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        className="form-control"
                        placeholder="e.g. 45 mins"
                        value={formData.duration}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Difficulty</label>
                    <select
                      name="difficulty"
                      className="form-select"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      {difficultyOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-repx-primary">
                    Create Workout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WORKOUT MODAL */}
      {showEditModal && currentWorkout && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square text-warning me-2"></i> Update Workout
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Workout Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Target Muscle Group(s)</label>
                    <input
                      type="text"
                      name="targetMuscle"
                      className="form-control"
                      value={formData.targetMuscle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Exercises Included</label>
                    <input
                      type="text"
                      name="exercise"
                      className="form-control"
                      value={formData.exercise}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label fw-semibold">Sets</label>
                      <input
                        type="number"
                        name="sets"
                        min="1"
                        className="form-control"
                        value={formData.sets}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label fw-semibold">Reps</label>
                      <input
                        type="number"
                        name="reps"
                        min="1"
                        className="form-control"
                        value={formData.reps}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label fw-semibold">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        className="form-control"
                        value={formData.duration}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Difficulty</label>
                    <select
                      name="difficulty"
                      className="form-select"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      {difficultyOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Workout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW WORKOUT MODAL */}
      {showViewModal && currentWorkout && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-info-circle-fill text-info me-2"></i> Workout Routine Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <h4 className="fw-bold mb-2">{currentWorkout.name}</h4>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-primary">Target: {currentWorkout.targetMuscle}</span>
                  <span className="badge bg-dark border">Duration: {currentWorkout.duration}</span>
                  <span
                    className={`badge ${
                      currentWorkout.difficulty === 'Beginner'
                        ? 'badge-diff-beginner'
                        : currentWorkout.difficulty === 'Intermediate'
                        ? 'badge-diff-intermediate'
                        : 'badge-diff-advanced'
                    }`}
                  >
                    Difficulty: {currentWorkout.difficulty}
                  </span>
                </div>

                <div className="p-3 bg-light rounded border mb-3">
                  <label className="fw-semibold text-secondary small d-block mb-1">Recommended Exercises:</label>
                  <p className="mb-0 fw-bold">{currentWorkout.exercise}</p>
                </div>

                <div className="row g-2 text-center">
                  <div className="col-6">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Target Sets</small>
                      <strong className="fs-5 text-danger">{currentWorkout.sets}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Reps Per Set</small>
                      <strong className="fs-5 text-primary">{currentWorkout.reps}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && currentWorkout && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-octagon-fill me-2"></i> Confirm Workout Deletion
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Are you sure you want to delete this workout routine?</h5>
                <p className="text-muted mb-0">
                  <strong>{currentWorkout.name}</strong> ({currentWorkout.targetMuscle})
                </p>
                <small className="text-danger">This action cannot be undone.</small>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={handleDeleteConfirm}>
                  Yes, Delete Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutManagement;
