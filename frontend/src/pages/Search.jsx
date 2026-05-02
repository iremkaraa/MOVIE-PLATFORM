// Search page — live search with filters (genre, year, rating)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMedia, getGenres } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import axios from 'axios';

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

// Years from 2026 down to 1991
const YEARS = Array.from({ length: 36 }, (_, i) => String(2026 - i));

// Rating tiers — clearer label and value structure
const RATINGS = [
  { label: '9+ stars', value: '9' },
  { label: '8+ stars', value: '8' },
  { label: '7+ stars', value: '7' },
  { label: '6+ stars', value: '6' },
  { label: '5+ stars', value: '5' },
];

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Load genre list on mount
  useEffect(() => {
    getGenres().then(res => setGenres(res.data.genres)).catch(console.error);
  }, []);

  // Debounce — wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      if (query.trim()) {
        setSearchParams({ q: query.trim() });
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Run search whenever debouncedQuery, page, or filters change
  useEffect(() => {
    setLoading(true);
    let request;

    if (debouncedQuery.trim()) {
      // Text search
      request = searchMedia(debouncedQuery, page);
    } else if (selectedGenre || selectedYear || selectedRating) {
      // Filter-based discover (movies only — TV doesn't support all filters)
      const minRating = selectedRating ? parseFloat(selectedRating) : undefined;
      request = axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_KEY,
          language: 'en-US',
          with_genres: selectedGenre || undefined,
          primary_release_year: selectedYear || undefined,
          'vote_average.gte': minRating,
          'vote_count.gte': 50, // Filter out obscure titles
          sort_by: 'popularity.desc',
          page,
        }
      });
    } else {
      // Default — show popular movies
      request = axios.get(`${BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_KEY, language: 'en-US', page }
      });
    }

    request
      .then(res => {
        setResults((res.data.results || []).filter(r => r.media_type !== 'person'));
        setTotalPages(res.data.total_pages || 0);
      })
      .catch(err => {
        console.error('Search error:', err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, page, selectedGenre, selectedYear, selectedRating]);

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedRating('');
    setQuery('');
    setPage(1);
  };

  const hasActiveFilter = selectedGenre || selectedYear || selectedRating || query;

  return (
<div className="px-6 pt-24 pb-10" style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Discover</p>
        <h1 className="text-3xl font-bold text-white mb-6">Find your next favorite</h1>

        {/* Search input — bigger and more visible */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Start typing to search..."
            className="w-full pl-12 pr-4 py-4 rounded-xl text-white text-base outline-none transition-all"
            style={{
              backgroundColor: '#1A2238',
              border: '1px solid rgba(124,58,237,0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          />
          {/* Live indicator while typing */}
          {query !== debouncedQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={selectedGenre} onChange={e => { setSelectedGenre(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ backgroundColor: '#1A2238', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ backgroundColor: '#1A2238', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={selectedRating} onChange={e => { setSelectedRating(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ backgroundColor: '#1A2238', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="">Any Rating</option>
            {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          {hasActiveFilter && (
            <button onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading skeleton on first load only */}
      {loading && results.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse"
              style={{ aspectRatio: '2/3', backgroundColor: '#111827' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <p className="text-gray-500 text-sm mb-4">
            {debouncedQuery ? `Results for "${debouncedQuery}"` : 'Popular titles'}
            {selectedGenre && genres.find(g => g.id == selectedGenre) && ` · ${genres.find(g => g.id == selectedGenre).name}`}
            {selectedYear && ` · ${selectedYear}`}
            {selectedRating && ` · ${selectedRating}+ stars`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {results.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2 rounded-xl text-sm text-white disabled:opacity-30"
              style={{ backgroundColor: '#1A2238', border: '1px solid rgba(255,255,255,0.1)' }}>
              ← Previous
            </button>
            <span className="text-gray-500 text-sm">Page {page} of {Math.min(totalPages, 500)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
              className="px-5 py-2 rounded-xl text-sm text-white disabled:opacity-30"
              style={{ backgroundColor: '#1A2238', border: '1px solid rgba(255,255,255,0.1)' }}>
              Next →
            </button>
          </div>
        </>
      )}

      {/* No results */}
      {!loading && results.length === 0 && debouncedQuery && (
        <div className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-white font-medium">No results for "{debouncedQuery}"</p>
          <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

export default Search;