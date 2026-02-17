import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Agent {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Ticket {
    id: number;
    title: string;
    assignee?: {
        id: number;
        name: string;
    } | null;
}

interface AssignTicketModalProps {
    show: boolean;
    ticket: Ticket | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignTicketModal({ show, ticket, onClose, onSuccess }: AssignTicketModalProps) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            fetchAgents();
            setSelectedAgent('');
        }
    }, [show]);

    const fetchAgents = async () => {
        try {
            const response = await api.get('/api/users');
            const allUsers = response.data.data || response.data;

            const availableAgents = allUsers.filter(
                (user: Agent) => user.role === 'agent' || user.role === 'manager'
            );

            setAgents(availableAgents);
        } catch (error) {
            console.error('Error fetching agents:', error);
            setError('Failed to load agents');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;

        setLoading(true);
        setError('');

        try {
            await api.post(`/api/tickets/${ticket.id}/assign`, {
                assigned_to: parseInt(selectedAgent),
            });

            onSuccess();
            onClose();
            setSelectedAgent('');
        } catch (err: unknown) {
            console.error('Error assigning ticket:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to assign ticket');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!show || !ticket) return null;

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-person-plus me-2"></i>
                            {ticket.assignee ? 'Re-assign Ticket' : 'Assign Ticket'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Ticket</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={ticket.title}
                                    disabled
                                />
                            </div>

                            {ticket.assignee && (
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Currently Assigned To</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={ticket.assignee.name}
                                        disabled
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label htmlFor="agent" className="form-label fw-semibold">
                                    {ticket.assignee ? 'Re-assign to' : 'Assign to'} <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    id="agent"
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select an agent...</option>
                                    {agents.map((agent) => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.name} ({agent.role})
                                        </option>
                                    ))}
                                </select>
                                {agents.length === 0 && (
                                    <small className="text-muted">No agents available</small>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !selectedAgent}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {ticket.assignee ? 'Re-assigning...' : 'Assigning...'}
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        {ticket.assignee ? 'Re-assign Ticket' : 'Assign Ticket'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
