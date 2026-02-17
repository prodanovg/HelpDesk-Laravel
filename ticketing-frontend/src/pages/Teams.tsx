import {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../lib/axios';

interface Team {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    role: string;
}

export default function Teams() {
    const [user, setUser] = useState<User | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
    });
    const [submitting, setSubmitting] = useState(false);

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
            const parsedUser = JSON.parse(userData);

            if (parsedUser.role !== 'admin') {
                navigate('/tickets');
                return;
            }

            setUser(parsedUser);
            fetchTeams();
        } catch (error) {
            console.error('Failed to parse user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/teams');
            setTeams(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (team?: Team) => {
        if (team) {
            setEditingTeam(team);
            setFormData({
                name: team.name,
                description: team.description || '',
                is_active: team.is_active,
            });
        } else {
            setEditingTeam(null);
            setFormData({
                name: '',
                description: '',
                is_active: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTeam(null);
        setFormData({name: '', description: '', is_active: true});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            if (editingTeam) {
                await api.put(`/api/teams/${editingTeam.id}`, formData);
            } else {
                await api.post('/api/teams', formData);
            }

            handleCloseModal();
            fetchTeams();
        } catch (err: unknown) {
            console.error('Error saving team:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to save team');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (teamId: number) => {
        if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/api/teams/${teamId}`);
            fetchTeams();
        } catch (err: unknown) {
            console.error('Error deleting team:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { error?: string } } };
                alert(error.response?.data?.error || 'Failed to delete team');
            } else {
                alert('Failed to delete team');
            }
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

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
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
                        <button
                            className="btn btn-outline-light btn-sm me-2"
                            onClick={() => navigate('/users')}
                        >
                            <i className="bi bi-people me-1"></i>
                            Users
                        </button>
                        <span className="text-white me-3">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>{user.name}</strong>
                            <span className="badge bg-light text-dark ms-2">{user.role}</span>
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
                            <i className="bi bi-people-fill me-2"></i>
                            Team Management
                        </h2>
                        <p className="text-muted">Manage support teams</p>
                    </div>
                    <div className="col-auto">
                        <button
                            className="btn btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add New Team
                        </button>
                    </div>
                </div>

                {/* Teams Table */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="mb-0">
                                    <i className="bi bi-list-ul me-2"></i>
                                    All Teams
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
                                        <p className="mt-2 text-muted">Loading teams...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {teams.map((team) => (
                                                <tr key={team.id}>
                                                    <td>#{team.id}</td>
                                                    <td>
                                                        <i className="bi bi-people me-2"></i>
                                                        <strong>{team.name}</strong>
                                                    </td>
                                                    <td>
                                                            <span className="text-muted">
                                                                {team.description || 'No description'}
                                                            </span>
                                                    </td>
                                                    <td>
                                                            <span
                                                                className={`badge ${team.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                                {team.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        {new Date(team.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => handleOpenModal(team)}
                                                                title="Edit team"
                                                            >
                                                                <i className="bi bi-pencil me-1"></i>
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(team.id)}
                                                                title="Delete team"
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Delete
                                                            </button>
                                                        </div>
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

            {/* Add/Edit Team Modal */}
            {showModal && (
                <div
                    className="modal fade show"
                    style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
                    onClick={handleCloseModal}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-people-fill me-2"></i>
                                    {editingTeam ? 'Edit Team' : 'Add New Team'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                ></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label fw-semibold">
                                            Team Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                            disabled={submitting}
                                            placeholder="e.g., Technical Support"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label fw-semibold">
                                            Description
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            disabled={submitting}
                                            placeholder="Brief description of the team..."
                                        ></textarea>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            disabled={submitting}
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseModal}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                {editingTeam ? 'Update Team' : 'Create Team'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
