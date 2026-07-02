import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import SlixLogo from '../header/SlixLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faUser, faCreditCard, faLock, faRobot, faStar, faChevronLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import useAuth from '../../hooks/useAuth';

const Register = () => {
    const { setAuth } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('USER'); // USER or ADMIN
    const [favouriteGenres, setFavouriteGenres] = useState([]);
    const [genres, setGenres] = useState([]);

    // Checkout Details
    const [showCheckout, setShowCheckout] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGenreChange = (e) => {
        const options = Array.from(e.target.selectedOptions);
        setFavouriteGenres(options.map(opt => ({
            genre_id: Number(opt.value),
            genre_name: opt.label
        })));
    };

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (role === 'ADMIN') {
            setShowCheckout(true);
        } else {
            completeRegistration();
        }
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setCheckoutLoading(true);
        setError(null);

        // Simulate payment gateway transaction
        setTimeout(() => {
            setCheckoutLoading(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                completeRegistration();
            }, 1500);
        }, 2000);
    };

    const completeRegistration = async () => {
        setLoading(true);
        try {
            const payload = {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role: role,
                favourite_genres: favouriteGenres
            };
            const response = await axiosClient.post('/register', payload);
            if (response.data.error) {
                setError(response.data.error);
                setShowCheckout(false);
                return;
            }
            navigate('/login', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            setShowCheckout(false);
        } finally {
            setLoading(false);
        }
    };

    // Google Sign-In handler for registration (creates standard user instantly)
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
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Google registration failed:", err);
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
            if (window.google && window.google.accounts && !showCheckout) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse,
                    context: 'signup',
                    ux_mode: 'popup'
                });
                
                const btnContainer = document.getElementById('google-signup-btn');
                if (btnContainer) {
                    window.google.accounts.id.renderButton(
                        btnContainer,
                        { theme: 'filled_black', size: 'large', width: 340 }
                    );
                }
            }
        };

        const timer = setTimeout(initializeGoogleGSI, 500);
        return () => clearTimeout(timer);
    }, [showCheckout, isGoogleConfigured]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axiosClient.get('/genres');
                setGenres(response.data);
            } catch (error) {
                console.error('Error fetching movie genres:', error);
            }
        };
        fetchGenres();
    }, []);

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5 animate-fade-in">
            <div className="glass-card p-4 p-md-5 rounded-3 shadow-none" style={{ maxWidth: showCheckout ? 620 : 500, width: '100%', background: 'var(--bg-card)' }}>
                
                {!showCheckout ? (
                    <>
                        <div className="text-center mb-4 d-flex flex-column align-items-center">
                            <div className="mb-2">
                                <SlixLogo size={48} />
                            </div>
                            <h3 className="fw-bold text-white mb-1" style={{ fontFamily: 'Outfit' }}>Create Account</h3>
                            <p className="text-muted small">Register to start streaming cinema on Slix</p>
                            {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{error}</div>}                
                        </div>

                        <Form onSubmit={handleInitialSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-sm-6">
                                    <Form.Group>
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-sm-6">
                                    <Form.Group>
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <div className="row g-3 mb-3">
                                <div className="col-sm-6">
                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Min. 6 chars"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-sm-6">
                                    <Form.Group>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            isInvalid={!!confirmPassword && password !== confirmPassword}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Passwords mismatch.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Account Role Selector */}
                            <Form.Group className="mb-4">
                                <Form.Label className="d-block">Account Tier</Form.Label>
                                <div className="d-flex gap-3 mt-1">
                                    <div 
                                        className="flex-fill p-3 rounded border text-center cursor-pointer position-relative select-tier-card"
                                        style={{ 
                                            background: role === 'USER' ? 'rgba(255, 255, 255, 0.03)' : 'var(--bg-tertiary)',
                                            borderColor: role === 'USER' ? '#ffffff' : 'var(--border-color)',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-cinematic)'
                                        }}
                                        onClick={() => setRole('USER')}
                                    >
                                        <FontAwesomeIcon icon={faUser} className="mb-2 fs-5" style={{ color: role === 'USER' ? '#ffffff' : 'var(--text-muted)' }} />
                                        <span className="d-block text-white fw-bold" style={{ fontSize: '0.85rem' }}>Standard User</span>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Free • Watch Only</span>
                                    </div>
                                    <div 
                                        className="flex-fill p-3 rounded border text-center cursor-pointer position-relative select-tier-card"
                                        style={{ 
                                            background: role === 'ADMIN' ? 'rgba(229, 9, 20, 0.05)' : 'var(--bg-tertiary)',
                                            borderColor: role === 'ADMIN' ? 'var(--accent-red)' : 'var(--border-color)',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-cinematic)'
                                        }}
                                        onClick={() => setRole('ADMIN')}
                                    >
                                        <FontAwesomeIcon icon={faCrown} className="mb-2 fs-5" style={{ color: role === 'ADMIN' ? 'var(--accent-red)' : 'var(--text-muted)' }} />
                                        <span className="d-block text-white fw-bold" style={{ fontSize: '0.85rem' }}>Admin Curator</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: '600' }}>Premium • AI Reviews</span>
                                    </div>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Favorite Genres</Form.Label>
                                <Form.Select
                                    multiple
                                    value={favouriteGenres.map(g => String(g.genre_id))}
                                    onChange={handleGenreChange}
                                    style={{ height: '110px' }}
                                    required
                                >
                                    {genres.map(genre => (
                                        <option key={genre.genre_id} value={genre.genre_id} label={genre.genre_name}>
                                            {genre.genre_name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple genres.
                                </Form.Text>
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2.5 mb-3"
                                disabled={loading}
                                style={{ fontWeight: 600, letterSpacing: 0.5 }}
                            >
                                {role === 'ADMIN' ? 'Proceed to Billing Setup' : 'Register Account'}
                            </Button>                        
                        </Form>

                        {role === 'USER' && (
                            <>
                                <div className="d-flex align-items-center my-3 text-muted">
                                    <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                                    <span className="px-2 small uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Or register with</span>
                                    <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                                </div>

                                {/* Google Register button */}
                                <div className="d-flex justify-content-center mb-3">
                                    {isGoogleConfigured ? (
                                        <div id="google-signup-btn" className="google-login-btn-container"></div>
                                    ) : (
                                        <div className="text-center p-3 rounded" style={{ borderColor: 'rgba(255,255,255,0.06)', border: '1px solid', background: 'var(--bg-tertiary)', fontSize: '0.8rem', color: 'var(--text-secondary)', width: '100%' }}>
                                            Google Sign-Up is not configured. Set VITE_GOOGLE_CLIENT_ID in client .env to enable.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="text-center mt-4">
                            <span className="text-muted small">Already have an account? </span>
                            <Link to="/login" className="fw-semibold text-white small" style={{ textDecoration: 'none', borderBottom: '1px solid #e50914' }}>Sign In</Link>
                        </div>
                    </>
                ) : (
                    /* ADMIN CHECKOUT PAYWALL */
                    <div className="animate-fade-in">
                        {paymentSuccess ? (
                            <div className="text-center py-5 animate-fade-in">
                                <FontAwesomeIcon icon={faCheckCircle} className="mb-3" style={{ fontSize: '4.5rem', color: 'var(--accent-red)' }} />
                                <h3 className="text-white fw-bold">Payment Verified</h3>
                                <p className="text-muted">LLM Credits added. Provisioning Admin curator permissions...</p>
                                <div className="spinner-border text-light mt-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="d-flex align-items-center gap-2 mb-4 text-muted cursor-pointer" onClick={() => setShowCheckout(false)} style={{ cursor: 'pointer' }}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                    <span className="small fw-semibold">Back to registration details</span>
                                </div>

                                <div className="row g-4">
                                    {/* Left: Billing Explanation & Package Details */}
                                    <div className="col-md-6 border-end" style={{ borderColor: 'var(--border-color)' }}>
                                        <div className="pe-md-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <FontAwesomeIcon icon={faCrown} style={{ color: 'var(--accent-red)' }} />
                                                <span className="fw-bold text-white small" style={{ letterSpacing: '1px' }}>CURATOR TIERS</span>
                                            </div>
                                            <h4 className="text-white fw-bold mb-3" style={{ fontFamily: 'Outfit' }}>Admin Premium Checkout</h4>
                                            
                                            <div 
                                                className="p-3 rounded mb-3"
                                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                                            >
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <span className="text-white fw-bold small">Curator LLM Bundle</span>
                                                    <span className="badge bg-danger" style={{ background: 'var(--accent-red)', color: '#fff', fontSize: '0.75rem' }}>$14.99 One-time</span>
                                                </div>
                                                <span className="text-muted d-block" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                    Includes 1,000 automated sentiment analysis token requests.
                                                </span>
                                            </div>

                                            <div className="d-flex flex-column gap-3 fs-6">
                                                <div className="d-flex gap-2">
                                                    <FontAwesomeIcon icon={faRobot} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                                                    <span className="small text-muted" style={{ lineHeight: '1.4' }}>
                                                        <strong className="text-white">Azure OpenAI Inferencing:</strong> Becoming an Admin grants review modification powers which query Azure OpenAI API. Credits cover API usage fees.
                                                    </span>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <FontAwesomeIcon icon={faStar} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                                                    <span className="small text-muted" style={{ lineHeight: '1.4' }}>
                                                        <strong className="text-white">Sentiment Classification:</strong> Model automatically formats, evaluates tone, and updates movie ranking weights in real-time.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Payment Form */}
                                    <div className="col-md-6">
                                        <div className="ps-md-2">
                                            <h5 className="text-white fw-semibold mb-3">
                                                <FontAwesomeIcon icon={faCreditCard} className="me-2" style={{ color: 'var(--text-secondary)' }} />
                                                Card Details
                                            </h5>
                                            <Form onSubmit={handlePaymentSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small text-muted">Cardholder Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="John Doe"
                                                        value={cardName}
                                                        onChange={e => setCardName(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small text-muted">Card Number</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="4111 2222 3333 4444"
                                                        maxLength="19"
                                                        value={cardNumber}
                                                        onChange={e => setCardNumber(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>

                                                <div className="row g-2 mb-4">
                                                    <div className="col-7">
                                                        <Form.Group>
                                                            <Form.Label className="small text-muted">Expiry Date</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="MM/YY"
                                                                maxLength="5"
                                                                value={expiry}
                                                                onChange={e => setExpiry(e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-5">
                                                        <Form.Group>
                                                            <Form.Label className="small text-muted">CVV</Form.Label>
                                                            <Form.Control
                                                                type="password"
                                                                placeholder="***"
                                                                maxLength="4"
                                                                value={cvv}
                                                                onChange={e => setCvv(e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-2 mb-3 text-muted small justify-content-center">
                                                    <FontAwesomeIcon icon={faLock} style={{ fontSize: '0.8rem' }} />
                                                    <span>Secured with SSL 256-bit encryption</span>
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    className="w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
                                                    disabled={checkoutLoading}
                                                    style={{ background: 'var(--accent-red)', border: 'none' }}
                                                >
                                                    {checkoutLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            Authorizing Credit...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Confirm & Pay $14.99
                                                        </>
                                                    )}
                                                </Button>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </Container>
    );
}

export default Register;