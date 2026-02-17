import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Priority {
    id: number;
    name: string;
    level: number;
}

interface Ticket {
    id: number;
    title: string;
    description: string;
    priority: {
        id: number;
        name: string;
    };
}

interface EditTicketModalProps {
    show: boolean;
    ticket: Ticket | null;
    canChangePriority: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditTicketModal({ show, ticket, canChangePriority, onClose, onSuccess }: EditTicketModalProps) {
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ticket_priority_id: '',
    });

    useEffect(() => {
        if (show && ticket) {
            setFormData({
                title: ticket.title,
                description: ticket.description,
                ticket_priority_id: ticket.priority.id.toString(),
            });

            if (canChangePriority) {
                fetchPriorities();
            }
        }
    }, [show, ticket, canChangePriority]);

    const fetchPriorities = async () => {
        try {
            const response = await api.get('/api/ticket-priorities');
            setPriorities(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching priorities:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;

        setLoading(true);
        setError('');

        try {
            await api.put(`/api/tickets/${ticket.id}`, {
                title: formData.title,
                description: formData.description,
            });

            if (canChangePriority && formData.ticket_priority_id !== ticket.priority.id.toString()) {
                await api.patch(`/api/tickets/${ticket.id}/priority`, {
                    ticket_priority_id: parseInt(formData.ticket_priority_id),
                });
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error('Error updating ticket:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to update ticket');
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

    if (!show || !ticket) return null;

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
                            <i className="bi bi-pencil me-2"></i>
                            Edit Ticket
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
                                    disabled={loading}
                                ></textarea>
                            </div>

                            {canChangePriority && (
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
                                        {priorities.map((priority) => (
                                            <option key={priority.id} value={priority.id}>
                                                {priority.name}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Only managers and admins can change priority
                                    </small>
                                </div>
                            )}
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
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Update Ticket
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
