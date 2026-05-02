// Navbar — slim, professional, Netflix-inspired navigation
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Add background when scrolled past hero
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Discover' },
    { path: '/vibe', label: 'Vibe Match', highlight: true },
    ...(user ? [
      { path: '/watchlist', label: 'Watchlist' },
      { path: '/collab', label: 'Collab' },
      { path: '/friends', label: 'Friends' },
      { path: '/compatibility', label: 'Compatibility' },
    ] : []),
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-3 flex items-center justify-between transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(11,15,26,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <span className="text-3xl font-bold tracking-tight select-none" style={{ fontFamily: '"Playfair Display", serif' }}>
          <span style={{ color: '#E879F9' }}>Mood</span>
          <span className="text-white">flix</span>
        </span>
      </Link>

      {/* Center links — slim */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ path, label, highlight }) => (
          <Link key={path} to={path}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-all relative whitespace-nowrap"
            style={{
              color: isActive(path) ? '#ffffff' : highlight ? '#E879F9' : '#9CA3AF',
              backgroundColor: isActive(path) ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}>
            {label}
            {/* Active underline */}
            {isActive(path) && (
              <span className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                style={{ backgroundColor: '#E879F9' }} />
            )}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-white/5 outline-none">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-300 hidden sm:block">{user.username}</span>
            </Link>
            <button onClick={handleLogout}
              className="px-5 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 transition-colors\">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register"
              className="px-5 py-2 rounded-lg text-sm font-bold text-white"
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