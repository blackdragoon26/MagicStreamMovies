import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useEffect, useState } from 'react';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Recommended = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchRecommendedMovies = async () => {
            setLoading(true);
            setMessage("");

            try {
                const response = await axiosPrivate.get('/recommendedmovies');
                setMovies(response.data);
                if (response.data.length === 0) {
                    setMessage("We don't have any recommendation for you based on your selected favorite genres yet. Try updating your account settings.");
                }
            } catch (error) {
                console.error("Error fetching recommended movies:", error);
                setMessage("Could not load recommended movies.");
            } finally {
                setLoading(false);
            }

        }
        fetchRecommendedMovies();
    }, [])

    return (
        <div className="container py-5" style={{ minHeight: '90vh' }}>
            {loading ? (
                <Spinner />
            ) : (
                <div className="animate-fade-in">
                    <div className="mb-5 px-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span 
                                className="badge" 
                                style={{ 
                                    background: 'rgba(244, 63, 94, 0.15)', 
                                    color: '#f43f5e',
                                    border: '1px solid rgba(244, 63, 94, 0.25)',
                                    fontWeight: '600',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                PERSONALIZED FOR YOU
                            </span>
                        </div>
                        <h2 className="text-white fw-bold mb-1" style={{ fontFamily: 'Outfit', fontSize: '2.2rem' }}>
                            <FontAwesomeIcon icon={faHeart} className="me-2 text-glow-purple" style={{ color: 'var(--accent-purple)' }} />
                            Recommended Movies
                        </h2>
                        <p className="text-muted mb-0">These movies are curated based on your favorite genres and ranked by admin sentiment ratings.</p>
                    </div>

                    <Movies movies={movies} message={message} />
                </div>
            )}
        </div>
    )

}
export default Recommended