import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-danger text-center p-4">
              <div className="card-body">
                <div className="text-danger mb-3">
                  <i className="bi bi-shield-slash-fill" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="card-title text-danger fw-bold">403 Forbidden</h2>
                <h5 className="text-secondary mb-3">Access Denied: Administrator Rights Required</h5>
                <p className="text-muted">
                  Hello <strong>{user?.name}</strong>, your account role is 
                  <span className="badge bg-primary ms-1 text-uppercase">{user?.role}</span>.
                  You do not have permission to access the REPX Admin Management portal.
                </p>
                <div className="alert alert-warning text-start py-2 small" role="alert">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Role-Based Access Control (RBAC) is actively enforced on both client routing and backend APIs.
                </div>
                <div className="mt-4 d-flex justify-content-center gap-2">
                  <Link to="/user/dashboard" className="btn btn-repx-primary">
                    <i className="bi bi-speedometer2 me-1"></i> Return to User Dashboard
                  </Link>
                  <Link to="/user/exercises" className="btn btn-outline-secondary">
                    <i className="bi bi-activity me-1"></i> Browse Exercises
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
