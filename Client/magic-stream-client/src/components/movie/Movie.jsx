import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faStar, faFilm } from '@fortawesome/free-solid-svg-icons';
import "./Movie.css";

const Movie = ({ movie, updateMovieReview }) => {
    // Determine rating color based on ranking value
    const getRatingBadgeStyle = (value) => {
        if (value <= 2) return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
        if (value === 3) return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
    };

    const ratingStyle = movie.ranking?.ranking_value ? getRatingBadgeStyle(movie.ranking.ranking_value) : {};

    return (
        <div className="col-md-4 col-sm-6 mb-4" key={movie._id}>
            <div className="glass-card h-100 movie-card-wrapper overflow-hidden d-flex flex-column">
                <Link
                    to={`/stream/${movie.imdb_id}`}
                    style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'block' }}
                >
                    <div className="movie-poster-container">
                        <img 
                            src={movie.poster_path} 
                            alt={movie.title} 
                            className="movie-poster-img"
                        />
                        <div className="movie-poster-overlay">
                            <span className="play-btn-glow">
                                <FontAwesomeIcon icon={faCirclePlay} />
                            </span>
                        </div>
                    </div>
                </Link>
                
                <div className="card-body p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h5 className="movie-title-text mb-0 text-white" title={movie.title}>{movie.title}</h5>
                    </div>

                    <div className="movie-meta-details mb-3">
                        <span className="movie-imdb-tag">
                            <FontAwesomeIcon icon={faFilm} className="me-1" />
                            {movie.imdb_id}
                        </span>
                    </div>

                    <div className="movie-genres-row mb-3 d-flex flex-wrap gap-1">
                        {movie.genre && movie.genre.map((g) => (
                            <span key={g.genre_id} className="genre-pill-item">
                                {g.genre_name}
                            </span>
                        ))}
                    </div>
                    
                    <div className="mt-auto d-flex align-items-center justify-content-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {movie.ranking?.ranking_name ? (
                            <span className="rating-pill-badge" style={ratingStyle}>
                                <FontAwesomeIcon icon={faStar} className="me-1" style={{ fontSize: '0.8rem' }} />
                                {movie.ranking.ranking_name}
                            </span>
                        ) : <span className="text-muted" style={{ fontSize: '0.8rem' }}>No Rating</span>}

                        {updateMovieReview && (
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={e => {
                                    e.preventDefault();
                                    updateMovieReview(movie.imdb_id);
                                }}
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '6px 14px',
                                    borderRadius: '6px'
                                }}
                            >
                                Review
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Movie;