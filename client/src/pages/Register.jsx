import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    // Password validation: min 8, uppercase, lowercase, number
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else {
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);

      if (formData.password.length < 8) {
        errs.password = 'Password must be at least 8 characters long.';
      } else if (!hasUpper || !hasLower || !hasNumber) {
        errs.password = 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-6">
          <div className="card card-custom shadow-lg border-0">
            <div className="card-header bg-dark text-white text-center py-4 border-0">
              <div className="d-inline-flex align-items-center mb-1">
                <span className="badge bg-danger fs-6 me-2">REPX</span>
                <span className="fs-5 fw-bold">Create Account</span>
              </div>
              <p className="text-secondary small mb-0">Role-Based Fitness Management System</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {serverError && (
                <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div>{serverError}</div>
                  <button type="button" className="btn-close" onClick={() => setServerError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Alex Johnson"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="name@repx.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Role Selection (Allowed for academic 3IA demonstration) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Select Role <span className="text-danger">*</span>
                  </label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="user">Normal User (View-only fitness access)</option>
                    <option value="admin">Admin (Full management & CRUD access)</option>
                  </select>
                  <div className="form-text small">
                    Academic Note: Both roles are validated and verified server-side.
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password ? (
                    <div className="invalid-feedback">{errors.password}</div>
                  ) : (
                    <div className="form-text small">
                      Must contain uppercase, lowercase, and a number (e.g. User123!).
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-secondary">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-repx-primary btn-lg w-100 mb-3 d-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check-fill me-2"></i> SIGN UP
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="text-muted mb-0">
                  Already registered?{' '}
                  <Link to="/login" className="text-danger fw-bold text-decoration-none">
                    Log in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
