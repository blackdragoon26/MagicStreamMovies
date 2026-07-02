import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axiosClient from '../../api/axiosConfig';
import SlixLogo from '../header/SlixLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faFilm, faImage, faTv, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';

const AddMovie = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    // Data States
    const [title, setTitle] = useState('');
    const [imdbId, setImdbId] = useState('');
    const [posterPath, setPosterPath] = useState('');
    const [youtubeId, setYoutubeId] = useState('');
    const [streamUrl, setStreamUrl] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    
    // UI/UX States
    const [availableGenres, setAvailableGenres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch genres list from database
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await axiosClient.get('/genres');
                setAvailableGenres(res.data);
            } catch (err) {
                console.error("Failed to load genres:", err);
            }
        };
        fetchGenres();
    }, []);

    // Block non-admin users on frontend
    if (!auth || auth.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const handleGenreToggle = (genre) => {
        const isSelected = selectedGenres.some(g => g.genre_id === genre.genre_id);
        if (isSelected) {
            setSelectedGenres(prev => prev.filter(g => g.genre_id !== genre.genre_id));
        } else {
            setSelectedGenres(prev => [...prev, { genre_id: genre.genre_id, genre_name: genre.genre_name }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (selectedGenres.length === 0) {
            setError("Please select at least one genre.");
            setLoading(false);
            return;
        }

        // Format data to match models.Movie schema
        const payload = {
            imdb_id: imdbId.trim(),
            title: title.trim(),
            poster_path: posterPath.trim(),
            youtube_id: youtubeId.trim(),
            stream_url: streamUrl.trim(),
            genre: selectedGenres,
            admin_review: "",
            ranking: {
                ranking_value: 5,
                ranking_name: "PENDING"
            }
        };

        try {
            await axiosPrivate.post('/addmovie', payload);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error("Failed to add movie:", err);
            setError(err.response?.data?.error || "Failed to add movie to catalog. Verify that all fields are correct.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5 animate-fade-in" style={{ minHeight: '90vh' }}>
            <div className="mb-4">
                <Button 
                    variant="link" 
                    onClick={() => navigate(-1)} 
                    className="text-muted p-0 d-flex align-items-center gap-2 text-decoration-none hover-white"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Back</span>
                </Button>
            </div>

            <div className="glass-card p-4 p-md-5 rounded-4 mx-auto" style={{ maxWidth: '720px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <SlixLogo size={42} />
                    <div>
                        <h3 className="text-white fw-bold mb-0" style={{ fontFamily: 'Outfit' }}>
                            Add Movie to Catalog
                        </h3>
                        <p className="text-muted mb-0 small">Populate the library catalog with new screenings</p>
                    </div>
                </div>

                {error && <Alert variant="danger" className="py-2.5 small">{error}</Alert>}
                {success && (
                    <Alert variant="success" className="py-2.5 small d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Movie added successfully! Redirecting to catalog...</span>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group controlId="movieTitle">
                                <Form.Label className="text-muted small">Movie Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Interstellar"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group controlId="movieImdbId">
                                <Form.Label className="text-muted small">IMDb ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. tt1119646"
                                    value={imdbId}
                                    onChange={e => setImdbId(e.target.value)}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="moviePoster">
                                <Form.Label className="text-muted small">Poster Image URL</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://image.tmdb.org/t/p/..."
                                    value={posterPath}
                                    onChange={e => setPosterPath(e.target.value)}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="movieYoutube">
                                <Form.Label className="text-muted small">YouTube Trailer Video ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. 9PSXjr1gbjc"
                                    value={youtubeId}
                                    onChange={e => setYoutubeId(e.target.value)}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group controlId="movieStream">
                                <Form.Label className="text-muted small">Stream URL (Optional)</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com/stream.mp4"
                                    value={streamUrl}
                                    onChange={e => setStreamUrl(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12} className="mt-4">
                            <Form.Label className="text-white fw-semibold small mb-2 d-block">Select Movie Genres</Form.Label>
                            <div className="row g-2">
                                {availableGenres.map(genre => {
                                    const isSelected = selectedGenres.some(g => g.genre_id === genre.genre_id);
                                    return (
                                        <div className="col-4 col-sm-3" key={genre.genre_id}>
                                            <div 
                                                className="py-2 px-1 rounded border text-center cursor-pointer select-none"
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: isSelected ? 'rgba(229, 9, 20, 0.12)' : 'var(--bg-tertiary)',
                                                    borderColor: isSelected ? '#e50914' : 'var(--border-color)',
                                                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onClick={() => handleGenreToggle(genre)}
                                            >
                                                {genre.genre_name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Col>
                    </Row>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 py-2.5 mt-5 fw-bold"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Appending to Catalog...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                                Add Movie to Catalog
                            </>
                        )}
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

export default AddMovie;
