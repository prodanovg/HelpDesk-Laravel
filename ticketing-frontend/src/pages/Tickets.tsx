import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function Tickets() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch (error) {
            console.error('Failed to parse user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // Call logout API to invalidate token on server
            await api.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear localStorage regardless of API call success
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <strong>Helpdesk System</strong>
                    </a>
                    <div className="d-flex align-items-center">
                        <span className="text-white me-3">
                            Welcome, <strong>{user.name}</strong> ({user.role})
                        </span>
                        <button className="btn btn-outline-light" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col">
                        <h2>My Tickets</h2>
                        <p className="text-muted">Manage and track your support tickets</p>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary">
                            <i className="bi bi-plus-circle me-2"></i>
                            Create New Ticket
                        </button>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Account Information</h5>
                                <div className="row">
                                    <div className="col-md-4">
                                        <p className="mb-2">
                                            <strong>Name:</strong> {user.name}
                                        </p>
                                    </div>
                                    <div className="col-md-4">
                                        <p className="mb-2">
                                            <strong>Email:</strong> {user.email}
                                        </p>
                                    </div>
                                    <div className="col-md-4">
                                        <p className="mb-2">
                                            <strong>Role:</strong>{' '}
                                            <span className={`badge ${
                                                user.role === 'admin' ? 'bg-danger' :
                                                    user.role === 'manager' ? 'bg-warning' :
                                                        user.role === 'agent' ? 'bg-info' :
                                                            'bg-secondary'
                                            }`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Tickets</h5>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-info" role="alert">
                                    <i className="bi bi-info-circle me-2"></i>
                                    No tickets found. Create your first ticket to get started!
                                </div>

                                {/* Sample Tickets */}
                                <div className="list-group">
                                    <div className="list-group-item list-group-item-action">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">Sample: Login Issue</h6>
                                            <small className="text-muted">2 hours ago</small>
                                        </div>
                                        <p className="mb-1 text-muted">
                                            Cannot log in to my account...
                                        </p>
                                        <div className="d-flex gap-2 mt-2">
                                            <span className="badge bg-success">Open</span>
                                            <span className="badge bg-warning text-dark">Medium</span>
                                            <span className="badge bg-secondary">Support</span>
                                        </div>
                                    </div>

                                    <div className="list-group-item list-group-item-action">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">Sample: Payment Error</h6>
                                            <small className="text-muted">5 hours ago</small>
                                        </div>
                                        <p className="mb-1 text-muted">
                                            Getting 500 error on payment...
                                        </p>
                                        <div className="d-flex gap-2 mt-2">
                                            <span className="badge bg-info">In Progress</span>
                                            <span className="badge bg-danger">High</span>
                                            <span className="badge bg-secondary">Billing</span>
                                        </div>
                                    </div>

                                    <div className="list-group-item list-group-item-action">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">Sample: Feature Request</h6>
                                            <small className="text-muted">1 day ago</small>
                                        </div>
                                        <p className="mb-1 text-muted">
                                            Need dark mode option...
                                        </p>
                                        <div className="d-flex gap-2 mt-2">
                                            <span className="badge bg-secondary">Closed</span>
                                            <span className="badge bg-success">Low</span>
                                            <span className="badge bg-secondary">Development</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="row mt-4">
                    <div className="col-md-3">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <h3 className="text-primary">12</h3>
                                <p className="text-muted mb-0">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <h3 className="text-success">5</h3>
                                <p className="text-muted mb-0">Open</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <h3 className="text-info">4</h3>
                                <p className="text-muted mb-0">In Progress</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <h3 className="text-secondary">3</h3>
                                <p className="text-muted mb-0">Closed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
