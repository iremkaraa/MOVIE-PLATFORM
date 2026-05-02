// CollabLists page — view, create, and manage shared watchlists
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCollabLists, createCollabList, getFriends, deleteCollabList } from '../services/api';
import { useAuth } from '../context/AuthContext';

function CollabLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const loadAll = async () => {
    try {
      const [listsRes, friendsRes] = await Promise.all([
        getMyCollabLists(),
        getFriends(),
      ]);
      setLists(listsRes.data);
      setFriends(friendsRes.data);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Toggle friend selection when creating a new list
  const toggleFriend = (id) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Create a new collaborative list with selected friends
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCollabList({ name: newName, memberIds: selectedFriends });
      setShowCreate(false);
      setNewName('');
      setSelectedFriends([]);
      loadAll();
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  // Delete a list (only if user is owner)
  const handleDelete = async (id) => {
    if (!confirm('Delete this list?')) return;
    try {
      await deleteCollabList(id);
      loadAll();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto"
      style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Shared</p>
          <h1 className="text-3xl font-bold text-white">Collab Lists</h1>
          <p className="text-gray-500 text-sm mt-1">Watchlists you share with friends</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
          + New list
        </button>
      </div>

      {/* List of collab lists */}
      {lists.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-5xl mb-4">📚</p>
          <p className="text-white font-medium">No shared lists yet</p>
          <p className="text-gray-500 text-sm mt-1">Create one and invite friends to plan watch nights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(list => (
            <div key={list._id} className="rounded-2xl p-5 group transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

              <Link to={`/collab/${list._id}`} className="block">
                <h3 className="text-lg font-bold text-white mb-2 truncate">{list.name}</h3>
                <p className="text-gray-500 text-xs mb-4">
                  {list.items.length} {list.items.length === 1 ? 'movie' : 'movies'} · {list.members.length} {list.members.length === 1 ? 'member' : 'members'}
                </p>

                {/* Member avatars */}
                <div className="flex items-center -space-x-2 mb-3">
                  {list.members.slice(0, 5).map(m => (
                    <div key={m._id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #E879F9)',
                        border: '2px solid #0F1623'
                      }}>
                      {m.username?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {list.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: '#1E2A45', border: '2px solid #0F1623' }}>
                      +{list.members.length - 5}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Owner: {list.owner.username}
                </p>
              </Link>

              {/* Delete button — only for owner */}
              {list.owner._id === user._id && (
                <button onClick={() => handleDelete(list._id)}
                  className="mt-3 w-full py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-400 transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  Delete list
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.08)' }}>

            <h2 className="text-xl font-bold text-white mb-4">New collab list</h2>

            <form onSubmit={handleCreate}>
              <label className="block text-xs text-gray-400 mb-1.5">List name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Friday Night Movies"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                autoFocus
              />

              {friends.length > 0 ? (
                <>
                  <label className="block text-xs text-gray-400 mb-2">Invite friends (optional)</label>
                  <div className="max-h-48 overflow-y-auto rounded-xl mb-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {friends.map(f => (
                      <label key={f._id}
                        className="flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-white/5">
                        <input type="checkbox"
                          checked={selectedFriends.includes(f._id)}
                          onChange={() => toggleFriend(f._id)}
                          className="cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                          {f.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-sm">{f.username}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mb-4 p-3 rounded-xl text-xs text-gray-400"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  💡 Add friends first to invite them to this list. You can also create solo lists.
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-300"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                  Create list
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollabLists;