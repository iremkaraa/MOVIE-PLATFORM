// MovieCard — clean responsive card with consistent poster aspect ratio
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addToWatchlist } from '../services/api';
import { useState } from 'react';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function MovieCard({ movie }) {
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : '';

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    try {
      await addToWatchlist({
        tmdbId: movie.id,
        mediaType,
        title,
        posterPath: movie.poster_path || '',
        overview: movie.overview || '',
        releaseDate,
        voteAverage: movie.vote_average || 0,
      });
      setAdded(true);
    } catch (err) {
      if (err.response?.data?.message === 'Already in your watchlist') setAdded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/${mediaType}/${movie.id}`} className="block">
      <div className="rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 group"
        style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Poster — consistent 2:3 aspect ratio */}
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '150%' }}>
          {movie.poster_path ? (
            <img src={`${IMAGE_URL}${movie.poster_path}`} alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: '#1E2A45' }}>
              <span style={{ fontSize: '32px' }}>🎬</span>
              <span className="text-gray-600 text-xs text-center px-2 truncate">{title}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#E879F9' }}>
              ★ {movie.vote_average?.toFixed(1)}
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#9CA3AF' }}>
            {mediaType === 'tv' ? 'TV' : 'Film'}
          </div>

          {/* Watchlist button */}
          {user && (
            <button onClick={handleAdd}
              className="absolute bottom-2 left-2 right-2 py-2 rounded-lg text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all"
              style={{ backgroundColor: added ? 'rgba(5,150,105,0.95)' : 'rgba(124,58,237,0.95)', backdropFilter: 'blur(4px)' }}>
              {loading ? '...' : added ? '✓ Added' : '+ Watchlist'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-white text-sm font-medium truncate leading-tight">{title}</p>
          <p className="text-gray-500 text-xs mt-1">{year || 'Unknown'}</p>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;