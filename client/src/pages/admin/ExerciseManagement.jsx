import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentExercise, setCurrentExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: ''
  });

  const muscleOptions = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const equipmentOptions = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable', 'Kettlebell', 'None'];
  const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await exerciseAPI.getAll();
      if (res.data.success) {
        setExercises(res.data.exercises);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exercise database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      description: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (ex) => {
    setCurrentExercise(ex);
    setFormData({
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      description: ex.description || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (ex) => {
    setCurrentExercise(ex);
    setShowViewModal(true);
  };

  const openDeleteModal = (ex) => {
    setCurrentExercise(ex);
    setShowDeleteModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await exerciseAPI.create(formData);
      if (res.data.success) {
        setSuccess('Exercise added successfully!');
        setShowAddModal(false);
        fetchExercises();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add exercise.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await exerciseAPI.update(currentExercise._id, formData);
      if (res.data.success) {
        setSuccess('Exercise updated successfully!');
        setShowEditModal(false);
        fetchExercises();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update exercise.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await exerciseAPI.delete(currentExercise._id);
      if (res.data.success) {
        setSuccess('Exercise deleted successfully!');
        setShowDeleteModal(false);
        fetchExercises();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete exercise.');
    }
  };

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-danger mb-1">EXERCISE MANAGEMENT</span>
          <h2 className="fw-bolder mb-0">Exercise Catalog</h2>
          <small className="text-muted">Administer the complete exercise repository and movements</small>
        </div>
        <div>
          <button onClick={openAddModal} className="btn btn-repx-primary">
            <i className="bi bi-plus-circle me-1"></i> ADD EXERCISE
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
                <h5 className="fw-bold mb-0">All Exercises</h5>
                <small className="text-muted">Total exercises available: {exercises.length}</small>
              </div>
              <button onClick={fetchExercises} className="btn btn-outline-secondary btn-sm" title="Refresh">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" role="status"></div>
                  <div className="text-muted mt-2">Loading exercises...</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-custom mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Exercise Name</th>
                        <th>Muscle Group</th>
                        <th>Equipment</th>
                        <th>Difficulty</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercises.map((ex) => (
                        <tr key={ex._id}>
                          <td>
                            <strong>{ex.name}</strong>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {ex.muscleGroup}
                            </span>
                          </td>
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
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => openViewModal(ex)}
                                className="btn btn-outline-primary"
                                title="View Details"
                              >
                                <i className="bi bi-eye"></i> VIEW
                              </button>
                              <button
                                onClick={() => openEditModal(ex)}
                                className="btn btn-outline-secondary"
                                title="Edit Exercise"
                              >
                                <i className="bi bi-pencil-square"></i> EDIT
                              </button>
                              <button
                                onClick={() => openDeleteModal(ex)}
                                className="btn btn-outline-danger"
                                title="Delete Exercise"
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

      {/* ADD EXERCISE MODAL */}
      {showAddModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle text-danger me-2"></i> Add New Exercise
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Exercise Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Incline Dumbbell Press"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Muscle Group</label>
                      <select
                        name="muscleGroup"
                        className="form-select"
                        value={formData.muscleGroup}
                        onChange={handleInputChange}
                      >
                        {muscleOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Equipment</label>
                      <select
                        name="equipment"
                        className="form-select"
                        value={formData.equipment}
                        onChange={handleInputChange}
                      >
                        {equipmentOptions.map((eq) => (
                          <option key={eq} value={eq}>{eq}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Difficulty Level</label>
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description / Form Cues</label>
                    <textarea
                      name="description"
                      rows="3"
                      className="form-control"
                      placeholder="Describe biomechanics, targeted muscles, and cues..."
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-repx-primary">
                    Create Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EXERCISE MODAL */}
      {showEditModal && currentExercise && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square text-warning me-2"></i> Update Exercise
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Exercise Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Muscle Group</label>
                      <select
                        name="muscleGroup"
                        className="form-select"
                        value={formData.muscleGroup}
                        onChange={handleInputChange}
                      >
                        {muscleOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Equipment</label>
                      <select
                        name="equipment"
                        className="form-select"
                        value={formData.equipment}
                        onChange={handleInputChange}
                      >
                        {equipmentOptions.map((eq) => (
                          <option key={eq} value={eq}>{eq}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Difficulty Level</label>
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      name="description"
                      rows="3"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW EXERCISE MODAL */}
      {showViewModal && currentExercise && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-info-circle-fill text-info me-2"></i> Exercise Specifications
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <h4 className="fw-bold mb-3">{currentExercise.name}</h4>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-danger">Muscle: {currentExercise.muscleGroup}</span>
                  <span className="badge bg-dark border">Equipment: {currentExercise.equipment}</span>
                  <span
                    className={`badge ${
                      currentExercise.difficulty === 'Beginner'
                        ? 'badge-diff-beginner'
                        : currentExercise.difficulty === 'Intermediate'
                        ? 'badge-diff-intermediate'
                        : 'badge-diff-advanced'
                    }`}
                  >
                    Difficulty: {currentExercise.difficulty}
                  </span>
                </div>
                <div className="p-3 bg-light rounded border mb-2">
                  <label className="fw-semibold text-secondary small d-block mb-1">Description:</label>
                  <p className="mb-0">{currentExercise.description || 'No description provided.'}</p>
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
      {showDeleteModal && currentExercise && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-octagon-fill me-2"></i> Confirm Exercise Deletion
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Are you sure you want to delete this exercise?</h5>
                <p className="text-muted mb-0">
                  <strong>{currentExercise.name}</strong> ({currentExercise.muscleGroup})
                </p>
                <small className="text-danger">This will permanently remove it from the exercise catalog.</small>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={handleDeleteConfirm}>
                  Yes, Delete Exercise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManagement;
