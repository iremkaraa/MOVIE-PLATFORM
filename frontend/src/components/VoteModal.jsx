// VoteModal — "What should we watch tonight?" voting feature
// Shows watchlist items and lets user vote for one
import { useState } from 'react';
import { voteForMovie } from '../services/api';

const IMAGE_URL = import.meta.env.VITE_TMDB_IMAGE_URL;

function VoteModal({ items, onClose, currentUserId }) {
  const [voted, setVoted] = useState(null);
  const [localItems, setLocalItems] = useState(items);

  const handleVote = async (tmdbId) => {
    if (voted) return; // Already voted
    try {
      const res = await voteForMovie(tmdbId);
      setVoted(tmdbId);
      // Update vote count locally without refetching
      setLocalItems(prev =>
        prev.map(item =>
          item.tmdbId === tmdbId ? { ...item, votes: res.data.votes } : item
        )
      );
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  // Sort items by vote count descending
  const sorted = [...localItems].sort((a, b) => b.votes.length - a.votes.length);

  return (
    // Modal backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>

      <div className="w-full max-w-lg rounded-2xl p-6"
        style={{ backgroundColor: '#111827', border: '1px solid #2D3E6B', maxHeight: '80vh', overflowY: 'auto' }}>

        {/* Modal header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">What should we watch? 🗳️</h2>
            <p className="text-gray-400 text-sm mt-1">Vote for your pick!</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Votable movie list */}
        <div className="flex flex-col gap-3">
          {sorted.map((item) => {
            const isLeading = sorted[0].tmdbId === item.tmdbId && item.votes.length > 0;
            const hasVoted = item.votes.includes(currentUserId);

            return (
              <div key={item.tmdbId}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isLeading ? '#1E2A45' : '#0B0F1A',
                  border: isLeading ? '1px solid #7C3AED' : '1px solid #1E2A45'
                }}>

                {/* Poster */}
                {item.posterPath ? (
                  <img src={`${IMAGE_URL}${item.posterPath}`} alt={item.title}
                    className="w-10 h-14 object-cover rounded-lg" />
                ) : (
                  <div className="w-10 h-14 rounded-lg flex items-center justify-center text-xs text-gray-500"
                    style={{ backgroundColor: '#1E2A45' }}>🎬</div>
                )}

                {/* Title and vote count */}
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.votes.length} vote{item.votes.length !== 1 ? 's' : ''}</p>
                  {isLeading && <span className="text-xs" style={{ color: '#E879F9' }}>👑 Leading</span>}
                </div>

                {/* Vote button */}
                <button
                  onClick={() => handleVote(item.tmdbId)}
                  disabled={!!voted}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: hasVoted ? '#059669' : voted ? '#1E2A45' : '#7C3AED',
                    color: 'white',
                    opacity: voted && !hasVoted ? 0.5 : 1,
                    cursor: voted ? 'not-allowed' : 'pointer'
                  }}>
                  {hasVoted ? '✓ Voted' : 'Vote'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VoteModal;