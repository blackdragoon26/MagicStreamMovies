import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosConfig';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';
import ReactPlayer from 'react-player';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlay, faPause, faChevronLeft, faChevronRight, 
    faStar, faTv, faFilm, faInfoCircle, faVolumeMute, faVolumeUp 
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import SlixLogo from '../header/SlixLogo';

const Home = ({ updateMovieReview }) => {
    const { auth, setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    // Data states
    const [movies, setMovies] = useState([]);
    const [displayMovies, setDisplayMovies] = useState([]); // Movies playing in cinematic slideshow
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState();
    
    // Intro loading screen states
    const [introProgress, setIntroProgress] = useState(0);
    const [showIntro, setShowIntro] = useState(true);

    // Onboarding Genre selection states
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [savingGenres, setSavingGenres] = useState(false);

    // Slideshow control states
    const [activeIdx, setActiveIdx] = useState(0);
    const [activeTab, setActiveTab] = useState('trailer'); // 'trailer' | 'storyline' | 'cast'
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [videoProgress, setVideoProgress] = useState(0);

    // Effect 1: Intro Preloader Simulation (Runs ONLY once on mount)
    useEffect(() => {
        let progVal = 0;
        const interval = setInterval(() => {
            progVal += Math.floor(Math.random() * 15) + 5;
            if (progVal >= 100) {
                progVal = 100;
                clearInterval(interval);
                setTimeout(() => setShowIntro(false), 500);
            }
            setIntroProgress(progVal);
        }, 80);

        return () => clearInterval(interval);
    }, []);

    // Effect 2: Onboarding Check for empty favorite genres
    useEffect(() => {
        if (auth && (!auth.favourite_genres || auth.favourite_genres.length === 0)) {
            setShowOnboarding(true);
            const fetchGenres = async () => {
                try {
                    const res = await axiosClient.get('/genres');
                    setAvailableGenres(res.data);
                } catch (err) {
                    console.error("Failed to load genres:", err);
                }
            };
            fetchGenres();
        } else {
            setShowOnboarding(false);
        }
    }, [auth]);

    // Effect 3: Fetch movie library (Runs when auth?.user_id or genres change)
    useEffect(() => {
        const fetchMoviesData = async () => {
            setLoading(true);
            try {
                // Fetch All Movies
                const response = await axiosClient.get('/movies');
                setMovies(response.data);

                // Fetch Recommendations if logged in and has genres
                if (auth && auth.favourite_genres && auth.favourite_genres.length > 0) {
                    try {
                        const recResponse = await axiosPrivate.get('/recommendedmovies');
                        if (recResponse.data && recResponse.data.length > 0) {
                            setDisplayMovies(recResponse.data);
                        } else {
                            setDisplayMovies(response.data);
                        }
                    } catch (err) {
                        console.warn("Failed fetching recommended, falling back to all", err);
                        setDisplayMovies(response.data);
                    }
                } else {
                    // Randomize order for guest user slideshow showcase
                    const shuffled = [...response.data].sort(() => 0.5 - Math.random());
                    setDisplayMovies(shuffled.slice(0, 5));
                }

                if (response.data.length === 0) {
                    setMessage('There are currently no movies available');
                }
            } catch (error) {
                console.error('Error fetching movies:', error);
                setMessage("Error loading library");
            } finally {
                setLoading(false);
            }
        };

        fetchMoviesData();
    }, [auth?.user_id, JSON.stringify(auth?.favourite_genres)]);

    const handleSaveGenres = async () => {
        setSavingGenres(true);
        try {
            await axiosPrivate.patch('/updategenres', { favourite_genres: selectedGenres });
            const updatedAuth = { ...auth, favourite_genres: selectedGenres };
            setAuth(updatedAuth);
            setShowOnboarding(false);
        } catch (error) {
            console.error("Failed to save genres:", error);
        } finally {
            setSavingGenres(false);
        }
    };

    // Handle slide change
    const nextSlide = () => {
        setActiveIdx((prev) => (prev + 1) % displayMovies.length);
        setVideoProgress(0);
    };

    const prevSlide = () => {
        setActiveIdx((prev) => (prev - 1 + displayMovies.length) % displayMovies.length);
        setVideoProgress(0);
    };

    // Auto rotate slide if video ends or paused
    const handleProgress = (state) => {
        setVideoProgress(state.played * 100);
    };

    const activeMovie = displayMovies[activeIdx];

    if (loading || showIntro) {
        return (
            <div 
                className="d-flex flex-column align-items-center justify-content-center min-vh-100"
                style={{ background: '#030304', color: '#fff', transition: 'opacity 0.5s ease-out' }}
            >
                <div className="text-center animate-fade-in d-flex flex-column align-items-center" style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
                    <div className="mb-3">
                        <SlixLogo size={52} />
                    </div>
                    <h1 className="fw-bold tracking-tight text-white mb-2" style={{ fontFamily: 'Outfit', fontSize: '2.5rem', letterSpacing: '4px' }}>
                        SLIX
                    </h1>
                    <p className="text-muted small uppercase mb-4" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>
                        THE WORLD IS NOT PREPARED
                    </p>
                    
                    {/* Linear Loader */}
                    <div className="cinema-banner-track mb-3" style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="cinema-banner-progress" style={{ width: `${introProgress}%` }}></div>
                    </div>
                    
                    <span className="text-muted small fw-bold" style={{ fontSize: '0.9rem', color: '#e50914' }}>
                        {introProgress}%
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#030304', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
            
            {/* Cinematic Motion Hero Showcase */}
            {activeMovie && (
                <div 
                    className="position-relative d-flex align-items-center justify-content-center"
                    style={{
                        height: '78vh',
                        minHeight: '520px',
                        background: '#030304',
                        overflow: 'hidden',
                        padding: '24px 0'
                    }}
                >
                    <div className="container position-relative h-100 d-flex flex-column justify-content-between" style={{ zIndex: 10 }}>
                        
                        {/* Upper Info Row */}
                        <div className="d-flex align-items-center justify-content-between">
                            <span 
                                className="small fw-semibold text-white tracking-widest uppercase"
                                style={{ letterSpacing: '3px', fontSize: '0.8rem' }}
                            >
                                {auth ? "RECOMMENDED SCREENINGS" : "PREVIEW HIGHLIGHTS"}
                            </span>
                            
                            <div className="d-flex align-items-center gap-3">
                                <span className="small text-muted">
                                    {activeIdx + 1} / {displayMovies.length}
                                </span>
                            </div>
                        </div>

                        {/* Central Cinema Motion Frame */}
                        <div className="row justify-content-center my-auto w-100 align-items-center">
                            <div className="col-lg-10 col-xl-9 position-relative">
                                
                                {/* Video Container Frame */}
                                <div 
                                    className="position-relative overflow-hidden shadow-2xl"
                                    style={{
                                        aspectRatio: '21/9',
                                        borderRadius: '20px',
                                        border: '1.5px solid #141417',
                                        background: '#000',
                                        minHeight: '260px'
                                    }}
                                >
                                    {/* Video Player */}
                                    <ReactPlayer 
                                        url={`https://www.youtube.com/watch?v=${activeMovie.youtube_id}`}
                                        playing={isPlaying}
                                        muted={isMuted}
                                        controls={false}
                                        width="100%"
                                        height="100%"
                                        onProgress={handleProgress}
                                        onEnded={nextSlide}
                                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                                    />

                                    {/* Subtitle / Headline Overlay */}
                                    <div 
                                        className="position-absolute d-flex flex-column justify-content-end p-4 p-md-5"
                                        style={{
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'linear-gradient(to top, rgba(3, 3, 4, 0.95) 0%, rgba(3, 3, 4, 0.2) 60%, rgba(3, 3, 4, 0.1) 100%)'
                                        }}
                                    >
                                        <div className="row align-items-end">
                                            <div className="col-md-8 text-start">
                                                <h2 className="text-white fw-bold display-6 mb-2" style={{ fontFamily: 'Outfit', letterSpacing: '-1px' }}>
                                                    {activeMovie.title}
                                                </h2>
                                                
                                                {/* Text Overlay inspired by screenshot */}
                                                <p className="text-secondary small mb-3 max-w-lg d-none d-sm-block" style={{ lineHeight: '1.4' }}>
                                                    {activeTab === 'storyline' && (activeMovie.admin_review || "No curated critical analysis has been recorded for this film.")}
                                                    {activeTab === 'cast' && `IMDb Tag ID: ${activeMovie.imdb_id}. Genres: ${activeMovie.genre?.map(g => g.genre_name).join(', ')}.`}
                                                    {activeTab === 'trailer' && "NOW STREAMING PREVIEW TRAILER. CLICK TO STREAM FULL VIDEO FEED IN HIGH DEFINITION."}
                                                </p>

                                                <div className="d-flex align-items-center gap-3">
                                                    <Button 
                                                        as={Link}
                                                        to={`/stream/${activeMovie.imdb_id}`}
                                                        variant="info" 
                                                        className="d-flex align-items-center gap-2 py-2 px-4"
                                                    >
                                                        <FontAwesomeIcon icon={faPlay} />
                                                        Stream Full Movie
                                                    </Button>
                                                    {updateMovieReview && (
                                                        <Button 
                                                            variant="outline-light"
                                                            onClick={() => updateMovieReview(activeMovie.imdb_id)}
                                                            className="py-2 px-3 border border-secondary"
                                                        >
                                                            Reviews
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right side overlays: tabs configuration */}
                                            <div className="col-md-4 mt-3 mt-md-0 text-md-end">
                                                <div className="d-inline-flex flex-md-column gap-2 text-md-end flex-wrap justify-start">
                                                    <span 
                                                        className="small cursor-pointer uppercase fw-semibold"
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            color: activeTab === 'trailer' ? '#ffffff' : '#52525c',
                                                            fontSize: '0.75rem',
                                                            letterSpacing: '1px',
                                                            borderBottom: activeTab === 'trailer' ? '1.5px solid #e50914' : '1.5px solid transparent'
                                                        }}
                                                        onClick={() => setActiveTab('trailer')}
                                                    >
                                                        Trailer Mode
                                                    </span>
                                                    <span 
                                                        className="small cursor-pointer uppercase fw-semibold"
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            color: activeTab === 'storyline' ? '#ffffff' : '#52525c',
                                                            fontSize: '0.75rem',
                                                            letterSpacing: '1px',
                                                            borderBottom: activeTab === 'storyline' ? '1.5px solid #e50914' : '1.5px solid transparent'
                                                        }}
                                                        onClick={() => setActiveTab('storyline')}
                                                    >
                                                        Storyline
                                                    </span>
                                                    <span 
                                                        className="small cursor-pointer uppercase fw-semibold"
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            color: activeTab === 'cast' ? '#ffffff' : '#52525c',
                                                            fontSize: '0.75rem',
                                                            letterSpacing: '1px',
                                                            borderBottom: activeTab === 'cast' ? '1.5px solid #e50914' : '1.5px solid transparent'
                                                        }}
                                                        onClick={() => setActiveTab('cast')}
                                                    >
                                                        Details & Cast
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mute/Unmute Overlay Button */}
                                    <div 
                                        className="position-absolute" 
                                        style={{ top: '20px', right: '20px', cursor: 'pointer', zIndex: 10 }}
                                        onClick={() => setIsMuted(!isMuted)}
                                    >
                                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} style={{ color: '#fff', fontSize: '0.9rem' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Video Timeline Progress Bar Overlay */}
                                <div className="cinema-banner-track mt-3" style={{ height: '3px', borderRadius: '2px' }}>
                                    <div className="cinema-banner-progress" style={{ width: `${videoProgress}%` }}></div>
                                </div>

                                {/* Slide left/right navigators */}
                                <div 
                                    className="position-absolute d-flex align-items-center justify-content-center rounded-circle cursor-pointer"
                                    style={{
                                        top: '50%',
                                        left: '-50px',
                                        transform: 'translateY(-50%)',
                                        width: '40px',
                                        height: '40px',
                                        background: '#0e0e12',
                                        border: '1.5px solid #1c1c24',
                                        cursor: 'pointer',
                                        zIndex: 12
                                    }}
                                    onClick={prevSlide}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} style={{ color: '#fff' }} />
                                </div>
                                
                                <div 
                                    className="position-absolute d-flex align-items-center justify-content-center rounded-circle cursor-pointer"
                                    style={{
                                        top: '50%',
                                        right: '-50px',
                                        transform: 'translateY(-50%)',
                                        width: '40px',
                                        height: '40px',
                                        background: '#0e0e12',
                                        border: '1.5px solid #1c1c24',
                                        cursor: 'pointer',
                                        zIndex: 12
                                    }}
                                    onClick={nextSlide}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff' }} />
                                </div>

                            </div>
                        </div>

                        {/* Bottom Track Controls & Indicators */}
                        <div className="d-flex align-items-center justify-content-between pt-3" style={{ borderTop: '1px solid #121217' }}>
                            <div className="d-flex align-items-center gap-4">
                                <div 
                                    className="cursor-pointer d-flex align-items-center justify-content-center rounded-circle" 
                                    style={{ width: '40px', height: '40px', background: '#0e0e12', border: '1px solid #1c1c24', cursor: 'pointer' }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ color: '#fff', fontSize: '0.85rem' }} />
                                </div>
                                <div className="text-start">
                                    <span className="small text-muted d-block uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Currently Screening</span>
                                    <span className="text-white fw-bold small">{activeMovie.title}</span>
                                </div>
                            </div>

                            {/* Center slide indicators */}
                            <div className="d-flex gap-2">
                                {displayMovies.map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className="rounded-circle"
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            background: idx === activeIdx ? '#e50914' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-cinematic)'
                                        }}
                                        onClick={() => {
                                            setActiveIdx(idx);
                                            setVideoProgress(0);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Standard Grid Library Catalog */}
            <div className="container mt-5">
                <div className="d-flex align-items-center justify-content-between mb-4 px-3">
                    <div>
                        <h3 className="text-white fw-bold mb-0" style={{ fontFamily: 'Outfit' }}>
                            <FontAwesomeIcon icon={faFilm} className="me-2 text-glow" style={{ color: 'var(--accent-cyan)' }} />
                            Explore Library
                        </h3>
                        <p className="text-muted mb-0 small">Select a movie to stream, read reviews, or add custom feeds</p>
                    </div>
                    <span className="text-muted small fw-semibold bg-dark px-3 py-1.5 rounded border" style={{ borderColor: '#121217' }}>
                        {movies.length} Movies Available
                    </span>
                </div>
                <Movies movies={movies} updateMovieReview={updateMovieReview} message={message} />
            </div>

            {/* Onboarding Genre Selection Modal Overlay */}
            {showOnboarding && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ 
                        zIndex: 2000, 
                        background: 'rgba(3, 3, 4, 0.95)', 
                        backdropFilter: 'blur(10px)',
                        transition: 'opacity 0.4s ease-in-out'
                    }}
                >
                    <div 
                        className="p-4 p-md-5 rounded border text-center animate-fade-in d-flex flex-column align-items-center"
                        style={{ 
                            maxWidth: '520px', 
                            width: '90%', 
                            background: '#09090b', 
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)'
                        }}
                    >
                        <div className="mb-3">
                            <SlixLogo size={54} />
                        </div>
                        <h3 className="text-white fw-bold mb-2" style={{ fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                            Welcome to Slix!
                        </h3>
                        <p className="text-muted small mb-4" style={{ fontSize: '0.85rem' }}>
                            Select at least one genre to customize your personal recommendations and rank reviews.
                        </p>

                        {/* Genre Grid Selector */}
                        <div className="row g-2 mb-4 w-100" style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                            {availableGenres.map(genre => {
                                const isSelected = selectedGenres.some(g => g.genre_id === genre.genre_id);
                                return (
                                    <div className="col-4" key={genre.genre_id}>
                                        <div 
                                            className="py-2.5 px-1 rounded border text-center cursor-pointer select-none"
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: isSelected ? 'rgba(229, 9, 20, 0.12)' : 'var(--bg-tertiary)',
                                                borderColor: isSelected ? '#e50914' : 'var(--border-color)',
                                                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedGenres(prev => prev.filter(g => g.genre_id !== genre.genre_id));
                                                } else {
                                                    setSelectedGenres(prev => [...prev, genre]);
                                                }
                                            }}
                                        >
                                            {genre.genre_name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Button 
                            variant="primary" 
                            className="w-100 py-2.5"
                            disabled={selectedGenres.length === 0 || savingGenres}
                            onClick={handleSaveGenres}
                            style={{ fontWeight: '600' }}
                        >
                            {savingGenres ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving Preferences...
                                </>
                            ) : 'Save & Enter Slix'}
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
