import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { exerciseAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';

const ExerciseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        const res = await exerciseAPI.getById(id);
        if (res.data.success) {
          setExercise(res.data.exercise);
        }
      } catch (err) {
        setError('Failed to fetch exercise details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExercise();
  }, [id]);

  return (
    <div className="container py-4 fade-in">
      <div className="row g-4">
        <div className="col-lg-3">
          <Sidebar />
        </div>

        <div className="col-lg-9">
          <div className="mb-3">
            <Link to="/user/exercises" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Exercise Library
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : error || !exercise ? (
            <div className="alert alert-danger" role="alert">
              {error || 'Exercise not found.'}
            </div>
          ) : (
            <div className="card card-custom p-4">
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                <div>
                  <span className="badge bg-primary mb-1">EXERCISE DETAILS</span>
                  <h2 className="fw-bolder mb-0 text-dark">{exercise.name}</h2>
                </div>
                <span
                  className={`badge px-3 py-2 ${
                    exercise.difficulty === 'Beginner'
                      ? 'badge-diff-beginner'
                      : exercise.difficulty === 'Intermediate'
                      ? 'badge-diff-intermediate'
                      : 'badge-diff-advanced'
                  }`}
                >
                  {exercise.difficulty}
                </span>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded border">
                    <small className="text-muted text-uppercase fw-bold d-block">Target Muscle Group</small>
                    <span className="fs-5 fw-bold text-danger">{exercise.muscleGroup}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded border">
                    <small className="text-muted text-uppercase fw-bold d-block">Equipment Required</small>
                    <span className="fs-5 fw-bold text-dark">{exercise.equipment}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold">Description & Performance Guidelines</h5>
                <p className="text-muted">
                  {exercise.description || 'Compound or isolation movement intended to stimulate hypertrophy and strength.'}
                </p>
              </div>

              <div className="alert alert-secondary d-flex align-items-center mb-0 small">
                <i className="bi bi-info-circle-fill me-2 fs-5 text-primary"></i>
                <div>
                  Normal users have view-only rights for exercise records. Only administrators can modify or delete exercises.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetails;
