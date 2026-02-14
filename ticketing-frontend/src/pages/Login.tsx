import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/login", {
                email,
                password
            });

            console.log("Login success:", response.data);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/tickets");
        } catch (err: unknown) {
            console.error("Login error:", err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || "Invalid credentials or server error");
            } else {
                setError("An unexpected error occurred");
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
                            <h3 className="text-center mb-3">Login</h3>

                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
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
                                    />
                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Login"}
                                </button>

                                <div className="text-center mt-3">
                                    <p className="text-muted mb-0">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                                            Register here
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
