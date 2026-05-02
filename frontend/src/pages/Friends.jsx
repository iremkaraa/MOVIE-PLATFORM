// Friends page — manage friend requests and friends list
import { useEffect, useState } from 'react';
import {
  getFriends, getPendingRequests, getSentRequests,
  sendFriendRequest, respondToFriendRequest, removeFriendApi,
  getAllUsers
} from '../services/api';
import { Link } from 'react-router-dom';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tab, setTab] = useState('friends');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Load all friend-related data on mount
  const loadAll = async () => {
    try {
      const [friendsRes, pendingRes, sentRes, usersRes] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getSentRequests(),
        getAllUsers(),
      ]);
      setFriends(friendsRes.data);
      setPending(pendingRes.data);
      setSent(sentRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Friends load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Show a temporary success/error message
  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Send a friend request to a user
  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      flash('Friend request sent');
      loadAll();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to send request');
    }
  };

  // Accept or reject a pending friend request
  const handleRespond = async (id, action) => {
    try {
      await respondToFriendRequest(id, action);
      flash(action === 'accept' ? 'Friend request accepted' : 'Request rejected');
      loadAll();
    } catch (err) {
      flash('Failed to respond');
    }
  };

  // Remove an existing friend
  const handleRemove = async (userId) => {
    try {
      await removeFriendApi(userId);
      flash('Friend removed');
      loadAll();
    } catch (err) {
      flash('Failed to remove');
    }
  };

  // Filter discoverable users — exclude existing friends, pending, and sent requests
  const friendIds = new Set(friends.map(f => f._id));
  const pendingIds = new Set(pending.map(p => p.requester._id));
  const sentIds = new Set(sent.map(s => s.recipient._id));

  const discoverable = allUsers.filter(u =>
    !friendIds.has(u._id) &&
    !pendingIds.has(u._id) &&
    !sentIds.has(u._id) &&
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
    <div className="px-6 py-10 max-w-4xl mx-auto"
      style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Social</p>
        <h1 className="text-3xl font-bold text-white">Friends</h1>
        <p className="text-gray-500 text-sm mt-1">Connect with other movie lovers</p>
      </div>

      {/* Toast */}
      {message && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: 'rgba(16,185,129,0.95)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          ✓ {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: 'friends', label: 'My Friends', count: friends.length },
          { value: 'pending', label: 'Requests', count: pending.length, dot: pending.length > 0 },
          { value: 'sent', label: 'Sent', count: sent.length },
          { value: 'discover', label: 'Find People', count: discoverable.length },
        ].map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="px-4 py-2 rounded-xl text-sm transition-all font-medium relative"
            style={{
              backgroundColor: tab === t.value ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
              color: tab === t.value ? '#E879F9' : '#9CA3AF',
              border: `1px solid ${tab === t.value ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {t.label} <span className="opacity-60 ml-1">{t.count}</span>
            {t.dot && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: '#EF4444' }} />
            )}
          </button>
        ))}
      </div>

      {/* My Friends */}
      {tab === 'friends' && (
        friends.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p className="text-5xl mb-4">👋</p>
            <p className="text-white font-medium">No friends yet</p>
            <p className="text-gray-500 text-sm mt-1">Find people to start watching together</p>
            <button onClick={() => setTab('discover')}
              className="mt-4 px-5 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
              Find people
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friends.map(f => (
              <div key={f._id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                  {f.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{f.username}</p>
                  <p className="text-gray-500 text-xs">
                    {f.streak?.count > 0 ? `🔥 ${f.streak.count} day streak` : 'Just joined'}
                  </p>
                </div>
                <button onClick={() => handleRemove(f._id)}
                  className="px-3 py-1 rounded-lg text-xs text-gray-500 hover:text-red-400 transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Pending requests */}
      {tab === 'pending' && (
        pending.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p className="text-5xl mb-4">📭</p>
            <p className="text-white font-medium">No pending requests</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map(p => (
              <div key={p._id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: '#0F1623', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                  {p.requester.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{p.requester.username}</p>
                  <p className="text-gray-500 text-xs">wants to be friends</p>
                </div>
                <button onClick={() => handleRespond(p._id, 'accept')}
                  className="px-4 py-2 rounded-lg text-xs text-white font-medium"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                  Accept
                </button>
                <button onClick={() => handleRespond(p._id, 'reject')}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  Reject
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Sent requests */}
      {tab === 'sent' && (
        sent.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p className="text-5xl mb-4">📤</p>
            <p className="text-white font-medium">No sent requests</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sent.map(s => (
              <div key={s._id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                  {s.recipient.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{s.recipient.username}</p>
                  <p className="text-gray-500 text-xs">Pending response...</p>
                </div>
                <span className="text-xs text-gray-500 px-3 py-1 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  Pending
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {/* Discover people */}
      {tab === 'discover' && (
        <div>
          {/* Search input */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {discoverable.length === 0 ? (
            <div className="text-center py-20 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-white font-medium">No users to add</p>
              <p className="text-gray-500 text-sm mt-1">
                {search ? 'Try a different search' : 'Everyone is already a friend or pending'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {discoverable.map(u => (
                <div key={u._id} className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{u.username}</p>
                    <p className="text-gray-500 text-xs">
                      {u.streak?.count > 0 ? `🔥 ${u.streak.count} streak` : 'New user'}
                    </p>
                  </div>
                  <button onClick={() => handleSendRequest(u._id)}
                    className="px-4 py-2 rounded-lg text-xs text-white font-medium"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Friends;