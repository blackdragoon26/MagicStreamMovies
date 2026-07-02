import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosConfig'
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faInfoCircle, faStar, faVideo } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Home = ({ updateMovieReview }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState();
    const [featuredMovie, setFeaturedMovie] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setMessage("");
            try {
                const response = await axiosClient.get('/movies');
                setMovies(response.data);
                if (response.data.length === 0) {
                    setMessage('There are currently no movies available')
                } else {
                    // Set the first movie with an "Excellent" ranking or just the first movie as the featured hero
                    const excellent = response.data.find(m => m.ranking?.ranking_name?.toLowerCase() === 'excellent');
                    setFeaturedMovie(excellent || response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching movies:', error)
                setMessage("Error fetching movies")
            } finally {
                setLoading(false)
            }
        }
        fetchMovies();
    }, []);

    return (
        <div style={{ minHeight: '90vh' }}>
            {loading ? (
                <Spinner />
            ) : (
                <>
                    {/* Featured Hero Banner */}
                    {featuredMovie && (
                        <div 
                            className="position-relative d-flex align-items-end" 
                            style={{
                                height: '56vh',
                                minHeight: '400px',
                                backgroundImage: `linear-gradient(to bottom, rgba(7, 7, 10, 0.3) 0%, rgba(7, 7, 10, 0.95) 100%), url(${featuredMovie.poster_path})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 20%',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Ambient Blur Backdrop */}
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: `url(${featuredMovie.poster_path})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'blur(80px) opacity(0.35)',
                                    zIndex: 0
                                }}
                            />

                            <div className="container position-relative pb-5 animate-fade-in" style={{ zIndex: 2 }}>
                                <div className="row">
                                    <div className="col-lg-6 col-md-8">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <span 
                                                className="badge" 
                                                style={{ 
                                                    background: 'rgba(0, 240, 255, 0.15)', 
                                                    color: 'var(--accent-cyan)',
                                                    border: '1px solid rgba(0, 240, 255, 0.25)',
                                                    fontWeight: '600',
                                                    padding: '6px 12px',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                FEATURED CINEMA
                                            </span>
                                            {featuredMovie.ranking?.ranking_name && (
                                                <span 
                                                    className="badge" 
                                                    style={{ 
                                                        background: 'rgba(139, 92, 246, 0.15)', 
                                                        color: 'var(--accent-purple)',
                                                        border: '1px solid rgba(139, 92, 246, 0.25)',
                                                        fontWeight: '600',
                                                        padding: '6px 12px',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faStar} className="me-1" />
                                                    {featuredMovie.ranking.ranking_name}
                                                </span>
                                            )}
                                        </div>
                                        <h1 
                                            className="text-white fw-bold mb-3" 
                                            style={{ 
                                                fontFamily: 'Outfit', 
                                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                                lineHeight: 1.1,
                                                letterSpacing: '-1px'
                                            }}
                                        >
                                            {featuredMovie.title}
                                        </h1>
                                        {featuredMovie.admin_review && (
                                            <p className="text-secondary mb-4 fs-5 fw-light" style={{ lineHeight: '1.5', opacity: 0.9 }}>
                                                "{featuredMovie.admin_review}"
                                            </p>
                                        )}
                                        <div className="d-flex align-items-center gap-3">
                                            <Button 
                                                as={Link}
                                                to={`/stream/${featuredMovie.imdb_id}`}
                                                variant="info" 
                                                className="d-flex align-items-center gap-2 py-2.5 px-4"
                                            >
                                                <FontAwesomeIcon icon={faPlay} />
                                                Play Movie
                                            </Button>
                                            {updateMovieReview && (
                                                <Button 
                                                    variant="outline-light" 
                                                    onClick={() => updateMovieReview(featuredMovie.imdb_id)}
                                                    className="d-flex align-items-center gap-2 py-2.5 px-4"
                                                >
                                                    <FontAwesomeIcon icon={faInfoCircle} />
                                                    Reviews & Info
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Movie List Section */}
                    <div className="container mt-5">
                        <div className="d-flex align-items-center justify-content-between mb-4 px-3">
                            <div>
                                <h3 className="text-white fw-bold mb-0" style={{ fontFamily: 'Outfit' }}>
                                    <FontAwesomeIcon icon={faVideo} className="me-2 text-glow" style={{ color: 'var(--accent-cyan)' }} />
                                    Explore Library
                                </h3>
                                <p className="text-muted mb-0 small">Select a movie to stream, read reviews, or add custom feeds</p>
                            </div>
                            <span className="text-muted small fw-semibold bg-dark px-3 py-1.5 rounded-pill border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                {movies.length} Movies Available
                            </span>
                        </div>
                        <Movies movies={movies} updateMovieReview={updateMovieReview} message={message} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
