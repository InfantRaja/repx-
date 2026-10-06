import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth callback redirect if parameters present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get('google_token');
    if (googleToken) {
      localStorage.setItem('repx_token', googleToken);
      const googleUser = {
        name: params.get('name') || 'Google User',
        email: params.get('email') || 'google_user@repx.com',
        role: params.get('role') || 'user'
      };
      localStorage.setItem('repx_user', JSON.stringify(googleUser));
      window.location.href = googleUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  // Google Single Sign-on Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('repx_token', data.token);
        localStorage.setItem('repx_user', JSON.stringify(data.user));
        window.location.href = data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      } else {
        setError(data.message || 'Google authentication failed');
      }
    } catch (err) {
      setError('Google authentication service unavailable. Please use standard credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for 3IA project demo
  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@repx.com');
      setPassword('Admin123!');
    } else {
      setEmail('user@repx.com');
      setPassword('User123!');
    }
    setError('');
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card card-custom shadow-lg border-0">
            <div className="card-header bg-dark text-white text-center py-4 border-0">
              <div className="d-inline-flex align-items-center mb-1">
                <span className="badge bg-danger fs-6 me-2">REPX</span>
                <span className="fs-5 fw-bold">Sign In</span>
              </div>
              <p className="text-secondary small mb-0">Role-Based Fitness Management System</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div>{error}</div>
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-envelope-at me-1"></i> Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="e.g. admin@repx.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold text-secondary mb-0">
                      <i className="bi bi-key me-1"></i> Password
                    </label>
                    <Link to="/forgot-password" className="text-decoration-none small text-muted">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i> LOGIN
                    </>
                  )}
                </button>
              </form>

              {/* Google OAuth / SSO Section */}
              <div className="d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="px-2 text-muted small fw-bold">OR</span>
                <hr className="flex-grow-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn btn-outline-dark w-100 mb-3 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>

              {/* Demo Quick-Fill Bar */}
              <div className="p-3 bg-light rounded-3 border mt-3">
                <small className="text-muted d-block fw-bold mb-2 text-center text-uppercase">
                  <i className="bi bi-lightning-charge text-danger me-1"></i> Quick Demo Auto-Fill (3IA Exam)
                </small>
                <div className="d-grid gap-2 d-sm-flex">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin')}
                    className="btn btn-sm btn-outline-danger flex-grow-1"
                  >
                    <i className="bi bi-shield-lock me-1"></i> Admin (admin@repx.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('user')}
                    className="btn btn-sm btn-outline-primary flex-grow-1"
                  >
                    <i className="bi bi-person me-1"></i> User (user@repx.com)
                  </button>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-danger fw-bold text-decoration-none">
                    Register here
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

export default Login;
