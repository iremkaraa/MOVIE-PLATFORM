// Admin page — moderation dashboard with stats, user management, and review moderation
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  adminGetUsers,
  adminGetReviews,
  adminGetStats,
  adminUpdateUserRole,
  adminDeleteUser,
  adminDeleteReview,
} from '../services/api';

function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Load all admin data on mount
  useEffect(() => {
    Promise.all([adminGetUsers(), adminGetReviews(), adminGetStats()])
      .then(([usersRes, reviewsRes, statsRes]) => {
        setUsers(usersRes.data);
        setReviews(reviewsRes.data);
        setStats(statsRes.data);
      })
      .catch(err => console.error('Admin fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Show a temporary feedback message
  const flash = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  // Toggle a user's role between user and admin
  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminUpdateUserRole(user._id, newRole);
      setUsers(prev => prev.map(u => u._id === user._id ? res.data : u));
      flash(`${user.username} is now ${newRole}`);
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to update role');
    }
  };

  // Permanently delete a user and all their content
  const handleDeleteUser = async (id) => {
    try {
      await adminDeleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setConfirmDelete(null);
      flash('User deleted successfully');
      // Refresh stats
      const statsRes = await adminGetStats();
      setStats(statsRes.data);
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Delete a review (moderation)
  const handleDeleteReview = async (id) => {
    try {
      await adminDeleteReview(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      flash('Review deleted');
    } catch (err) {
      flash('Failed to delete review');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, emoji: '👥', color: '#7C3AED' },
    { label: 'Admins', value: stats.totalAdmins, emoji: '🛡️', color: '#E879F9' },
    { label: 'Watchlist Items', value: stats.totalWatchlistItems, emoji: '📋', color: '#10B981' },
    { label: 'Total Reviews', value: stats.totalReviews, emoji: '💬', color: '#F59E0B' },
    { label: 'Watched Titles', value: stats.totalWatched, emoji: '🎬', color: '#3B82F6' },
  ] : [];

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto"
      style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* Header */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Moderation Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users, moderate reviews, view platform stats</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #E879F9)',
            color: 'white'
          }}>
          🛡️ Admin Mode
        </span>
      </div>

      {/* Toast notification */}
      {actionMessage && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-medium animate-pulse"
          style={{ backgroundColor: 'rgba(16,185,129,0.95)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          ✓ {actionMessage}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {statCards.map(s => (
          <div key={s.label} className="p-5 rounded-2xl"
            style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '18px' }}>{s.emoji}</span>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium truncate">{s.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'users', label: 'Users', count: users.length },
          { value: 'reviews', label: 'Reviews', count: reviews.length },
        ].map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="px-5 py-2 rounded-xl text-sm transition-all font-medium"
            style={{
              backgroundColor: tab === t.value ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
              color: tab === t.value ? '#E879F9' : '#9CA3AF',
              border: `1px solid ${tab === t.value ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {t.label} <span className="opacity-60 ml-1">{t.count}</span>
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">User</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Streak</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Joined</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser._id;
                  return (
                    <tr key={u._id}
                      className="transition-colors hover:bg-white/5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">
                            {u.username}
                            {isSelf && <span className="text-xs text-gray-500 ml-2">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: u.role === 'admin' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                            color: u.role === 'admin' ? '#E879F9' : '#9CA3AF',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.08)'}`
                          }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {u.streak?.count > 0 ? `🔥 ${u.streak.count}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!isSelf && (
                            <>
                              <button onClick={() => handleToggleRole(u)}
                                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                  backgroundColor: 'rgba(124,58,237,0.15)',
                                  color: '#E879F9',
                                  border: '1px solid rgba(232,121,249,0.2)'
                                }}>
                                {u.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>
                              <button onClick={() => setConfirmDelete(u)}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {tab === 'reviews' && (
        <div className="flex flex-col gap-3">
          {reviews.length === 0 ? (
            <div className="text-center py-20 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-5xl mb-4">💬</p>
              <p className="text-white font-medium">No reviews yet</p>
              <p className="text-gray-500 text-sm mt-1">User reviews will appear here for moderation</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="p-4 rounded-2xl"
                style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                      {review.user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {review.user?.username || 'Deleted user'}
                        {review.hasSpoilers && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                            ⚠️ Spoilers
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {review.title} · {[1,2,3,4,5].map(s =>
                          <span key={s} style={{ color: s <= review.rating ? '#E879F9' : '#374151' }}>★</span>
                        )} · {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteReview(review._id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    Delete
                  </button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#0F1623', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-3xl mb-3">⚠️</p>
            <h2 className="text-xl font-bold text-white mb-2">Delete user?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete <span className="text-white font-medium">{confirmDelete.username}</span> and all their watchlist items and reviews. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-300 font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={() => handleDeleteUser(confirmDelete._id)}
                className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium"
                style={{ backgroundColor: '#EF4444' }}>
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;