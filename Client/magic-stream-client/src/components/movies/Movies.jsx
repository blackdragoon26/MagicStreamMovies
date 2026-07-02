import Movie from '../movie/Movie'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const Movies = ({ movies, updateMovieReview, message }) => {
    return (
        <div className="container py-4 animate-fade-in">
            <div className="row g-4">
                {movies && movies.length > 0 ? (
                    movies.map((movie) => (
                        <Movie key={movie._id} updateMovieReview={updateMovieReview} movie={movie} />
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="glass-card p-5 d-inline-block mx-auto" style={{ maxWidth: '480px' }}>
                            <FontAwesomeIcon 
                                icon={faFolderOpen} 
                                className="mb-3 text-glow" 
                                style={{ fontSize: '3rem', color: 'var(--accent-cyan)' }} 
                            />
                            <h4 className="text-white fw-bold mb-2">No Movies Found</h4>
                            <p className="text-muted mb-0">{message || "We couldn't find any movies in this section. Please check back later."}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Movies;