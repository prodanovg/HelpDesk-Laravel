import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import CreateTicketModal from '../components/CreateTicketModal';
import AssignTicketModal from '../components/AssignTicketModal';
import EditTicketModal from '../components/EditTicketModal';
import ChangeStatusModal from '../components/ChangeStatusModal';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Ticket {
    id: number;
    title: string;
    description: string;
    created_at: string;
    user_id: number;
    assigned_to?: number | null;
    status: {
        id: number;
        name: string;
        slug: string;
    };
    priority: {
        id: number;
        name: string;
        level: number;
    };
    team: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
    assignee?: {
        id: number;
        name: string;
    } | null;
}

export default function Tickets() {
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
            fetchTickets();
        } catch (error) {
            console.error('Failed to parse user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/tickets');
            setTickets(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Failed to load tickets');
        } finally {
            setLoading(false);
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

    const handleDeleteTicket = async (ticketId: number) => {
        if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/api/tickets/${ticketId}`);
            fetchTickets();
        } catch (err) {
            console.error('Error deleting ticket:', err);
            alert('Failed to delete ticket');
        }
    };

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        if (filterStatus !== 'all' && ticket.status.slug !== filterStatus) return false;
        if (filterPriority !== 'all' && ticket.priority.id.toString() !== filterPriority) return false;
        if (filterAssignee === 'unassigned' && ticket.assignee) return false;
        if (filterAssignee === 'assigned' && !ticket.assignee) return false;
        return true;
    });

    // Permission checks
    const canEditTicket = (ticket: Ticket): boolean => {
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'manager') return true;
        if (user.role === 'agent' && ticket.assigned_to === user.id) return true;
        if (user.role === 'customer' && ticket.user_id === user.id) return true;
        return false;
    };

    const canChangeStatus = (ticket: Ticket): boolean => {
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'manager') return true;
        if (user.role === 'agent' && ticket.assigned_to === user.id) return true;
        return false;
    };

    const canChangePriority = (): boolean => {
        if (!user) return false;
        return user.role === 'admin' || user.role === 'manager';
    };

    const canAssignTicket = (): boolean => {
        if (!user) return false;
        return user.role === 'admin' || user.role === 'manager';
    };

    // Modal handlers
    const handleAssignClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowAssignModal(true);
    };

    const handleEditClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowEditModal(true);
    };

    const handleStatusClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowStatusModal(true);
    };

    const handleTicketUpdated = () => {
        fetchTickets();
    };

    const getStatusBadgeClass = (slug: string) => {
        switch (slug) {
            case 'open': return 'bg-success';
            case 'in_progress': return 'bg-info';
            case 'closed': return 'bg-secondary';
            default: return 'bg-primary';
        }
    };

    const getPriorityBadgeClass = (level: number) => {
        if (level === 4) return 'bg-danger';
        if (level === 3) return 'bg-warning text-dark';
        if (level === 2) return 'bg-info';
        return 'bg-success';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
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
                        <i className="bi bi-headset me-2"></i>
                        <strong>Helpdesk System</strong>
                    </a>
                    <div className="d-flex align-items-center">
                        {user.role === 'admin' && (
                            <>
                                <button
                                    className="btn btn-outline-light btn-sm me-2"
                                    onClick={() => navigate('/users')}
                                >
                                    <i className="bi bi-people me-1"></i>
                                    Users
                                </button>
                                <button
                                    className="btn btn-outline-light btn-sm me-2"
                                    onClick={() => navigate('/teams')}
                                >
                                    <i className="bi bi-people-fill me-1"></i>
                                    Teams
                                </button>
                            </>
                        )}

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
                            <i className="bi bi-ticket-perforated me-2"></i>
                            My Tickets
                        </h2>
                        <p className="text-muted">Manage and track your support tickets</p>
                    </div>
                    {user.role === 'customer' && (
                        <div className="col-auto">
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Create New Ticket
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                {!loading && tickets.length > 0 && (
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card text-center shadow-sm border-0">
                                <div className="card-body">
                                    <h3 className="text-primary mb-0">{filteredTickets.length}</h3>
                                    <small className="text-muted">Total Tickets</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center shadow-sm border-0">
                                <div className="card-body">
                                    <h3 className="text-success mb-0">
                                        {filteredTickets.filter(t => t.status.slug === 'open').length}
                                    </h3>
                                    <small className="text-muted">Open</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center shadow-sm border-0">
                                <div className="card-body">
                                    <h3 className="text-info mb-0">
                                        {filteredTickets.filter(t => t.status.slug === 'in_progress').length}
                                    </h3>
                                    <small className="text-muted">In Progress</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center shadow-sm border-0">
                                <div className="card-body">
                                    <h3 className="text-secondary mb-0">
                                        {filteredTickets.filter(t => t.status.slug === 'closed').length}
                                    </h3>
                                    <small className="text-muted">Closed</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="row mb-3">
                    <div className="col-md-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small">
                                            <i className="bi bi-funnel me-1"></i>
                                            Filter by Status
                                        </label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small">
                                            <i className="bi bi-flag me-1"></i>
                                            Filter by Priority
                                        </label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={filterPriority}
                                            onChange={(e) => setFilterPriority(e.target.value)}
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="1">Low</option>
                                            <option value="2">Medium</option>
                                            <option value="3">High</option>
                                            <option value="4">Critical</option>
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small">
                                            <i className="bi bi-person me-1"></i>
                                            Filter by Assignment
                                        </label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={filterAssignee}
                                            onChange={(e) => setFilterAssignee(e.target.value)}
                                        >
                                            <option value="all">All Tickets</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="unassigned">Unassigned</option>
                                        </select>
                                    </div>
                                </div>

                                {(filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all') && (
                                    <div className="mt-3">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                                setFilterStatus('all');
                                                setFilterPriority('all');
                                                setFilterAssignee('all');
                                            }}
                                        >
                                            <i className="bi bi-x-circle me-1"></i>
                                            Clear Filters
                                        </button>
                                        <span className="ms-2 text-muted small">
                                            Showing {filteredTickets.length} of {tickets.length} tickets
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="mb-0">
                                    <i className="bi bi-list-ul me-2"></i>
                                    Tickets
                                </h5>
                            </div>
                            <div className="card-body">
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {error}
                                    </div>
                                )}

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Loading tickets...</p>
                                    </div>
                                ) : filteredTickets.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                                        {tickets.length === 0 ? (
                                            <>
                                                <p className="text-muted mt-3">No tickets found</p>
                                                {user.role === 'customer' && (
                                                    <button
                                                        className="btn btn-primary mt-2"
                                                        onClick={() => setShowCreateModal(true)}
                                                    >
                                                        <i className="bi bi-plus-circle me-2"></i>
                                                        Create Your First Ticket
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-muted mt-3">No tickets match your filters</p>
                                                <button
                                                    className="btn btn-outline-secondary mt-2"
                                                    onClick={() => {
                                                        setFilterStatus('all');
                                                        setFilterPriority('all');
                                                        setFilterAssignee('all');
                                                    }}
                                                >
                                                    <i className="bi bi-x-circle me-2"></i>
                                                    Clear Filters
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {filteredTickets.map((ticket) => (
                                            <div key={ticket.id} className="list-group-item border-bottom py-3">
                                                <div className="row align-items-center">
                                                    <div className="col-md-8">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h6 className="mb-1">
                                                                    <i className="bi bi-ticket-detailed me-2 text-primary"></i>
                                                                    {ticket.title}
                                                                </h6>
                                                                <p className="mb-2 text-muted small">
                                                                    {ticket.description.substring(0, 150)}
                                                                    {ticket.description.length > 150 ? '...' : ''}
                                                                </p>
                                                                <div className="d-flex gap-2 flex-wrap">
                                                                    <span className={`badge ${getStatusBadgeClass(ticket.status.slug)}`}>
                                                                        {ticket.status.name}
                                                                    </span>
                                                                    <span className={`badge ${getPriorityBadgeClass(ticket.priority.level)}`}>
                                                                        {ticket.priority.name}
                                                                    </span>
                                                                    <span className="badge bg-secondary">
                                                                        <i className="bi bi-people me-1"></i>
                                                                        {ticket.team.name}
                                                                    </span>
                                                                    {ticket.assignee ? (
                                                                        <span className="badge bg-dark">
                                                                            <i className="bi bi-person-check me-1"></i>
                                                                            {ticket.assignee.name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge bg-warning text-dark">
                                                                            <i className="bi bi-person-x me-1"></i>
                                                                            Unassigned
                                                                        </span>
                                                                    )}
                                                                    <small className="text-muted ms-2">
                                                                        <i className="bi bi-clock me-1"></i>
                                                                        {formatDate(ticket.created_at)}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-4 text-end">
                                                        {ticket.status.slug !== 'closed' ? (
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                {canEditTicket(ticket) && (
                                                                    <button
                                                                        className="btn btn-outline-primary"
                                                                        onClick={() => handleEditClick(ticket)}
                                                                        title="Edit ticket"
                                                                    >
                                                                        <i className="bi bi-pencil me-1"></i>
                                                                        Edit
                                                                    </button>
                                                                )}

                                                                {canChangeStatus(ticket) && (
                                                                    <button
                                                                        className="btn btn-outline-info"
                                                                        onClick={() => handleStatusClick(ticket)}
                                                                        title="Change status"
                                                                    >
                                                                        <i className="bi bi-arrow-repeat me-1"></i>
                                                                        Status
                                                                    </button>
                                                                )}

                                                                {canAssignTicket() && !ticket.assignee && (
                                                                    <button
                                                                        className="btn btn-outline-success"
                                                                        onClick={() => handleAssignClick(ticket)}
                                                                        title="Assign to agent"
                                                                    >
                                                                        <i className="bi bi-person-plus me-1"></i>
                                                                        Assign
                                                                    </button>
                                                                )}

                                                                {canAssignTicket() && ticket.assignee && (
                                                                    <button
                                                                        className="btn btn-outline-warning"
                                                                        onClick={() => handleAssignClick(ticket)}
                                                                        title="Re-assign ticket"
                                                                    >
                                                                        <i className="bi bi-arrow-repeat me-1"></i>
                                                                        Re-assign
                                                                    </button>
                                                                )}

                                                                {user.role === 'admin' && (
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => handleDeleteTicket(ticket.id)}
                                                                        title="Delete ticket"
                                                                    >
                                                                        <i className="bi bi-trash me-1"></i>
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                <span className="badge bg-secondary">
                                                                    <i className="bi bi-lock me-1"></i>
                                                                    Closed
                                                                </span>
                                                                {user.role === 'admin' && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDeleteTicket(ticket.id)}
                                                                        title="Delete ticket"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateTicketModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleTicketUpdated}
            />

            <AssignTicketModal
                show={showAssignModal}
                ticket={selectedTicket}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedTicket(null);
                }}
                onSuccess={handleTicketUpdated}
            />

            <EditTicketModal
                show={showEditModal}
                ticket={selectedTicket}
                canChangePriority={canChangePriority()}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTicket(null);
                }}
                onSuccess={handleTicketUpdated}
            />

            <ChangeStatusModal
                show={showStatusModal}
                ticket={selectedTicket}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedTicket(null);
                }}
                onSuccess={handleTicketUpdated}
            />
        </div>
    );
}
