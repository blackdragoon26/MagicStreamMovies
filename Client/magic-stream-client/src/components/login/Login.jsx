import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import SlixLogo from '../header/SlixLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
    const { setAuth } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";

    // Handle Google ID Token response
    const handleGoogleCredentialResponse = async (response) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosClient.post('/google-login', { credential: response.credential });
            if (res.data.error) {
                setError(res.data.error);
                return;
            }
            setAuth(res.data);
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Google login failed:", err);
            setError(err.response?.data?.error || "Google authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
        !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('mockclientid');

    // Initialize Google Identity Services
    useEffect(() => {
        if (!isGoogleConfigured) return;

        const initializeGoogleGSI = () => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse,
                    context: 'signin',
                    ux_mode: 'popup'
                });
                
                const btnContainer = document.getElementById('google-signin-btn');
                if (btnContainer) {
                    window.google.accounts.id.renderButton(
                        btnContainer,
                        { theme: 'filled_black', size: 'large', width: 340 }
                    );
                }
            }
        };

        // Delay slightly to ensure GSI script is fully loaded
        const timer = setTimeout(initializeGoogleGSI, 500);
        return () => clearTimeout(timer);
    }, [isGoogleConfigured]);
    
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
        <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5 animate-fade-in">
            <div className="glass-card p-4 p-md-5 rounded-3 shadow-none" style={{ maxWidth: 420, width: '100%', background: 'var(--bg-card)' }}>
                <div className="text-center mb-4 d-flex flex-column align-items-center">
                    <div className="mb-2">
                        <SlixLogo size={48} />
                    </div>
                    <h3 className="fw-bold text-white mb-1" style={{ fontFamily: 'Outfit' }}>Sign In</h3>
                    <p className="text-muted small">Access your personalized screenings catalog</p>
                </div>
                {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem', borderRadius: '4px' }}>{error}</div>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail" className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                style={{ paddingLeft: '40px' }}
                            />
                            <FontAwesomeIcon icon={faEnvelope} className="position-absolute text-muted" style={{ left: '14px', top: '16px' }} />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type="password"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                            <FontAwesomeIcon icon={faLock} className="position-absolute text-muted" style={{ left: '14px', top: '16px' }} />
                        </div>
                    </Form.Group>

                    <Button
                        variant="info"
                        type="submit"
                        className="w-100 py-2.5 mb-3"
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

                <div className="d-flex align-items-center my-3 text-muted">
                    <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                    <span className="px-2 small uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Or continue with</span>
                    <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Google Login integration */}
                <div className="d-flex justify-content-center mb-3">
                    {isGoogleConfigured ? (
                        <div id="google-signin-btn" className="google-login-btn-container"></div>
                    ) : (
                        <div className="text-center p-3 rounded" style={{ borderColor: 'rgba(255,255,255,0.06)', border: '1px solid', background: 'var(--bg-tertiary)', fontSize: '0.8rem', color: 'var(--text-secondary)', width: '100%' }}>
                            Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in client .env to enable.
                        </div>
                    )}
                </div>

                <div className="text-center mt-4">
                    <span className="text-muted small">Don't have an account? </span>
                    <Link to="/register" className="fw-semibold text-white small" style={{ textDecoration: 'none', borderBottom: '1px solid #e50914' }}>Register here</Link>
                </div>
            </div>
        </Container>
    )
}
export default Login;