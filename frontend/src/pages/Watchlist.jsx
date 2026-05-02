// Watchlist page — personal saved titles, voting feature, mark as watched
import { useEffect, useState } from 'react';
import { getWatchlist, markAsWatched, removeFromWatchlist } from '../services/api';
import { Link } from 'react-router-dom';
import VoteModal from '../components/VoteModal';
import { useAuth } from '../context/AuthContext';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function Watchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [filter, setFilter] = useState('all');

  // Fetch user's watchlist on mount
  useEffect(() => {
    getWatchlist()
      .then(res => setItems(res.data))
      .catch(err => console.error('Watchlist fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Mark a title as watched — updates streak and badges on backend
  const handleMarkWatched = async (tmdbId) => {
    try {
      await markAsWatched(tmdbId);
      setItems(prev => prev.map(item =>
        item.tmdbId === tmdbId ? { ...item, watched: true, watchedAt: new Date() } : item
      ));
    } catch (err) {
      console.error('Mark watched error:', err);
    }
  };

  // Remove an item from the watchlist
  const handleRemove = async (tmdbId) => {
    try {
      await removeFromWatchlist(tmdbId);
      setItems(prev => prev.filter(item => item.tmdbId !== tmdbId));
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  // Filter items based on watched state
  const filtered = items.filter(item => {
    if (filter === 'watched') return item.watched;
    if (filter === 'unwatched') return !item.watched;
    return true;
  });

  const unwatchedItems = items.filter(i => !i.watched);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="px-6 py-10" style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Your collection</p>
          <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} {items.length === 1 ? 'title saved' : 'titles saved'}</p>
        </div>

        {/* Voting button — only when 2+ unwatched items exist */}
        {unwatchedItems.length >= 2 && (
          <button onClick={() => setShowVoteModal(true)}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
            🗳️ Decide tonight's pick
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'All', count: items.length },
          { value: 'unwatched', label: 'To Watch', count: unwatchedItems.length },
          { value: 'watched', label: 'Watched', count: items.length - unwatchedItems.length },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{
              backgroundColor: filter === f.value ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
              color: filter === f.value ? '#E879F9' : '#9CA3AF',
              border: `1px solid ${filter === f.value ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {f.label} <span className="opacity-60 ml-1">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-white font-medium mb-1">
            {filter === 'all' ? 'Your watchlist is empty' : `No ${filter} titles`}
          </p>
          <p className="text-gray-500 text-sm mb-6">Start adding movies to track what you want to watch</p>
          <Link to="/search"
            className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
            Discover movies
          </Link>
        </div>
      )}

      {/* Grid — proper aspect ratio for posters */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(item => (
            <div key={item.tmdbId} className="rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Poster — 2:3 aspect ratio (standard movie poster) */}
              <Link to={`/${item.mediaType}/${item.tmdbId}`} className="block relative w-full"
                style={{ paddingTop: '150%' }}>
                {item.posterPath ? (
                  <img src={`${IMAGE_URL}${item.posterPath}`} alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl"
                    style={{ backgroundColor: '#1E2A45' }}>🎬</div>
                )}

                {/* Watched overlay badge */}
                {item.watched && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'rgba(5,150,105,0.9)', backdropFilter: 'blur(4px)', color: 'white' }}>
                    ✓ Watched
                  </div>
                )}

                {/* Rating badge */}
                {item.voteAverage > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#E879F9' }}>
                    ★ {item.voteAverage?.toFixed(1)}
                  </div>
                )}
              </Link>

              {/* Info & buttons */}
              <div className="p-3">
                <p className="text-white font-medium text-sm truncate">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {item.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                </p>

                <div className="flex gap-2 mt-3">
                  {!item.watched && (
                    <button onClick={() => handleMarkWatched(item.tmdbId)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                      style={{ backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                      Mark watched
                    </button>
                  )}
                  <button onClick={() => handleRemove(item.tmdbId)}
                    className="py-1.5 px-3 rounded-lg text-xs text-gray-400 hover:text-red-400 transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vote modal */}
      {showVoteModal && (
        <VoteModal items={unwatchedItems} currentUserId={user?._id}
          onClose={() => setShowVoteModal(false)} />
      )}
    </div>
  );
}

export default Watchlist;