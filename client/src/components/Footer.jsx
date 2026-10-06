import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom py-4 mt-auto">
      <div className="container">
        <div className="row gy-3 align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
              <span className="badge bg-danger me-2">REPX</span>
              <strong className="text-white">Fitness Management System</strong>
            </div>
            <p className="small text-secondary mb-0">
              Role-Based Fitness Management System using MERN Stack • 3IA Project
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small">
              <span className="badge bg-dark border border-secondary text-light">
                <i className="bi bi-shield-lock me-1"></i> RBAC Enabled
              </span>
              <span className="badge bg-dark border border-secondary text-light">
                <i className="bi bi-database-check me-1"></i> MongoDB
              </span>
              <span className="badge bg-dark border border-secondary text-light">
                <i className="bi bi-bootstrap me-1"></i> Bootstrap 5
              </span>
            </div>
            <p className="small text-muted mt-2 mb-0">
              &copy; {new Date().getFullYear()} REPX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
