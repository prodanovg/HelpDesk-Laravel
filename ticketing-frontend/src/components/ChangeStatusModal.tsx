import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Status {
    id: number;
    name: string;
    slug: string;
}

interface Ticket {
    id: number;
    title: string;
    status: {
        id: number;
        name: string;
        slug: string;
    };
}

interface ChangeStatusModalProps {
    show: boolean;
    ticket: Ticket | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChangeStatusModal({ show, ticket, onClose, onSuccess }: ChangeStatusModalProps) {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && ticket) {
            setSelectedStatus(ticket.status.id.toString());
            fetchStatuses();
        }
    }, [show, ticket]);

    const fetchStatuses = async () => {
        try {
            const response = await api.get('/api/ticket-statuses');
            setStatuses(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
            setError('Failed to load statuses');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;

        setLoading(true);
        setError('');

        try {
            await api.patch(`/api/tickets/${ticket.id}/status`, {
                ticket_status_id: parseInt(selectedStatus),
            });

            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error('Error changing status:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to change status');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (slug: string) => {
        switch (slug) {
            case 'open': return 'bg-success';
            case 'in_progress': return 'bg-info';
            case 'closed': return 'bg-secondary';
            default: return 'bg-primary';
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
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Change Ticket Status
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

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Current Status
                                </label>
                                <div>
                                    <span className={`badge ${getStatusBadgeClass(ticket.status.slug)} fs-6`}>
                                        {ticket.status.name}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="status" className="form-label fw-semibold">
                                    New Status <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    id="status"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    {statuses.map((status) => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
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
                                disabled={loading || selectedStatus === ticket.status.id.toString()}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Change Status
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
