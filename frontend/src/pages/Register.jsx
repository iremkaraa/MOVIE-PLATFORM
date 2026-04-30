// Register page — creates a new Moodflix account with validation
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Validation rules
const validate = (form) => {
  const errors = {};
  if (form.username.length < 3) errors.username = 'Username must be at least 3 characters.';
  if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errors.username = 'Username can only contain letters, numbers, and underscores.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address.';
  if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (!/(?=.*[0-9])/.test(form.password)) errors.password = 'Password must contain at least one number.';
  return errors;
};

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0B0F1A' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
              🎬
            </div>
            <span className="text-xl font-bold">
              <span style={{ color: '#E879F9' }}>Mood</span>
              <span className="text-white">flix</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Start tracking your watch journey</p>
        </div>

        <div className="rounded-2xl p-6"
          style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Server error */}
          {serverError && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
              <input type="text" value={form.username}
                onChange={e => handleChange('username', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors.username ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                }}
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input type="email" value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                }}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input type="password" value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                }}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-600 text-xs mt-1">Min 6 characters, at least one number</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-1 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#E879F9' }} className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;