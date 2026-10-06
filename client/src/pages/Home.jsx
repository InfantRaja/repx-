import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="home-page fade-in">
      {/* Hero Section */}
      <section className="bg-dark text-white py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-center text-lg-start">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill bg-danger bg-opacity-25 border border-danger border-opacity-50 text-light small fw-bold">
                <i className="bi bi-shield-check text-danger"></i> 3IA Academic Project • MERN Stack
              </div>
              <h1 className="display-4 fw-bolder mb-3 text-white">
                <span className="text-danger">REPX</span>
                <span className="d-block fs-2 text-light fw-semibold">Fitness Management System</span>
              </h1>
              <p className="lead text-secondary mb-4" style={{ maxWidth: '600px' }}>
                A secure, role-based fitness platform built with MongoDB, Express.js, React, Node.js, and Bootstrap 5.
                Delivering segregated administrator management and view-only user access controls.
              </p>
              
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="btn btn-repx-primary btn-lg px-4 shadow">
                      <i className="bi bi-box-arrow-in-right me-2"></i> LOGIN
                    </Link>
                    <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                      <i className="bi bi-person-plus me-2"></i> SIGN UP
                    </Link>
                  </>
                ) : (
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
                    className="btn btn-repx-primary btn-lg px-4 shadow"
                  >
                    <i className="bi bi-speedometer2 me-2"></i> Go to {isAdmin ? 'Admin' : 'User'} Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="card bg-secondary bg-opacity-10 border-light border-opacity-25 text-white p-4 shadow-lg rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-danger">LIVE DEMO ACCESS</span>
                  <span className="text-muted small"><i className="bi bi-clock-history me-1"></i>3IA Evaluation</span>
                </div>
                <h5 className="fw-bold mb-3">Role-Based Access Control (RBAC)</h5>
                <div className="text-start">
                  <div className="p-3 mb-2 rounded bg-dark border border-secondary">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-danger">ADMIN ROLE</span>
                      <small className="text-white-50">Full CRUD & Management</small>
                    </div>
                    <small className="text-muted d-block">Manage Users, Exercises, Workouts & Fitness Records</small>
                  </div>
                  <div className="p-3 rounded bg-dark border border-secondary">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-primary">NORMAL USER</span>
                      <small className="text-white-50">View-Only Access</small>
                    </div>
                    <small className="text-muted d-block">Search & filter exercises, explore workouts, change password</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold text-uppercase mb-2">
              System Capabilities
            </span>
            <h2 className="fw-bolder">What You Can Do with REPX</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              Engineered specifically to fulfill the 3IA project objectives with strict role isolation and clean modular architecture.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card card-custom h-100 p-3 text-center border-0 shadow-sm">
                <div className="stat-icon bg-danger bg-opacity-10 text-danger mx-auto mb-3">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h5 className="fw-bold">Role-Based Access</h5>
                <p className="text-muted small">
                  Backend JWT verification + admin middleware with frontend ProtectedRoute and AdminRoute protections.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card card-custom h-100 p-3 text-center border-0 shadow-sm">
                <div className="stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                  <i className="bi bi-activity"></i>
                </div>
                <h5 className="fw-bold">Exercise Catalog</h5>
                <p className="text-muted small">
                  Search by exercise name and filter dynamically by muscle group, equipment, and difficulty levels.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card card-custom h-100 p-3 text-center border-0 shadow-sm">
                <div className="stat-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                  <i className="bi bi-journal-text"></i>
                </div>
                <h5 className="fw-bold">Workout Programs</h5>
                <p className="text-muted small">
                  Curated workout regimens detailing target muscles, exercise pairings, recommended sets, reps, and durations.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card card-custom h-100 p-3 text-center border-0 shadow-sm">
                <div className="stat-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                  <i className="bi bi-database-gear"></i>
                </div>
                <h5 className="fw-bold">CRUD Operations</h5>
                <p className="text-muted small">
                  Complete Create, Read, Update, and Delete operations for administrators with real-time MongoDB persistence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Comparison Table Section */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-secondary px-3 py-2 rounded-pill fw-bold text-uppercase mb-2">
              Security Matrix
            </span>
            <h2 className="fw-bolder">Role Comparison & Access Matrix</h2>
            <p className="text-muted">Direct visual comparison of permissions between Admin and Normal User</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card card-custom overflow-hidden border-0 shadow">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 text-center align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th className="text-start py-3 ps-4">Feature / Action</th>
                        <th className="py-3">
                          <span className="badge bg-danger px-3 py-2">ADMIN</span>
                        </th>
                        <th className="py-3">
                          <span className="badge bg-primary px-3 py-2">NORMAL USER</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">View Exercises & Workouts</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">Search & Filter Exercises</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">Change Account Password</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">Access Admin Dashboard & Statistics</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-x-circle-fill text-danger fs-5" title="Blocked with 403 Forbidden"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">Add / Edit / Delete Exercises</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-x-circle-fill text-danger fs-5"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">Add / Edit / Delete Workouts</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-x-circle-fill text-danger fs-5"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">User Management (Add, Edit, Delete Users)</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-x-circle-fill text-danger fs-5"></i></td>
                      </tr>
                      <tr>
                        <td className="text-start ps-4 fw-semibold">Operations CRUD Dashboard</td>
                        <td><i className="bi bi-check-circle-fill text-success fs-5"></i></td>
                        <td><i className="bi bi-x-circle-fill text-danger fs-5"></i></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold text-uppercase mb-2">
                Project Information
              </span>
              <h3 className="fw-bolder mb-3">About REPX Fitness Management System</h3>
              <p className="text-muted">
                REPX was developed as an academic 3IA project demonstrating end-to-end full-stack development using the MERN stack:
              </p>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>MongoDB:</strong> NoSQL database storing User, Exercise, Workout, and FitnessRecord collections.
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>Express.js & Node.js:</strong> Modular REST API layer with JWT authentication and RBAC middleware.
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>React.js:</strong> Interactive single-page application with context API and role-based routing.
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>Bootstrap 5:</strong> Clean, responsive UI components conforming strictly to project specifications.
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="card card-custom p-4 bg-light border">
                <h5 className="fw-bold mb-3"><i className="bi bi-key-fill text-danger me-2"></i>Demo Evaluation Credentials</h5>
                <p className="small text-muted mb-3">Pre-seeded accounts ready for immediate 3IA examination testing:</p>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered bg-white mb-3">
                    <thead className="table-secondary">
                      <tr>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge bg-danger">ADMIN</span></td>
                        <td><code>admin@repx.com</code></td>
                        <td><code>Admin123!</code></td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-primary">USER</span></td>
                        <td><code>user@repx.com</code></td>
                        <td><code>User123!</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-repx-primary btn-sm flex-grow-1">
                    Try Login Now
                  </Link>
                  <Link to="/register" className="btn btn-outline-secondary btn-sm flex-grow-1">
                    Create New Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
