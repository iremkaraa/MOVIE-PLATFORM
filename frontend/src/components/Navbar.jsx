// Navbar — sticky top navigation with active link highlighting
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  // Build navigation links based on user role
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Discover' },
    ...(user ? [
      { path: '/watchlist', label: 'Watchlist' },
      { path: '/compatibility', label: 'Friends' }
    ] : []),
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
          🎬
        </div>
        <span className="text-lg font-bold tracking-tight">
          <span style={{ color: '#E879F9' }}>Mood</span>
          <span className="text-white">flix</span>
        </span>
      </Link>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ path, label }) => (
          <Link key={path} to={path}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              color: isActive(path) ? '#ffffff' : '#6B7280',
              backgroundColor: isActive(path) ? 'rgba(124,58,237,0.15)' : 'transparent',
            }}>
            {label}
          </Link>
        ))}
      </div>

      {/* Right side — auth */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hidden sm:block">{user.username}</span>
            </Link>
            <button onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register"
              className="px-4 py-2 rounded-xl text-sm text-white font-medium transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;