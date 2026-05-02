// CollabListDetail — view a single collaborative list, add/remove movies, vote
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCollabList, removeItemFromCollab, voteCollabItem
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function CollabListDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const loadList = async () => {
    try {
      const res = await getCollabList(id);
      setList(res.data);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [id]);

  // Vote for an item — toggles the user's vote on/off
  const handleVote = async (tmdbId) => {
    setVoting(true);
    try {
      const res = await voteCollabItem(id, tmdbId);
      setList(res.data);
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setVoting(false);
    }
  };

  // Remove an item from the list
  const handleRemove = async (tmdbId) => {
    if (!confirm('Remove from list?')) return;
    try {
      const res = await removeItemFromCollab(id, tmdbId);
      setList(res.data);
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!list) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <p className="text-gray-400">List not found</p>
    </div>
  );

  // Sort items by vote count (descending)
  const sortedItems = [...list.items].sort((a, b) => b.votes.length - a.votes.length);
  const winner = sortedItems[0]?.votes.length > 0 ? sortedItems[0] : null;

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto"
      style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      <Link to="/collab" className="text-gray-500 text-sm mb-4 inline-block hover:text-white transition-colors">
        ← Back to lists
      </Link>

      {/* List header */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
        <p className="text-gray-500 text-sm mb-4">
          {list.items.length} {list.items.length === 1 ? 'movie' : 'movies'} · Owner: {list.owner.username}
        </p>

        {/* Members list */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-gray-400 mr-2">Members:</p>
          {list.members.map(m => (
            <div key={m._id} className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                {m.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-xs">{m.username}</span>
            </div>
          ))}
        </div>

        {/* Winner banner */}
        {winner && (
          <div className="mt-5 p-3 rounded-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.15), rgba(232,121,249,0.15))', border: '1px solid rgba(124,58,237,0.2)' }}>
            <span>👑</span>
            <p className="text-sm" style={{ color: '#E879F9' }}>
              <span className="font-semibold">{winner.title}</span> is winning with {winner.votes.length} vote{winner.votes.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Add hint */}
      <div className="mb-6 p-4 rounded-xl text-sm text-gray-400"
        style={{ backgroundColor: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
        💡 To add movies, browse <Link to="/search" className="font-medium underline" style={{ color: '#E879F9' }}>Discover</Link> and use the "Add to collab list" button on movie pages.
      </div>

      {/* Items grid */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-white font-medium">No movies in this list yet</p>
          <p className="text-gray-500 text-sm mt-1">Members can add movies from the Discover page</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sortedItems.map(item => {
            const hasVoted = item.votes.some(v => v === user._id || v.toString() === user._id);
            const isWinner = winner?.tmdbId === item.tmdbId;

            return (
              <div key={item.tmdbId} className="rounded-xl overflow-hidden transition-all"
                style={{
                  backgroundColor: '#0F1623',
                  border: `1px solid ${isWinner ? 'rgba(232,121,249,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isWinner ? '0 0 20px rgba(232,121,249,0.2)' : 'none'
                }}>

                <Link to={`/${item.mediaType}/${item.tmdbId}`} className="block relative w-full"
                  style={{ paddingTop: '150%' }}>
                  {item.posterPath ? (
                    <img src={`${IMAGE_URL}${item.posterPath}`} alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: '#1E2A45' }}>🎬</div>
                  )}
                  {isWinner && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)', color: 'white' }}>
                      👑 Leading
                    </div>
                  )}
                </Link>

                <div className="p-3">
                  <p className="text-white font-medium text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {item.votes.length} vote{item.votes.length !== 1 ? 's' : ''}
                  </p>

                  <button onClick={() => handleVote(item.tmdbId)} disabled={voting}
                    className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50"
                    style={{
                      background: hasVoted
                        ? 'rgba(16,185,129,0.95)'
                        : 'linear-gradient(135deg, #7C3AED, #E879F9)'
                    }}>
                    {hasVoted ? '✓ Voted' : 'Vote'}
                  </button>

                  <button onClick={() => handleRemove(item.tmdbId)}
                    className="mt-2 w-full py-1 rounded-lg text-xs text-gray-500 hover:text-red-400 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CollabListDetail;