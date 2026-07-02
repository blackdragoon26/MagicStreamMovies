import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Spinner from '../spinner/Spinner';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlay, faFilm, faVideo, faArrowLeft, faStar, faTv, 
    faShareAlt, faCloudUploadAlt, faCompress, faExpand, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import useAuth from '../../hooks/useAuth';

const StreamMovie = () => {
    const { imdb_id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const [movie, setMovie] = useState(null);
    const [moviesList, setMoviesList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Player modes: 'movie' (Full Movie), 'trailer' (YT Trailer), 'custom' (Pasted URL)
    const [playerMode, setPlayerMode] = useState('movie');
    const [customUrlInput, setCustomUrlInput] = useState('');
    const [currentPlayUrl, setCurrentPlayUrl] = useState('');
    const [isSavingUrl, setIsSavingUrl] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [theatreMode, setTheatreMode] = useState(false);

    // List of creative commons full movies for mock streaming defaults
    const fallbackStreams = {
        comedy: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        scifi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        drama: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        default: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };

    // Helper to get fallback movie stream URL based on genres
    const getFallbackStream = (genres) => {
        if (!genres || genres.length === 0) return fallbackStreams.default;
        const names = genres.map(g => g.genre_name.toLowerCase());
        if (names.includes('comedy')) return fallbackStreams.comedy;
        if (names.includes('sci-fi') || names.includes('scifi')) return fallbackStreams.scifi;
        if (names.includes('drama') || names.includes('western')) return fallbackStreams.drama;
        return fallbackStreams.default;
    };

    useEffect(() => {
        const fetchStreamData = async () => {
            setLoading(true);
            setSaveMessage('');
            try {
                // Fetch current movie details
                const movieRes = await axiosPrivate.get(`/movie/${imdb_id}`);
                const movieData = movieRes.data;
                setMovie(movieData);

                // Fetch other movies for the suggestions sidebar
                const allRes = await axiosPrivate.get('/movies');
                setMoviesList(allRes.data.filter(m => m.imdb_id !== imdb_id));

                // Decide what to play in 'movie' mode
                if (movieData.stream_url) {
                    setCurrentPlayUrl(movieData.stream_url);
                    setCustomUrlInput(movieData.stream_url);
                } else {
                    const fallback = getFallbackStream(movieData.genre);
                    setCurrentPlayUrl(fallback);
                    setCustomUrlInput('');
                }
                setPlayerMode('movie');
            } catch (error) {
                console.error("Error fetching stream data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStreamData();
    }, [imdb_id, axiosPrivate]);

    // Handle play button toggles
    const handleModeChange = (mode) => {
        setPlayerMode(mode);
        if (mode === 'movie') {
            setCurrentPlayUrl(movie.stream_url || getFallbackStream(movie.genre));
        } else if (mode === 'trailer') {
            setCurrentPlayUrl(`https://www.youtube.com/watch?v=${movie.youtube_id}`);
        } else if (mode === 'custom') {
            setCurrentPlayUrl(customUrlInput || movie.stream_url || getFallbackStream(movie.genre));
        }
    };

    // Update the player instantly with the custom pasted link
    const handleApplyCustomUrl = (e) => {
        e.preventDefault();
        if (customUrlInput.trim()) {
            setCurrentPlayUrl(customUrlInput);
            setPlayerMode('custom');
        }
    };

    // Save custom stream URL to the database for this movie
    const handleSaveStreamUrl = async () => {
        if (!customUrlInput.trim()) return;
        setIsSavingUrl(true);
        setSaveMessage('');
        try {
            const response = await axiosPrivate.patch(`/updatestreamurl/${movie.imdb_id}`, {
                stream_url: customUrlInput
            });
            setMovie(prev => ({ ...prev, stream_url: customUrlInput }));
            setSaveMessage('Success: Custom stream URL saved to library DB!');
            setCurrentPlayUrl(customUrlInput);
            setPlayerMode('movie');
        } catch (error) {
            console.error("Failed to save stream URL to DB:", error);
            setSaveMessage('Error: Failed to save URL to database.');
        } finally {
            setIsSavingUrl(false);
        }
    };

    if (loading) return <Spinner />;
    if (!movie) return (
        <div className="container py-5 text-center">
            <h3 className="text-white">Movie Not Found</h3>
            <Button onClick={() => navigate('/')} className="mt-3">Back to Home</Button>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ background: '#040407', minHeight: '95vh', color: '#fff' }}>
            
            {/* Immersive Cinema Player Room */}
            <div className="py-3 px-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#020204' }}>
                <div className={theatreMode ? "container-fluid px-lg-5" : "container"}>
                    
                    {/* Header bar of cinema room */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <Link to="/" className="text-muted d-flex align-items-center gap-2 text-decoration-none hover-white">
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Return to Catalog</span>
                        </Link>
                        
                        <div className="d-flex align-items-center gap-2">
                            <Button 
                                variant="outline-light" 
                                size="sm" 
                                onClick={() => setTheatreMode(!theatreMode)}
                                className="d-flex align-items-center gap-2"
                                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
                            >
                                <FontAwesomeIcon icon={theatreMode ? faCompress : faExpand} />
                                <span>{theatreMode ? "Default View" : "Cinema Mode"}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Movie Player Viewport Container */}
                    <div 
                        className="position-relative overflow-hidden mb-4 shadow-lg"
                        style={{
                            borderRadius: '16px',
                            border: '1.5px solid rgba(255, 255, 255, 0.06)',
                            aspectRatio: '16/9',
                            background: '#000',
                            boxShadow: playerMode === 'movie' || playerMode === 'custom' 
                                ? '0 10px 40px rgba(0, 240, 255, 0.08)' 
                                : '0 10px 40px rgba(139, 92, 246, 0.08)'
                        }}
                    >
                        <ReactPlayer 
                            controls={true} 
                            playing={true} 
                            url={currentPlayUrl} 
                            width='100%' 
                            height='100%'
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                    </div>

                    {/* Mode Tabs Control Center */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Button 
                                variant={playerMode === 'movie' ? 'info' : 'outline-light'}
                                size="sm"
                                onClick={() => handleModeChange('movie')}
                                className="d-flex align-items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faVideo} />
                                <span>Watch Full Movie</span>
                            </Button>
                            
                            <Button 
                                variant={playerMode === 'trailer' ? 'primary' : 'outline-light'}
                                size="sm"
                                onClick={() => handleModeChange('trailer')}
                                className="d-flex align-items-center gap-2"
                                style={playerMode === 'trailer' ? { background: 'linear-gradient(135deg, var(--accent-purple), #7c3aed)' } : {}}
                            >
                                <FontAwesomeIcon icon={faTv} />
                                <span>Watch Trailer</span>
                            </Button>

                            <Button 
                                variant={playerMode === 'custom' ? 'info' : 'outline-light'}
                                size="sm"
                                onClick={() => handleModeChange('custom')}
                                className="d-flex align-items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faShareAlt} />
                                <span>Custom Stream Feed</span>
                            </Button>
                        </div>

                        {playerMode === 'movie' && (
                            <div className="text-muted small">
                                {movie.stream_url ? (
                                    <span className="text-success fw-semibold">✓ Playing custom library stream</span>
                                ) : (
                                    <span>Playing open-source cinematic stream (CC license)</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Immersive details and suggestions section */}
            <div className="container py-5">
                <div className="row g-4">
                    {/* Left Column: Movie Info, Custom Link Management & Curator Notes */}
                    <div className="col-lg-8">
                        
                        {/* Title, rating, description info */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span className="movie-imdb-tag">IMDb: {movie.imdb_id}</span>
                                {movie.ranking?.ranking_name && (
                                    <span 
                                        className="badge" 
                                        style={{ 
                                            background: 'rgba(0, 240, 255, 0.12)', 
                                            color: 'var(--accent-cyan)',
                                            border: '1px solid rgba(0, 240, 255, 0.2)' 
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faStar} className="me-1" />
                                        {movie.ranking.ranking_name}
                                    </span>
                                )}
                            </div>
                            <h2 className="fw-bold text-white mb-3" style={{ fontFamily: 'Outfit', fontSize: '2.5rem' }}>
                                {movie.title}
                            </h2>
                            <div className="d-flex flex-wrap gap-1.5 mb-4">
                                {movie.genre && movie.genre.map(g => (
                                    <span key={g.genre_id} className="genre-pill-item">
                                        {g.genre_name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Custom stream link section */}
                        {playerMode === 'custom' && (
                            <div className="glass-card p-4 rounded-4 mb-4">
                                <h5 className="text-white fw-bold mb-2">
                                    <FontAwesomeIcon icon={faShareAlt} className="me-2 text-glow" style={{ color: 'var(--accent-cyan)' }} />
                                    Configure Custom Stream Feed
                                </h5>
                                <p className="text-muted small">
                                    Have a direct MP4, WebM, or HLS (m3u8) video streaming address? Enter it below to overlay the player instantly.
                                </p>
                                
                                <Form onSubmit={handleApplyCustomUrl} className="d-flex gap-2 mb-3">
                                    <Form.Control
                                        type="url"
                                        placeholder="https://example.com/movie.mp4"
                                        value={customUrlInput}
                                        onChange={e => setCustomUrlInput(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                                        required
                                    />
                                    <Button variant="info" type="submit">Play</Button>
                                </Form>

                                <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <div className="text-muted small">
                                        You can save this stream link to the catalog database for this movie.
                                    </div>
                                    <Button 
                                        variant="outline-info" 
                                        size="sm"
                                        onClick={handleSaveStreamUrl}
                                        disabled={isSavingUrl || !customUrlInput.trim()}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faCloudUploadAlt} />
                                        {isSavingUrl ? "Saving URL..." : "Save to Database"}
                                    </Button>
                                </div>
                                {saveMessage && (
                                    <div className={`alert mt-3 py-2 ${saveMessage.startsWith('Error') ? 'alert-danger' : 'alert-success'}`} style={{ fontSize: '0.85rem' }}>
                                        {saveMessage}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Professional Curator Notes */}
                        <div className="glass-card p-4 rounded-4 mb-4">
                            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: 'var(--accent-purple)' }} />
                                Curator Notes & Automated Insights
                            </h5>
                            
                            <div 
                                className="p-3.5 rounded-3 fs-6 mb-3" 
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.01)', 
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    color: '#d1d5db', 
                                    lineHeight: '1.7', 
                                    fontStyle: 'italic'
                                }}
                            >
                                "{movie.admin_review || "No review analysis has been curated for this movie yet. Admin reviewers will evaluate this release shortly."}"
                            </div>
                            
                            {movie.ranking?.ranking_name && (
                                <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span className="small text-muted">OpenAI Sentiment Rating Weight</span>
                                    <span className="badge bg-dark py-1.5 px-3" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                                        {movie.ranking.ranking_name} ({movie.ranking.ranking_value})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Suggested Cinema Grid Sidebar */}
                    <div className="col-lg-4">
                        <div className="glass-card p-4 rounded-4 sticky-top" style={{ top: '90px' }}>
                            <h5 className="text-white fw-bold mb-3">
                                <FontAwesomeIcon icon={faFilm} className="me-2 text-glow" style={{ color: 'var(--accent-cyan)' }} />
                                Up Next
                            </h5>
                            <p className="text-muted small mb-4">Select another release to stream instantly</p>
                            
                            <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '600px' }}>
                                {moviesList && moviesList.length > 0 ? (
                                    moviesList.map(item => (
                                        <Link 
                                            key={item._id} 
                                            to={`/stream/${item.imdb_id}`} 
                                            className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg text-decoration-none"
                                            style={{ 
                                                border: '1px solid rgba(255,255,255,0.04)', 
                                                background: 'rgba(255,255,255,0.01)',
                                                transition: 'var(--transition-smooth)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                            }}
                                        >
                                            <img 
                                                src={item.poster_path} 
                                                alt={item.title} 
                                                width="54" 
                                                height="76" 
                                                className="rounded"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <span className="d-block text-white fw-semibold small text-truncate" style={{ width: '190px' }}>
                                                    {item.title}
                                                </span>
                                                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                                    {item.genre && item.genre.map(g => g.genre_name).join(', ')}
                                                </span>
                                                {item.ranking?.ranking_name && (
                                                    <span className="text-glow small" style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: '600' }}>
                                                        {item.ranking.ranking_name}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-muted small text-center py-4">No other movies available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StreamMovie;