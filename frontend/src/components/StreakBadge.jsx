// StreakBadge — displays user's watch streak and earned badges
const BADGE_INFO = {
  '7-day-streak':  { emoji: '🔥', label: '7-Day Streak',  desc: 'Watched 7 days in a row' },
  '30-day-streak': { emoji: '👑', label: '30-Day Streak', desc: 'Watched 30 days in a row' },
  'watched-10':    { emoji: '🎬', label: 'Movie Buff',    desc: 'Watched 10 titles' },
  'watched-50':    { emoji: '🏆', label: 'Cinema Legend', desc: 'Watched 50 titles' },
};

function StreakBadge({ streak, badges, totalWatched }) {
  return (
    <div className="rounded-2xl p-6"
      style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: '20px' }}>🔥</span>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Streak</p>
          </div>
          <p className="text-3xl font-bold text-white">{streak?.count || 0}</p>
          <p className="text-gray-500 text-xs mt-1">consecutive days</p>
        </div>

        <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(232,121,249,0.06)', border: '1px solid rgba(232,121,249,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: '20px' }}>🎬</span>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Watched</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalWatched || 0}</p>
          <p className="text-gray-500 text-xs mt-1">titles total</p>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Achievements</h3>
        {badges?.length === 0 || !badges ? (
          <div className="p-6 rounded-xl text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-gray-400 text-sm">Watch movies to earn badges</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => {
              const info = BADGE_INFO[badge];
              if (!info) return null;
              return (
                <div key={badge}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(232,121,249,0.2))' }}>
                    <span style={{ fontSize: '20px' }}>{info.emoji}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{info.label}</p>
                    <p className="text-gray-500 text-xs truncate">{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StreakBadge;