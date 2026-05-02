// Compatibility page — find users with similar movie taste
import { useEffect, useState } from 'react';
import { getAllUsers, getCompatibility } from '../services/api';
import { Link } from 'react-router-dom';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function Compatibility() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [compatData, setCompatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all users on mount
  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error('Users fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Calculate compatibility when user selected
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setCompatData(null);
    setCalculating(true);
    try {
      const res = await getCompatibility(user._id);
      setCompatData(res.data);
    } catch (err) {
      console.error('Compat error:', err);
    } finally {
      setCalculating(false);
    }
  };

  // Score badge color and tier label
  const getScoreInfo = (score) => {
    if (score >= 80) return { color: '#10B981', label: 'Soulmate Tier 💖', bg: 'rgba(16,185,129,0.15)' };
    if (score >= 60) return { color: '#7C3AED', label: 'Great Match ✨', bg: 'rgba(124,58,237,0.15)' };
    if (score >= 40) return { color: '#F59E0B', label: 'Decent Match 👍', bg: 'rgba(245,158,11,0.15)' };
    if (score >= 20) return { color: '#EF4444', label: 'Different Tastes 🤔', bg: 'rgba(239,68,68,0.15)' };
    return { color: '#6B7280', label: 'Not Enough Data 📊', bg: 'rgba(107,114,128,0.15)' };
  };

  // Filter users by search input
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto"
      style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Social</p>
        <h1 className="text-3xl font-bold text-white">Film Compatibility</h1>
        <p className="text-gray-500 text-sm mt-1">
          Compare your taste with other users — based on watch history and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* User list with search */}
        <div className="rounded-2xl p-4 md:sticky md:top-24 md:self-start"
          style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

          <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3 px-2">
            All users ({users.length})
          </h3>

          {/* Search input */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-white text-sm outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* User list */}
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-sm px-2 py-4 text-center">
              {users.length === 0 ? 'No other users yet.' : 'No matches.'}
            </p>
          ) : (
            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
              {filteredUsers.map(u => (
                <button key={u._id} onClick={() => handleSelectUser(u)}
                  className="flex items-center gap-3 p-2 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: selectedUser?._id === u._id ? 'rgba(124,58,237,0.15)' : 'transparent',
                    border: `1px solid ${selectedUser?._id === u._id ? 'rgba(232,121,249,0.3)' : 'transparent'}`,
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{u.username}</p>
                    {u.streak?.count > 0 && (
                      <p className="text-gray-500 text-xs">🔥 {u.streak.count} day streak</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Compatibility result */}
        <div className="md:col-span-2">
          {/* Empty state */}
          {!selectedUser && (
            <div className="text-center py-20 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-5xl mb-4">👥</p>
              <p className="text-white font-medium">Select a user to compare</p>
              <p className="text-gray-500 text-sm mt-1">See how compatible your movie taste is</p>
            </div>
          )}

          {/* Loading state */}
          {calculating && (
            <div className="text-center py-20 rounded-2xl"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
                style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
              <p className="text-gray-400 text-sm">Calculating compatibility...</p>
            </div>
          )}

          {/* Result card */}
          {compatData && !calculating && (
            <div className="rounded-2xl p-8"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Avatar comparison */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                    {selectedUser.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-3xl">↔</span>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    🤝
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">
                  Your taste compatibility with <span className="text-white font-medium">{selectedUser.username}</span>
                </p>

                {/* Big score */}
                <div className="my-6">
                  <p className="text-7xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #E879F9)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                    {compatData.score}<span className="text-4xl">%</span>
                  </p>
                </div>

                {/* Tier label */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: getScoreInfo(compatData.score).bg,
                    color: getScoreInfo(compatData.score).color,
                    border: `1px solid ${getScoreInfo(compatData.score).color}40`,
                  }}>
                  {getScoreInfo(compatData.score).label}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <p className="text-2xl font-bold text-white">{compatData.breakdown.commonWatched}</p>
                  <p className="text-gray-400 text-xs mt-1">Movies you both watched</p>
                </div>
                <div className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'rgba(232,121,249,0.06)', border: '1px solid rgba(232,121,249,0.15)' }}>
                  <p className="text-2xl font-bold text-white">{compatData.breakdown.commonRated}</p>
                  <p className="text-gray-400 text-xs mt-1">Movies you both rated</p>
                </div>
              </div>

              {/* Common movies */}
              {compatData.commonItems?.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                    Both of you watched
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {compatData.commonItems.map(item => (
                      <Link key={item.tmdbId} to={`/${item.mediaType}/${item.tmdbId}`}
                        className="block transition-transform hover:scale-105 relative group">
                        {item.posterPath ? (
                          <img src={`${IMAGE_URL}${item.posterPath}`} alt={item.title}
                            className="w-full rounded-lg object-cover"
                            style={{ aspectRatio: '2/3' }} />
                        ) : (
                          <div className="w-full rounded-lg flex items-center justify-center text-2xl"
                            style={{ aspectRatio: '2/3', backgroundColor: '#1E2A45' }}>🎬</div>
                        )}
                        {/* Title shown on hover */}
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
                          <p className="text-white text-xs font-medium leading-tight">{item.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    Click any movie to view details and add to your own watchlist
                  </p>
                </div>
              )}

              {/* No common movies hint */}
              {compatData.breakdown.commonWatched === 0 && (
                <div className="mt-6 p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <p className="text-gray-400 text-sm">
                    You haven't watched any of the same movies yet
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Start watching to build up compatibility data
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Compatibility;