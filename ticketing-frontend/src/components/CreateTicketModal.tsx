import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Team {
    id: number;
    name: string;
}

interface Priority {
    id: number;
    name: string;
    level: number;
}

interface CreateTicketModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTicketModal({ show, onClose, onSuccess }: CreateTicketModalProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        team_id: '',
        ticket_priority_id: '',
    });

    useEffect(() => {
        if (show) {
            fetchTeamsAndPriorities();
        }
    }, [show]);

    const fetchTeamsAndPriorities = async () => {
        try {
            const [teamsRes, prioritiesRes] = await Promise.all([
                api.get('/api/teams'),
                api.get('/api/ticket-priorities'),
            ]);
            setTeams(teamsRes.data.data || teamsRes.data);
            setPriorities(prioritiesRes.data.data || prioritiesRes.data);
        } catch (error) {
            console.error('Error fetching teams/priorities:', error);
            setError('Failed to load form data');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/api/tickets', {
                title: formData.title,
                description: formData.description,
                team_id: parseInt(formData.team_id),
                ticket_priority_id: parseInt(formData.ticket_priority_id),
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                team_id: '',
                ticket_priority_id: '',
            });

            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error('Error creating ticket:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to create ticket');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-plus-circle me-2"></i>
                            Create New Ticket
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
                                <div className="alert alert-danger alert-dismissible fade show">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setError('')}
                                    ></button>
                                </div>
                            )}

                            <div className="mb-3">
                                <label htmlFor="title" className="form-label fw-semibold">
                                    Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Brief description of the issue"
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="description" className="form-label fw-semibold">
                                    Description <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Provide detailed information about your issue..."
                                    disabled={loading}
                                ></textarea>
                                <small className="text-muted">
                                    Be as specific as possible to help us resolve your issue faster
                                </small>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="team_id" className="form-label fw-semibold">
                                            Team <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="team_id"
                                            name="team_id"
                                            value={formData.team_id}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select a team...</option>
                                            {teams.map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="ticket_priority_id" className="form-label fw-semibold">
                                            Priority <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="ticket_priority_id"
                                            name="ticket_priority_id"
                                            value={formData.ticket_priority_id}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select priority...</option>
                                            {priorities.map((priority) => (
                                                <option key={priority.id} value={priority.id}>
                                                    {priority.name}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-muted">
                                            Select based on urgency and impact
                                        </small>
                                    </div>
                                </div>
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Create Ticket
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
