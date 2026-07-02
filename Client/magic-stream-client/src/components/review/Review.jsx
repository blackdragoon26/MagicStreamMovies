import { Form, Button } from 'react-bootstrap';
import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Movie from '../movie/Movie';
import Spinner from '../spinner/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenNib, faCommentDots, faRobot, faShieldHalved, faStar } from '@fortawesome/free-solid-svg-icons';

const Review = () => {
    const [movie, setMovie] = useState({});
    const [loading, setLoading] = useState(false);
    const revText = useRef();
    const { imdb_id } = useParams();
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchMovie = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get(`/movie/${imdb_id}`);
                setMovie(response.data);
            } catch (error) {
                console.error('Error fetching movie:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [imdb_id, axiosPrivate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosPrivate.patch(`/updatereview/${imdb_id}`, { admin_review: revText.current.value });
            
            setMovie(() => ({
                ...movie,
                admin_review: response.data?.admin_review ?? movie.admin_review,
                ranking: {
                    ranking_name: response.data?.ranking_name ?? movie.ranking?.ranking_name,
                    ranking_value: response.data?.ranking_value ?? movie.ranking?.ranking_value
                }
            }));
        } catch (err) {
            console.error('Error updating review:', err);
        } finally {
            setLoading(false);
        }
    }; 

    return (
        <div className="container py-5 animate-fade-in" style={{ minHeight: '90vh' }}>
            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="mb-4 text-center text-md-start">
                        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
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
                                <FontAwesomeIcon icon={faShieldHalved} className="me-1" />
                                {auth?.role === "ADMIN" ? "ADMIN WORKSPACE" : "CRITIC FEEDBACK"}
                            </span>
                        </div>
                        <h2 className="text-white fw-bold mb-1" style={{ fontFamily: 'Outfit', fontSize: '2.2rem' }}>
                            {auth?.role === "ADMIN" ? (
                                <>
                                    <FontAwesomeIcon icon={faPenNib} className="me-2 text-glow" style={{ color: 'var(--accent-cyan)' }} />
                                    Review Editor & Sentiment Curator
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCommentDots} className="me-2 text-glow-purple" style={{ color: 'var(--accent-purple)' }} />
                                    Admin Review & Ratings
                                </>
                            )}
                        </h2>
                        <p className="text-muted mb-0">
                            {auth?.role === "ADMIN" 
                                ? "Write your thoughts below. Submission triggers Azure OpenAI models to automatically rate and classify review sentiment." 
                                : "Read the professional curator review and automated sentiment categorization for this release."}
                        </p>
                    </div>

                    <div className="row mt-4 g-4 justify-content-center">
                        {/* Movie Card Preview */}
                        <div className="col-lg-4 col-md-5 d-flex align-items-stretch">
                            <div className="glass-card w-100 p-4 d-flex flex-column justify-content-between align-items-center">
                                <h5 className="text-glow text-white fw-semibold mb-3 w-100 text-center pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    Selected Title
                                </h5>
                                <div className="w-100 d-flex justify-content-center py-2">
                                    <Movie movie={movie} />
                                </div>
                            </div>
                        </div>

                        {/* Review Interface */}
                        <div className="col-lg-6 col-md-7 d-flex align-items-stretch">
                            <div className="glass-card w-100 p-4 d-flex flex-column justify-content-between">
                                {auth && auth.role === "ADMIN" ? (
                                    <Form onSubmit={handleSubmit} className="d-flex flex-column h-100 justify-content-between">
                                        <div>
                                            <Form.Group className="mb-4" controlId="adminReviewTextarea">
                                                <Form.Label className="fs-5 text-white fw-semibold mb-2">
                                                    Curator Notes & Analysis
                                                </Form.Label>
                                                <Form.Control
                                                    ref={revText}
                                                    required
                                                    as="textarea"
                                                    rows={8}
                                                    defaultValue={movie?.admin_review}
                                                    placeholder="Provide details about the plot, performance, cinematography, and production quality..."
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.01)',
                                                        borderColor: 'rgba(255,255,255,0.08)',
                                                        fontSize: '1rem',
                                                        lineHeight: '1.6',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            </Form.Group>
                                            
                                            <div 
                                                className="p-3 mb-4 rounded-3 d-flex align-items-start gap-3" 
                                                style={{ 
                                                    background: 'rgba(0, 240, 255, 0.03)', 
                                                    border: '1px solid rgba(0, 240, 255, 0.15)' 
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faRobot} className="mt-1" style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }} />
                                                <div>
                                                    <span className="d-block text-white fw-semibold" style={{ fontSize: '0.9rem' }}>AI Sentiment Pipeline Enabled</span>
                                                    <span className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                        Azure OpenAI models analyze your wording. The rating (e.g. Excellent, Okay, Terrible) updates based on review tone.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <Button variant="info" type="submit" size="lg" className="w-100 w-md-auto">
                                                Analyze & Submit Review
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    <div className="d-flex flex-column h-100 justify-content-between">
                                        <div>
                                            <h5 className="fs-5 text-white fw-semibold mb-3">Professional Review</h5>
                                            <div 
                                                className="p-4 rounded-3 mb-4 fs-6" 
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.01)', 
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    lineHeight: '1.7',
                                                    color: 'var(--text-primary)',
                                                    fontStyle: 'italic'
                                                }}
                                            >
                                                "{movie.admin_review || "No review has been written for this movie yet. The curator will post a review shortly."}"
                                            </div>

                                            {movie.ranking?.ranking_name && (
                                                <div 
                                                    className="p-3 rounded-3 d-flex align-items-center justify-content-between" 
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.02)', 
                                                        border: '1px solid rgba(255,255,255,0.05)' 
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FontAwesomeIcon icon={faStar} style={{ color: 'var(--accent-cyan)' }} />
                                                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Categorized Sentiment Rating</span>
                                                    </div>
                                                    <span 
                                                        className="badge fs-6 py-2 px-3 bg-dark"
                                                        style={{ 
                                                            border: '1px solid var(--accent-cyan)', 
                                                            color: 'var(--accent-cyan)',
                                                            textTransform: 'uppercase' 
                                                        }}
                                                    >
                                                        {movie.ranking.ranking_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="alert alert-warning py-2 mb-0 d-flex align-items-center gap-2 mt-4" style={{ fontSize: '0.85rem' }}>
                                            <FontAwesomeIcon icon={faShieldHalved} />
                                            Standard users do not have permissions to modify movie reviews.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Review;