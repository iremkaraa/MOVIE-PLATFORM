// Home page — shows trending content and Vibe Match feature
import { useEffect, useState } from 'react';
import { getTrending } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import VibeMatcher from '../components/VibeMatcher';

function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending movies and TV shows on page load
  useEffect(() => {
    getTrending()
      .then(res => setTrending(res.data.results))
      .catch(err => console.error('Trending fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero section */}
      <div className="px-6 py-12 text-center"
        style={{ background: 'linear-gradient(180deg, #1E2A45 0%, #0B0F1A 100%)' }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Discover Your Next
          <span style={{ color: '#E879F9' }}> Obsession</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Track, discover, and share movies and series with your friends.
        </p>
      </div>

      {/* Vibe Match section */}
      <VibeMatcher />

      {/* Trending section */}
      <section className="px-6 pb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Trending This Week 🌊</h2>
        {loading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            Loading trending content...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trending.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;