import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit recovery request.');
      }
    } catch (err) {
      setError('Unable to reach authentication server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card card-custom shadow-lg border-0">
            <div className="card-header bg-dark text-white text-center py-4 border-0">
              <div className="d-inline-flex align-items-center mb-1">
                <span className="badge bg-danger fs-6 me-2">REPX</span>
                <span className="fs-5 fw-bold">Reset Password</span>
              </div>
              <p className="text-secondary small mb-0">Enter your registered email address to receive reset instructions</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div>{error}</div>
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              {submitted ? (
                <div className="text-center py-3">
                  <div className="display-4 text-success mb-3">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h5 className="fw-bold mb-2">Reset Instructions Dispatched</h5>
                  <p className="text-muted small mb-3">
                    We have dispatched password recovery instructions to <strong>{email}</strong>.
                    For development and exam testing, you can use the default demo password: <code className="bg-light px-2 py-1 rounded text-danger fw-bold">demo123456</code>.
                  </p>
                  <Link to="/login" className="btn btn-repx-primary w-100">
                    <i className="bi bi-arrow-left me-2"></i> Back to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary">
                      <i className="bi bi-envelope-at me-1"></i> Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="e.g. athlete@repx.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-repx-primary btn-lg w-100 mb-3 d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i> Send Recovery Instructions
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link to="/login" className="text-muted text-decoration-none small">
                      <i className="bi bi-arrow-left me-1"></i> Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
