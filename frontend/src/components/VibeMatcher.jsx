// VibeMatcher — mood-based movie discovery quiz with eye-catching UI
import { useState } from 'react';
import { getMoviesByVibe } from '../services/tmdb';
import MovieCard from './MovieCard';

const MOODS = [
  { emoji: '😢', label: 'Emotional', sub: 'Sad, touching stories', genres: '18' },
  { emoji: '🔥', label: 'Thrilling', sub: 'Action-packed & intense', genres: '28,53' },
  { emoji: '😂', label: 'Funny', sub: 'Laugh out loud', genres: '35' },
  { emoji: '💀', label: 'Scary', sub: 'Horror & suspense', genres: '27' },
  { emoji: '💕', label: 'Romantic', sub: 'Love & connection', genres: '10749' },
  { emoji: '🚀', label: 'Epic', sub: 'Grand adventures', genres: '878,12' },
  { emoji: '🧠', label: 'Mind-bending', sub: 'Twists & puzzles', genres: '9648' },
  { emoji: '✨', label: 'Feel-good', sub: 'Warm & wholesome', genres: '10751,35' },
];

const DURATIONS = [
  { label: 'Quick watch', sub: 'Under 90 min', value: 'short' },
  { label: 'Standard', sub: '90 – 120 min', value: 'standard' },
  { label: 'Epic sit-down', sub: '2+ hours', value: 'long' },
  { label: 'No preference', sub: 'Surprise me', value: 'any' },
];

const ERAS = [
  { label: 'Brand new', sub: '2020s releases', value: '2020' },
  { label: 'Modern', sub: '2010s classics', value: '2010' },
  { label: 'Throwback', sub: '2000s & earlier', value: '2000' },
  { label: 'Any era', sub: 'All time greats', value: 'any' },
];

function VibeMatcher() {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMood = (m) => { setMood(m); setStep(2); };
  const handleDuration = () => setStep(3);

  const handleEra = async () => {
    setStep(4);
    setLoading(true);
    setMovies([]);
    try {
      const res = await getMoviesByVibe(mood.genres);
      const filtered = (res.data.results || []).filter(m => m.poster_path);
      setMovies(filtered.slice(0, 12));
    } catch (e) {
      console.error('Vibe fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(0); setMood(null); setMovies([]); };

  return (
    <section className="px-6 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>

      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Vibe Match</h2>
          <p className="text-gray-500 text-sm mt-0.5">3 questions → perfect movie recommendation</p>
        </div>
        {step > 0 && (
          <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Start over
          </button>
        )}
      </div>

      {/* Progress bar */}
      {step > 0 && step < 4 && (
        <div className="flex gap-1.5 mb-6 mt-4">
          {[1,2,3].map(s => (
            <div key={s} className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: s <= step ? '#7C3AED' : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      )}

      {/* Step 0 — Eye-catching CTA */}
      {step === 0 && (
        <div onClick={() => setStep(1)}
          className="relative rounded-3xl cursor-pointer group overflow-hidden mt-4 transition-all hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, #1a1240 0%, #2d1b4e 50%, #4a1d5c 100%)',
            border: '1px solid rgba(232,121,249,0.2)',
          }}>

          {/* Animated glow blobs */}
          <div className="absolute pointer-events-none transition-transform duration-700 group-hover:scale-110"
            style={{ top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,121,249,0.25) 0%, transparent 70%)' }} />
          <div className="absolute pointer-events-none transition-transform duration-700 group-hover:scale-110"
            style={{ bottom: '-80px', left: '-30px', width: '250px', height: '250px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />

         
          {/* Card content */}
          <div className="relative z-10 flex items-center gap-6 p-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:rotate-6"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
              <span style={{ fontSize: '40px' }}>🎭</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2"
                style={{ backgroundColor: 'rgba(232,121,249,0.15)', color: '#E879F9', border: '1px solid rgba(232,121,249,0.25)' }}>
                ✨ Mood-based
              </div>
              <p className="text-white text-2xl font-bold leading-tight">What's your vibe tonight?</p>
              <p className="text-gray-300 text-sm mt-2">Answer 3 quick questions for your perfect movie</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl flex-shrink-0 transition-all group-hover:translate-x-1"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
              <span className="text-white text-sm font-semibold">Start</span>
              <span className="text-white text-lg">→</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Mood selection */}
      {step === 1 && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-4 font-medium">How are you feeling right now?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOODS.map(m => (
              <button key={m.label} onClick={() => handleMood(m)}
                className="flex flex-col items-start p-4 rounded-xl text-left transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-3xl mb-3">{m.emoji}</span>
                <p className="text-white text-sm font-semibold">{m.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{m.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Duration */}
      {step === 2 && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-4 font-medium">
            <span style={{ color: '#E879F9' }}>{mood?.emoji} {mood?.label}</span> — how long do you want to watch?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => handleDuration(d.value)}
                className="flex flex-col items-start p-4 rounded-xl text-left transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-white text-sm font-semibold">{d.label}</p>
                <p className="text-gray-500 text-xs mt-1">{d.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Era */}
      {step === 3 && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-4 font-medium">Any preference on the era?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ERAS.map(e => (
              <button key={e.value} onClick={() => handleEra(e.value)}
                className="flex flex-col items-start p-4 rounded-xl text-left transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-white text-sm font-semibold">{e.label}</p>
                <p className="text-gray-500 text-xs mt-1">{e.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Results */}
      {step === 4 && (
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl animate-pulse"
                  style={{ aspectRatio: '2/3', backgroundColor: '#111827' }} />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-white font-medium">No movies found for this vibe</p>
              <p className="text-gray-500 text-sm mt-1">Try a different mood</p>
              <button onClick={reset}
                className="mt-4 px-5 py-2 rounded-xl text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-5">
                {mood?.emoji} Perfect picks for your <span style={{ color: '#E879F9' }}>{mood?.label}</span> mood
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={{ ...movie, media_type: 'movie' }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default VibeMatcher;