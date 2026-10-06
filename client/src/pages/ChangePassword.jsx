import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setStatus({ type: 'danger', message: 'All fields are required.' });
      return;
    }

    // Password strength check
    const hasUpper = /[A-Z]/.test(formData.newPassword);
    const hasLower = /[a-z]/.test(formData.newPassword);
    const hasNumber = /[0-9]/.test(formData.newPassword);

    if (formData.newPassword.length < 8 || !hasUpper || !hasLower || !hasNumber) {
      setStatus({
        type: 'danger',
        message: 'New password must be at least 8 characters and contain uppercase, lowercase, and a number.'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'danger', message: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData);
      setStatus({ type: 'success', message: 'Password updated successfully! Next login will require the new password.' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setStatus({ type: 'danger', message: err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 fade-in">
      <div className="row g-4">
        <div className="col-lg-3">
          <Sidebar />
        </div>

        <div className="col-lg-9">
          <div className="card card-custom p-4">
            <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
              <div className="stat-icon bg-danger bg-opacity-10 text-danger">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0">Change Account Password</h4>
                <small className="text-muted">Update your security credentials securely</small>
              </div>
            </div>

            {status.message && (
              <div
                className={`alert alert-${status.type} alert-dismissible fade show d-flex align-items-center`}
                role="alert"
              >
                <i
                  className={`bi ${
                    status.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
                  } me-2 fs-5`}
                ></i>
                <div>{status.message}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setStatus({ type: '', message: '' })}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-control"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  placeholder="Enter new password (min. 8 characters)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                <div className="form-text small">
                  Must include uppercase, lowercase, and a number.
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-repx-primary px-4 d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i> Save New Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
