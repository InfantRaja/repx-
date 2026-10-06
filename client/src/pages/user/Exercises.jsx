import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Detail Modal State
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const muscleOptions = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const equipmentOptions = ['All', 'Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable'];
  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedMuscle !== 'All') params.muscleGroup = selectedMuscle;
      if (selectedEquipment !== 'All') params.equipment = selectedEquipment;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;

      const res = await exerciseAPI.getAll(params);
      if (res.data.success) {
        setExercises(res.data.exercises);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exercise catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [searchTerm, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const openDetails = (exercise) => {
    setSelectedExercise(exercise);
    setShowDetailModal(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMuscle('All');
    setSelectedEquipment('All');
    setSelectedDifficulty('All');
  };

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-primary mb-1">
            <i className="bi bi-eye me-1"></i> VIEW-ONLY ACCESS
          </span>
          <h2 className="fw-bolder mb-0">Exercise Library</h2>
          <small className="text-muted">Search and filter through the complete database of exercises</small>
        </div>
        <div className="mt-2 mt-md-0">
          <span className="badge bg-secondary px-3 py-2 fs-6">
            {exercises.length} Exercises Available
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
          {/* Search & Filter Card (Requirement 18) */}
          <div className="card card-custom p-4 mb-4 border-0 bg-light">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-funnel-fill text-primary me-2"></i> Search & Filter
            </h5>

            <div className="row g-3">
              {/* Search by Name */}
              <div className="col-md-12">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search exercise by name or description (e.g. Bench, Squat)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Filter: Muscle Group */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">Muscle Group</label>
                <select
                  className="form-select"
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                >
                  {muscleOptions.map((m) => (
                    <option key={m} value={m}>
                      {m === 'All' ? 'All Muscle Groups' : m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Equipment */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">Equipment</label>
                <select
                  className="form-select"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                >
                  {equipmentOptions.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq === 'All' ? 'All Equipment' : eq}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Difficulty */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">Difficulty Level</label>
                <select
                  className="form-select"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficultyOptions.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Difficulties' : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || selectedMuscle !== 'All' || selectedEquipment !== 'All' || selectedDifficulty !== 'All') && (
              <div className="mt-3 d-flex justify-content-end">
                <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-x-circle me-1"></i> Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
          )}

          {/* Exercise Grid / Cards */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted mt-2">Filtering exercises...</div>
            </div>
          ) : exercises.length === 0 ? (
            <div className="card card-custom p-5 text-center text-muted">
              <i className="bi bi-search fs-1 mb-2"></i>
              <h5 className="fw-bold">No exercises matched your query</h5>
              <p className="small mb-3">Try adjusting your search terms or filters.</p>
              <div>
                <button onClick={handleResetFilters} className="btn btn-outline-primary btn-sm">
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {exercises.map((ex) => (
                <div key={ex._id} className="col-md-6">
                  <div className="card card-custom h-100 p-3 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0 text-dark">{ex.name}</h5>
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
                    </div>

                    <div className="d-flex gap-2 mb-2">
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-bullseye me-1"></i> {ex.muscleGroup}
                      </span>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-gear me-1"></i> {ex.equipment}
                      </span>
                    </div>

                    <p className="text-muted small mb-3 flex-grow-1">
                      {ex.description ? ex.description : 'Standard compound or isolation strength movement.'}
                    </p>

                    <div className="mt-auto pt-2 border-top">
                      {/* Notice: Only VIEW DETAILS button is available. NO Add/Edit/Delete buttons! */}
                      <button
                        onClick={() => openDetails(ex)}
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

      {/* VIEW DETAILS MODAL (Requirement 18) */}
      {showDetailModal && selectedExercise && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-heart-pulse text-danger me-2"></i> Exercise Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3 pb-3 border-bottom">
                  <h3 className="fw-bold text-dark mb-2">{selectedExercise.name}</h3>
                  <div className="d-flex justify-content-center gap-2">
                    <span className="badge bg-danger px-3 py-2">
                      Target: {selectedExercise.muscleGroup}
                    </span>
                    <span className="badge bg-dark border px-3 py-2">
                      Equipment: {selectedExercise.equipment}
                    </span>
                    <span
                      className={`badge px-3 py-2 ${
                        selectedExercise.difficulty === 'Beginner'
                          ? 'badge-diff-beginner'
                          : selectedExercise.difficulty === 'Intermediate'
                          ? 'badge-diff-intermediate'
                          : 'badge-diff-advanced'
                      }`}
                    >
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold text-secondary small d-block mb-1">
                    Movement Description & Form Instructions:
                  </label>
                  <p className="bg-light p-3 rounded text-dark">
                    {selectedExercise.description || 'No detailed instructions provided.'}
                  </p>
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

export default Exercises;
