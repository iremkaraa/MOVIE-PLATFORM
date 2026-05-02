// Profile page — user stats, streak, achievements
import { useEffect, useState } from 'react';
import { getMyBadges } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StreakBadge from '../components/StreakBadge';

function Profile() {
  const { user, logout } = useAuth();
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBadges()
      .then(res => setBadgeData(res.data))
      .catch(err => console.error('Badge fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
<div className="px-6 pt-32 pb-10 max-w-3xl mx-auto" style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
            {user?.role === 'admin' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)', color: 'white' }}>
                Admin
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <p className="text-gray-600 text-xs mt-1">
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats & Badges */}
      {badgeData && (
        <StreakBadge
          streak={badgeData.streak}
          badges={badgeData.badges}
          totalWatched={badgeData.totalWatched}
        />
      )}

      {/* Sign out */}
      <button onClick={logout}
        className="mt-6 w-full py-3 rounded-xl text-red-400 font-medium text-sm transition-colors hover:bg-red-500/10"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        Sign Out
      </button>
    </div>
  );
}

export default Profile;