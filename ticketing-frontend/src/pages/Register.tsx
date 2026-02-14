import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            console.log('Registration success:', response.data);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/tickets');
        } catch (err: unknown) {
            console.error('Registration error:', err);

            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as {
                    response?: {
                        data?: {
                            errors?: Record<string, string[]>;
                            message?: string;
                        }
                    }
                };

                if (error.response?.data?.errors) {
                    const errors = error.response.data.errors;
                    const firstError = Object.values(errors)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
                } else {
                    setError(error.response?.data?.message || 'Registration failed');
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="text-center mb-3">Register</h3>

                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <small className="text-muted">
                                        Minimum 6 characters
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    className="btn btn-success w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Register'}
                                </button>

                                <div className="text-center mt-3">
                                    <p className="text-muted mb-0">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                                            Login here
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
