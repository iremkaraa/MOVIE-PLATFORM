// MovieDetail page — full info, cast, reviews with spoiler support
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getMovieDetails, getTVDetails } from '../services/tmdb';
import { getReviews, createReview, addToWatchlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import MovieCard from '../components/MovieCard';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const isTV = location.pathname.startsWith('/tv/');
  const { user } = useAuth();

  const [media, setMedia] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [addedToList, setAddedToList] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setMedia(null);

    const detailFetch = isTV ? getTVDetails(id) : getMovieDetails(id);

    detailFetch
      .then(res => {
        setMedia(res.data);
        return getReviews(id).catch(() => ({ data: [] }));
      })
      .then(reviewRes => setReviews(reviewRes.data))
      .catch(err => {
        console.error('Detail fetch error:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id, isTV]);

  const handleAddToWatchlist = async () => {
    if (!user) return;
    try {
      await addToWatchlist({
        tmdbId: media.id,
        mediaType: isTV ? 'tv' : 'movie',
        title: media.title || media.name,
        posterPath: media.poster_path || '',
        overview: media.overview || '',
        releaseDate: media.release_date || media.first_air_date || '',
        voteAverage: media.vote_average || 0,
      });
      setAddedToList(true);
    } catch (err) {
      if (err.response?.data?.message === 'Already in your watchlist') setAddedToList(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      const res = await createReview(id, {
        ...reviewForm,
        mediaType: isTV ? 'tv' : 'movie',
        title: media.title || media.name,
      });
      setReviews(prev => [res.data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  if (error || !media) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-gray-400 text-lg">Something went wrong loading this title.</p>
      <button onClick={() => window.history.back()}
        className="px-5 py-2 rounded-xl text-white text-sm"
        style={{ backgroundColor: '#7C3AED' }}>
        Go Back
      </button>
    </div>
  );

  const title = media.title || media.name;
  const releaseYear = (media.release_date || media.first_air_date || '').substring(0, 4);
  const trailer = media.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const runtime = media.runtime ? `${Math.floor(media.runtime / 60)}h ${media.runtime % 60}m` : null;

  return (
    <div style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* Backdrop */}
      <div className="relative w-full" style={{ height: '500px' }}>
        {media.backdrop_path ? (
          <img src={`${IMAGE_BASE}${media.backdrop_path}`} alt={title}
            className="w-full h-full object-cover" style={{ opacity: 0.4 }} />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: '#1E2A45' }} />
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0B0F1A 30%, transparent 100%)' }} />
      </div>

      <div className="px-6 md:px-12 -mt-64 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl">

          {media.poster_path && (
            <div className="flex-shrink-0">
              <img src={`${IMAGE_URL}${media.poster_path}`} alt={title}
                className="rounded-2xl shadow-2xl"
                style={{ width: '200px', border: '2px solid #1E2A45' }} />
            </div>
          )}

          <div className="flex-1 pt-4 md:pt-32">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#1E2A45', color: '#4F6BCC' }}>
                {isTV ? 'TV Series' : 'Movie'}
              </span>
              {releaseYear && <span className="text-gray-400 text-sm">{releaseYear}</span>}
              {runtime && <span className="text-gray-400 text-sm">{runtime}</span>}
            </div>

            <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>

            {media.vote_average > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= Math.round(media.vote_average / 2) ? '#E879F9' : '#374151', fontSize: '18px' }}>★</span>
                  ))}
                </div>
                <span className="text-white font-semibold">{media.vote_average?.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">/ 10</span>
              </div>
            )}

            {media.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {media.genres.map(g => (
                  <span key={g.id} className="px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#1E2A45', color: '#9CA3AF', border: '1px solid #2D3E6B' }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">{media.overview}</p>

            <div className="flex gap-3 flex-wrap">
              {user && (
                <button onClick={handleAddToWatchlist}
                  className="px-6 py-3 rounded-xl text-white font-medium text-sm transition-all"
                  style={{ backgroundColor: addedToList ? '#059669' : '#7C3AED' }}>
                  {addedToList ? '✓ In Watchlist' : '+ Add to Watchlist'}
                </button>
              )}
              {trailer && (
                <a href={`https://youtube.com/watch?v=${trailer.key}`}
                  target="_blank" rel="noreferrer"
                  className="px-6 py-3 rounded-xl text-white font-medium text-sm"
                  style={{ backgroundColor: '#1E2A45', border: '1px solid #2D3E6B' }}>
                  ▶ Watch Trailer
                </a>
              )}
              {!user && (
                <p className="text-gray-500 text-sm self-center">
                  <a href="/login" style={{ color: '#E879F9' }}>Sign in</a> to add to watchlist
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {media.credits?.cast?.length > 0 && (
          <div className="mt-12 max-w-5xl">
            <h2 className="text-xl font-bold text-white mb-5">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {media.credits.cast.slice(0, 12).map(actor => (
                <div key={actor.id} className="flex-shrink-0 text-center" style={{ width: '80px' }}>
                  {actor.profile_path ? (
                    <img src={`${IMAGE_URL}${actor.profile_path}`} alt={actor.name}
                      className="rounded-full object-cover mx-auto mb-2"
                      style={{ width: '64px', height: '64px' }} />
                  ) : (
                    <div className="rounded-full mx-auto mb-2 flex items-center justify-center text-xl"
                      style={{ width: '64px', height: '64px', backgroundColor: '#1E2A45' }}>👤</div>
                  )}
                  <p className="text-gray-300 text-xs leading-tight truncate">{actor.name}</p>
                  <p className="text-gray-500 text-xs truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {media.similar?.results?.length > 0 && (
          <div className="mt-12 max-w-5xl">
            <h2 className="text-xl font-bold text-white mb-5">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.similar.results.slice(0, 5).map(m => (
                <MovieCard key={m.id} movie={{ ...m, media_type: isTV ? 'tv' : 'movie' }} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-5">Reviews</h2>

          {user && (
            <form onSubmit={handleReviewSubmit}
              className="p-5 rounded-2xl mb-6"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white font-medium mb-4">Write a Review</p>

              {/* Star rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button"
                    onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                    className="transition-transform hover:scale-110"
                    style={{ fontSize: '28px', color: star <= reviewForm.rating ? '#E879F9' : '#374151', background: 'none', border: 'none', cursor: 'pointer' }}>
                    ★
                  </button>
                ))}
                <span className="text-gray-400 text-sm ml-2">{reviewForm.rating}/5</span>
              </div>

              {/* Spoiler hint */}
              <div className="mb-3 p-3 rounded-xl text-xs"
                style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                💡 Hide spoilers by wrapping text with <code style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>||spoiler text||</code>
              </div>

              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Share your thoughts... Wrap spoilers like ||this part is hidden||"
                required rows={4}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none resize-none text-sm"
                style={{ backgroundColor: '#0B0F1A', border: '1px solid #2D3E6B' }}
              />

              {reviewError && <p className="text-red-400 text-sm mt-2">{reviewError}</p>}

              <button type="submit"
                className="mt-4 px-6 py-2.5 rounded-xl text-white font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                Post Review
              </button>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <ReviewCard key={review._id} review={review}
                  onDelete={id => setReviews(prev => prev.filter(r => r._id !== id))} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;