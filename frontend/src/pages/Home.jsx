// Home page — Netflix-style hero, horizontal category rows, genre filter
import { useEffect, useState, useRef } from 'react';
import { getTrending, getGenres, getMoviesByGenre } from '../services/tmdb';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import VibeMatcher from '../components/VibeMatcher';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

// Horizontal scrollable row component
function MovieRow({ title, movies, loading }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-4 px-6">{title}</h2>
      <div className="relative group">
        {/* Left arrow */}
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to right, rgba(11,15,26,0.9), transparent)' }}>
          <span className="text-white text-xl">‹</span>
        </button>

        {/* Scrollable row */}
        <div ref={rowRef} className="flex gap-3 overflow-x-auto px-6 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 rounded-xl animate-pulse"
                style={{ width: '140px', aspectRatio: '2/3', backgroundColor: '#111827' }} />
            ))
            : movies.map(movie => (
              <div key={movie.id} className="flex-shrink-0" style={{ width: '140px' }}>
                <MovieCard movie={movie} />
              </div>
            ))
          }
        </div>

        {/* Right arrow */}
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to left, rgba(11,15,26,0.9), transparent)' }}>
          <span className="text-white text-xl">›</span>
        </button>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [hero, setHero] = useState(null);
  const [trending, setTrending] = useState([]);
  const [action, setAction] = useState([]);
  const [horror, setHorror] = useState([]);
  const [romance, setRomance] = useState([]);
  const [scifi, setScifi] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrending(),
      getMoviesByGenre(28),    // Action
      getMoviesByGenre(27),    // Horror
      getMoviesByGenre(10749), // Romance
      getMoviesByGenre(878),   // Sci-Fi
      axios.get(`${BASE_URL}/movie/top_rated`, {
        params: { api_key: TMDB_KEY, language: 'en-US' }
      }),
    ]).then(([trendRes, actionRes, horrorRes, romanceRes, scifiRes, topRes]) => {
      const trendingResults = trendRes.data.results;
      setTrending(trendingResults);
      // Pick the hero from trending movies with a backdrop
      const heroMovie = trendingResults.find(m => m.backdrop_path && m.overview);
      setHero(heroMovie || trendingResults[0]);
      setAction(actionRes.data.results);
      setHorror(horrorRes.data.results);
      setRomance(romanceRes.data.results);
      setScifi(scifiRes.data.results);
      setTopRated(topRes.data.results);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div className="pt-24"></div>
      {hero && (
        <div className="relative w-full" style={{ height: '85vh', minHeight: '520px' }}>
          {/* Backdrop */}
          <img src={`${IMAGE_BASE}${hero.backdrop_path}`} alt={hero.title || hero.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.55 }} />

          {/* Gradients */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #0B0F1A 10%, rgba(11,15,26,0.4) 60%, transparent 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(11,15,26,0.9) 0%, transparent 60%)' }} />

          {/* Content */}
          <div className="absolute bottom-0 left-0 px-10 pb-24 max-w-2xl pt-24">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#E879F9' }}>
              {hero.media_type === 'tv' ? 'TV Series' : 'Movie'} · Trending Now
            </p>
            <h1 className="text-6xl font-bold text-white leading-tight mb-4"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {hero.title || hero.name}
            </h1>
            <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-lg line-clamp-3">
              {hero.overview}
            </p>
            <div className="flex gap-3">
              <Link to={`/${hero.media_type || 'movie'}/${hero.id}`}
                className="px-7 py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                ▶ More Info
              </Link>
              {!user && (
                <Link to="/register"
                  className="px-7 py-3 rounded-xl text-gray-200 font-medium text-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                  Get Started Free
                </Link>
              )}
            </div>
          </div>

          {/* Rating badge */}
          {hero.vote_average > 0 && (
            <div className="absolute bottom-24 right-10 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                <span style={{ color: '#E879F9' }}>★</span>
                <span className="text-white font-semibold text-sm">{hero.vote_average?.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">/ 10</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Category rows ── */}
      <div className="pb-10 pt-12">
        <MovieRow title="🌊 Trending This Week" movies={trending} loading={loading} />
        <MovieRow title="💥 Action & Thriller" movies={action} loading={loading} />
        <MovieRow title="⭐ Top Rated of All Time" movies={topRated} loading={loading} />
        <MovieRow title="👻 Horror" movies={horror} loading={loading} />
        <MovieRow title="💕 Romance" movies={romance} loading={loading} />
        <MovieRow title="🚀 Sci-Fi & Fantasy" movies={scifi} loading={loading} />
      </div>

      {/* ── Footer ── */}
      <footer className="px-10 py-12 mt-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-5xl mx-auto">
          <div>
            <span className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span style={{ color: '#E879F9' }}>Mood</span>
              <span className="text-white">flix</span>
            </span>
            <p className="text-gray-600 text-sm mt-2">
              Movie data provided by{' '}
              <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer"
                className="hover:text-gray-400 transition-colors underline">
                TMDB
              </a>
            </p>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/search" className="text-gray-500 hover:text-gray-300 text-base transition-colors">Discover</Link>
            {user && <Link to="/watchlist" className="text-gray-500 hover:text-gray-300 text-base transition-colors">Watchlist</Link>}
          </div>
          <p className="text-gray-600 text-sm">
            Built with React + Node.js + MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;