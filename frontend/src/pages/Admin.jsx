// Admin page — manage users, view stats, moderate content
import { useEffect, useState } from 'react';
import api from '../services/api';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Admin fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  const stats = [
    { label: 'Total Users', value: users.length, emoji: '👥' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, emoji: '🛡️' },
    { label: 'Active Streaks', value: users.filter(u => u.streak?.count > 0).length, emoji: '🔥' },
    { label: 'Total Badges', value: users.reduce((sum, u) => sum + (u.badges?.length || 0), 0), emoji: '🏆' },
  ];

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto"
      style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage users and moderate content</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-2xl"
            style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '18px' }}>{s.emoji}</span>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{s.label}</p>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-white font-semibold">All Users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">User</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Email</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Role</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Streak</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}
                  className="transition-colors hover:bg-white/5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400">{u.email}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;