import React, { useState, useEffect } from 'react';
import { fitnessAPI, userAPI, exerciseAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

const Operations = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    exercise: '',
    sets: 3,
    reps: 10,
    weight: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [recRes, userRes, exRes] = await Promise.all([
        fitnessAPI.getAll(),
        userAPI.getAll(),
        exerciseAPI.getAll()
      ]);

      if (recRes.data.success) setRecords(recRes.data.records);
      if (userRes.data.success) setUsers(userRes.data.users);
      if (exRes.data.success) setExercises(exRes.data.exercises);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      userId: users.length > 0 ? users[0]._id : '',
      exercise: exercises.length > 0 ? exercises[0].name : '',
      sets: 3,
      reps: 10,
      weight: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  // Open View Modal
  const openViewModal = (record) => {
    setCurrentRecord(record);
    setShowViewModal(true);
  };

  // Open Edit Modal
  const openEditModal = (record) => {
    setCurrentRecord(record);
    setFormData({
      userId: record.userId?._id || record.userId || '',
      exercise: record.exercise,
      sets: record.sets,
      reps: record.reps,
      weight: record.weight || 0,
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (record) => {
    setCurrentRecord(record);
    setShowDeleteModal(true);
  };

  // Handle Add Record
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fitnessAPI.create(formData);
      if (res.data.success) {
        setSuccess('Fitness record created successfully!');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record.');
    }
  };

  // Handle Edit Record
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fitnessAPI.update(currentRecord._id, formData);
      if (res.data.success) {
        setSuccess('Fitness record updated successfully!');
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record.');
    }
  };

  // Handle Delete Record
  const handleDeleteConfirm = async () => {
    try {
      const res = await fitnessAPI.delete(currentRecord._id);
      if (res.data.success) {
        setSuccess('Fitness record deleted successfully!');
        setShowDeleteModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-danger mb-1">MAIN CRUD MANAGEMENT</span>
          <h2 className="fw-bolder mb-0">Operations Portal</h2>
          <small className="text-muted">Create, Read, Update, and Delete Fitness Records</small>
        </div>
        <div>
          <button onClick={openAddModal} className="btn btn-repx-primary">
            <i className="bi bi-plus-circle me-1"></i> ADD FITNESS RECORD
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
                <h5 className="fw-bold mb-0">All Fitness Records</h5>
                <small className="text-muted">Total records in database: {records.length}</small>
              </div>
              <button onClick={fetchData} className="btn btn-outline-secondary btn-sm" title="Refresh">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" role="status"></div>
                  <div className="text-muted mt-2">Loading fitness records...</div>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 d-block mb-2"></i>
                  No fitness records found. Click "Add Fitness Record" to create one.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-custom mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Name</th>
                        <th>Exercise</th>
                        <th>Weight</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec) => (
                        <tr key={rec._id}>
                          <td>
                            <code className="text-muted small">
                              {rec._id.substring(rec._id.length - 6).toUpperCase()}
                            </code>
                          </td>
                          <td>
                            <strong>{rec.userId?.name || 'Unknown User'}</strong>
                            <small className="d-block text-muted">{rec.userId?.email}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border fw-bold">
                              {rec.exercise}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold text-danger">{rec.weight} kg</span>
                          </td>
                          <td>{rec.sets} sets</td>
                          <td>{rec.reps} reps</td>
                          <td>
                            <small className="text-muted">
                              {new Date(rec.date).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                onClick={() => openViewModal(rec)}
                                className="btn btn-outline-primary"
                                title="View Record Details"
                              >
                                <i className="bi bi-eye"></i> VIEW
                              </button>
                              <button
                                onClick={() => openEditModal(rec)}
                                className="btn btn-outline-secondary"
                                title="Edit Record"
                              >
                                <i className="bi bi-pencil-square"></i> EDIT
                              </button>
                              <button
                                onClick={() => openDeleteModal(rec)}
                                className="btn btn-outline-danger"
                                title="Delete Record"
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

      {/* ADD RECORD MODAL */}
      {showAddModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle text-danger me-2"></i> Add Fitness Record
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assign User</label>
                    <select
                      name="userId"
                      className="form-select"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                    >
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email}) - {u.role.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Exercise Name</label>
                    <input
                      type="text"
                      name="exercise"
                      className="form-control"
                      placeholder="e.g. Bench Press"
                      value={formData.exercise}
                      onChange={handleInputChange}
                      list="exerciseOptions"
                      required
                    />
                    <datalist id="exerciseOptions">
                      {exercises.map((ex) => (
                        <option key={ex._id} value={ex.name} />
                      ))}
                    </datalist>
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
                      <label className="form-label fw-semibold">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        min="0"
                        className="form-control"
                        value={formData.weight}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-repx-primary">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {showEditModal && currentRecord && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square text-warning me-2"></i> Edit Fitness Record
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assigned User</label>
                    <select
                      name="userId"
                      className="form-select"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                    >
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Exercise Name</label>
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
                      <label className="form-label fw-semibold">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        min="0"
                        className="form-control"
                        value={formData.weight}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW RECORD MODAL */}
      {showViewModal && currentRecord && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-eye-fill text-info me-2"></i> Fitness Record Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="p-3 bg-light rounded mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Record ID:</span>
                    <code>{currentRecord._id}</code>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">User:</span>
                    <strong>{currentRecord.userId?.name || 'N/A'}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Email:</span>
                    <span>{currentRecord.userId?.email || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Date Recorded:</span>
                    <span>{new Date(currentRecord.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="row g-2 text-center">
                  <div className="col-4">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Exercise</small>
                      <strong className="text-truncate">{currentRecord.exercise}</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Volume</small>
                      <strong>{currentRecord.sets} x {currentRecord.reps}</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card p-2 border bg-white">
                      <small className="text-muted">Weight</small>
                      <strong className="text-danger">{currentRecord.weight} kg</strong>
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
      {showDeleteModal && currentRecord && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-octagon-fill me-2"></i> Confirm Record Deletion
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Are you sure you want to delete this fitness record?</h5>
                <p className="text-muted mb-0">
                  Record for <strong>{currentRecord.exercise}</strong> ({currentRecord.sets} sets x {currentRecord.reps} reps)
                </p>
                <small className="text-danger">This action cannot be undone.</small>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={handleDeleteConfirm}>
                  Yes, Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
