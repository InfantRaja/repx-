import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workoutAPI, fitnessAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import WorkoutVoiceLogger from '../../components/WorkoutVoiceLogger';

const WorkoutDetails = () => {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active workout session sets
  const [sessionSets, setSessionSets] = useState([]);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  // Manual set entry state
  const [manualForm, setManualForm] = useState({
    exercise: '',
    weight: 60,
    reps: 10
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [manualSaving, setManualSaving] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        const res = await workoutAPI.getById(id);
        if (res.data.success) {
          setWorkout(res.data.workout);
          // Set initial manual exercise to first one in the workout
          if (res.data.workout.exercise) {
            const firstEx = res.data.workout.exercise.split(',')[0].trim();
            setManualForm(prev => ({ ...prev, exercise: firstEx }));
          }
        }
      } catch (err) {
        setError('Failed to fetch workout details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorkout();
  }, [id]);

  // Callback when voice logger successfully confirms a set
  const handleVoiceSetLogged = (newRecord) => {
    setSessionSets(prev => [
      ...prev,
      {
        id: newRecord._id || Date.now(),
        exercise: newRecord.exercise,
        weight: newRecord.weight,
        reps: newRecord.reps,
        completed: true,
        source: 'voice'
      }
    ]);
  };

  // Manual Set Handlers (Must NOT replace manual buttons)
  const handleManualAddOrEdit = async (e) => {
    e.preventDefault();
    if (!manualForm.exercise || manualForm.reps === undefined) return;

    setManualSaving(true);
    try {
      if (editingIndex !== null) {
        // Edit existing set
        const updated = [...sessionSets];
        updated[editingIndex] = {
          ...updated[editingIndex],
          exercise: manualForm.exercise,
          weight: Number(manualForm.weight),
          reps: Number(manualForm.reps)
        };
        setSessionSets(updated);
        setEditingIndex(null);
      } else {
        // Save new set to MongoDB
        const res = await fitnessAPI.create({
          exercise: manualForm.exercise,
          weight: Number(manualForm.weight),
          sets: 1,
          reps: Number(manualForm.reps),
          date: new Date()
        });

        if (res.data.success) {
          setSessionSets(prev => [
            ...prev,
            {
              id: res.data.record?._id || Date.now(),
              exercise: manualForm.exercise,
              weight: Number(manualForm.weight),
              reps: Number(manualForm.reps),
              completed: true,
              source: 'manual'
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to log manual set:', err);
    } finally {
      setManualSaving(false);
    }
  };

  const handleEditSet = (index) => {
    const s = sessionSets[index];
    setManualForm({
      exercise: s.exercise,
      weight: s.weight,
      reps: s.reps
    });
    setEditingIndex(index);
  };

  const handleDeleteSet = (index) => {
    setSessionSets(prev => prev.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleToggleComplete = (index) => {
    setSessionSets(prev => {
      const copy = [...prev];
      copy[index].completed = !copy[index].completed;
      return copy;
    });
  };

  const handleCompleteWorkout = () => {
    setWorkoutCompleted(true);
  };

  const exerciseOptions = workout?.exercise
    ? workout.exercise.split(',').map(e => e.trim())
    : [];

  return (
    <div className="container py-4 fade-in">
      <div className="row g-4">
        <div className="col-lg-3">
          <Sidebar />
        </div>

        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Link to="/user/workouts" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Workouts
            </Link>
            <span className="badge bg-danger px-3 py-2">
              <i className="bi bi-mic-fill me-1"></i> Voice Enabled Session
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : error || !workout ? (
            <div className="alert alert-danger" role="alert">
              {error || 'Workout not found.'}
            </div>
          ) : (
            <>
              {/* Workout Details Card */}
              <div className="card card-custom p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                  <div>
                    <span className="badge bg-primary mb-1">ACTIVE WORKOUT PROGRAM</span>
                    <h2 className="fw-bolder mb-0 text-dark">{workout.name}</h2>
                  </div>
                  <span
                    className={`badge px-3 py-2 ${
                      workout.difficulty === 'Beginner'
                        ? 'badge-diff-beginner'
                        : workout.difficulty === 'Intermediate'
                        ? 'badge-diff-intermediate'
                        : 'badge-diff-advanced'
                    }`}
                  >
                    {workout.difficulty}
                  </span>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded border">
                      <small className="text-muted text-uppercase fw-bold d-block">Target Muscle Focus</small>
                      <span className="fs-5 fw-bold text-danger">{workout.targetMuscle}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded border">
                      <small className="text-muted text-uppercase fw-bold d-block">Estimated Duration</small>
                      <span className="fs-5 fw-bold text-dark">{workout.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-light rounded border mb-0">
                  <small className="text-muted text-uppercase fw-bold d-block mb-1">Recommended Exercises:</small>
                  <p className="mb-0 fw-semibold text-dark">{workout.exercise}</p>
                </div>
              </div>

              {/* 1. Voice Logging Component (Microphone button with confirmation) */}
              <WorkoutVoiceLogger onRecordAdded={handleVoiceSetLogged} />

              {/* 2. Manual Set Logger Form (Ensures Voice does NOT replace normal buttons/forms) */}
              <div className="card card-custom p-4 mb-4 border-0 shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle p-2">
                      <i className="bi bi-pencil-square fs-5"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">
                        {editingIndex !== null ? 'Edit Selected Set' : 'Manual Set Logging'}
                      </h5>
                      <small className="text-muted">Enter set details manually or update logged sets</small>
                    </div>
                  </div>
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleManualAddOrEdit}>
                  <div className="row g-3 align-items-end">
                    {/* Select Exercise */}
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-secondary">Select Exercise</label>
                      <select
                        className="form-select"
                        value={manualForm.exercise}
                        onChange={(e) => setManualForm({ ...manualForm, exercise: e.target.value })}
                        required
                      >
                        {exerciseOptions.map((ex, idx) => (
                          <option key={idx} value={ex}>{ex}</option>
                        ))}
                      </select>
                    </div>

                    {/* Weight */}
                    <div className="col-md-3 col-6">
                      <label className="form-label small fw-semibold text-secondary">Weight (kg)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="form-control"
                          value={manualForm.weight}
                          onChange={(e) => setManualForm({ ...manualForm, weight: e.target.value })}
                          required
                        />
                        <span className="input-group-text">kg</span>
                      </div>
                    </div>

                    {/* Reps */}
                    <div className="col-md-2 col-6">
                      <label className="form-label small fw-semibold text-secondary">Reps</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={manualForm.reps}
                        onChange={(e) => setManualForm({ ...manualForm, reps: e.target.value })}
                        required
                      />
                    </div>

                    {/* Action Button: Add Set or Update Set */}
                    <div className="col-md-2">
                      <button
                        type="submit"
                        disabled={manualSaving}
                        className={`btn w-100 ${editingIndex !== null ? 'btn-warning text-dark' : 'btn-repx-primary'}`}
                      >
                        {manualSaving ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : editingIndex !== null ? (
                          <>
                            <i className="bi bi-pencil me-1"></i> Update
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-lg me-1"></i> Add Set
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* 3. Session Logged Sets Table (Manual Edit, Delete, Complete Set) */}
              <div className="card card-custom p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">Current Session Sets</h5>
                    <small className="text-muted">Total sets logged in this workout: {sessionSets.length}</small>
                  </div>
                  {sessionSets.length > 0 && !workoutCompleted && (
                    <button
                      type="button"
                      onClick={handleCompleteWorkout}
                      className="btn btn-success btn-sm fw-bold px-3"
                    >
                      <i className="bi bi-trophy-fill me-1"></i> Complete Workout
                    </button>
                  )}
                </div>

                {workoutCompleted && (
                  <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                    <i className="bi bi-trophy-fill fs-4 me-3 text-warning"></i>
                    <div>
                      <h6 className="fw-bold mb-0">Great job! Workout Completed!</h6>
                      <small>All sets have been recorded and saved to your REPX fitness database.</small>
                    </div>
                  </div>
                )}

                {sessionSets.length === 0 ? (
                  <div className="p-4 text-center text-muted bg-light rounded">
                    <i className="bi bi-clipboard2-pulse fs-2 d-block mb-2"></i>
                    No sets logged for this session yet. Speak into the microphone or use the manual form above.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Set #</th>
                          <th>Exercise</th>
                          <th>Weight</th>
                          <th>Reps</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionSets.map((s, idx) => (
                          <tr key={idx} className={s.completed ? 'table-success bg-opacity-25' : ''}>
                            <td><strong>#{idx + 1}</strong></td>
                            <td><strong>{s.exercise}</strong></td>
                            <td><span className="fw-bold text-danger">{s.weight} kg</span></td>
                            <td>{s.reps} reps</td>
                            <td>
                              <span className={`badge ${s.source === 'voice' ? 'bg-danger' : 'bg-secondary'}`}>
                                {s.source === 'voice' ? '🎙️ Voice' : '⌨️ Manual'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(idx)}
                                className={`btn btn-sm ${s.completed ? 'btn-success' : 'btn-outline-secondary'} py-0 px-2`}
                                title="Toggle complete set"
                              >
                                {s.completed ? '✓ Completed' : 'Pending'}
                              </button>
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  onClick={() => handleEditSet(idx)}
                                  className="btn btn-outline-primary"
                                  title="Edit Set"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSet(idx)}
                                  className="btn btn-outline-danger"
                                  title="Delete Set"
                                >
                                  <i className="bi bi-trash"></i>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetails;
