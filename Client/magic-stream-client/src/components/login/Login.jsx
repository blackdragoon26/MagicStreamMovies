import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/MagicStreamLogo.png';

const Login = () => {
    
    const { setAuth } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);       

        try {
            const response = await axiosClient.post('/login', { email, password });
            if (response.data.error) {
                setError(response.data.error);
                return;
            }
            setAuth(response.data);
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    }; 
    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
            <div className="glass-card p-4 p-md-5 rounded-4 shadow animate-fade-in" style={{ maxWidth: 420, width: '100%' }}>
                <div className="text-center mb-4">
                    <img 
                        src={logo} 
                        alt="Logo" 
                        width={60} 
                        className="mb-2" 
                        style={{ filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.4))' }} 
                    />
                    <h2 className="fw-bold text-white mb-1" style={{ fontFamily: 'Outfit' }}>Welcome Back</h2>
                    <p className="text-muted">Sign in to resume cinema streaming</p>
                </div>
                {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail" className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button
                        variant="info"
                        type="submit"
                        className="w-100 py-2.5 mb-2"
                        disabled={loading}
                        style={{ fontWeight: 600, letterSpacing: 0.5 }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Authenticating...
                            </>
                        ) : 'Sign In'}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <span className="text-muted small">Don't have an account? </span>
                    <Link to="/register" className="fw-semibold text-white small" style={{ textDecoration: 'none', color: 'var(--accent-cyan)' }}>Register here</Link>
                </div>
            </div>
        </Container>
    )
}
export default Login;