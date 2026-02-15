import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface CurrentUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function Users() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            const user = JSON.parse(userData);

            // Only admins can access this page
            if (user.role !== 'admin') {
                navigate('/tickets');
                return;
            }

            setCurrentUser(user);
            fetchUsers();
        } catch (error) {
            console.error('Failed to parse user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users');
            setUsers(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        try {
            await api.put(`/api/users/${userId}`, { role: newRole });
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error('Error changing role:', err);
            alert('Failed to change user role');
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-danger';
            case 'manager': return 'bg-warning text-dark';
            case 'agent': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    if (!currentUser) {
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
                        <i className="bi bi-headset me-2"></i>
                        <strong>Helpdesk System</strong>
                    </a>
                    <div className="d-flex align-items-center">
                        <button
                            className="btn btn-outline-light btn-sm me-2"
                            onClick={() => navigate('/tickets')}
                        >
                            <i className="bi bi-ticket me-1"></i>
                            Tickets
                        </button>
                        <span className="text-white me-3">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>{currentUser.name}</strong>
                            <span className="badge bg-light text-dark ms-2">{currentUser.role}</span>
                        </span>
                        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col">
                        <h2>
                            <i className="bi bi-people me-2"></i>
                            User Management
                        </h2>
                        <p className="text-muted">Manage user roles and permissions</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="mb-0">
                                    <i className="bi bi-list-ul me-2"></i>
                                    All Users
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                {error && (
                                    <div className="alert alert-danger m-3" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {error}
                                    </div>
                                )}

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Loading users...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Registered</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>#{user.id}</td>
                                                    <td>
                                                        <i className="bi bi-person me-2"></i>
                                                        {user.name}
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        {user.id !== currentUser.id ? (
                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-outline-secondary dropdown-toggle"
                                                                    type="button"
                                                                    data-bs-toggle="dropdown"
                                                                >
                                                                    Change Role
                                                                </button>
                                                                <ul className="dropdown-menu">
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleRoleChange(user.id, 'customer')}
                                                                            disabled={user.role === 'customer'}
                                                                        >
                                                                            <i className="bi bi-person me-2"></i>
                                                                            Customer
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleRoleChange(user.id, 'agent')}
                                                                            disabled={user.role === 'agent'}
                                                                        >
                                                                            <i className="bi bi-headset me-2"></i>
                                                                            Agent
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleRoleChange(user.id, 'manager')}
                                                                            disabled={user.role === 'manager'}
                                                                        >
                                                                            <i className="bi bi-briefcase me-2"></i>
                                                                            Manager
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                                                            disabled={user.role === 'admin'}
                                                                        >
                                                                            <i className="bi bi-shield-check me-2"></i>
                                                                            Admin
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">Current User</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
