// Search page — live search as you type, with filters
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMedia, getGenres } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import axios from 'axios';

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

const YEARS = ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015'];
const RATINGS = ['9+','8+','7+','6+','5+'];

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

  // Load genres on mount
  useEffect(() => {
    getGenres().then(res => setGenres(res.data.genres)).catch(console.error);
  }, []);

  // Debounce query — wait 300ms after user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      // Update URL params
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
      request = searchMedia(debouncedQuery, page);
    } else if (selectedGenre || selectedYear || selectedRating) {
      const minRating = selectedRating ? parseFloat(selectedRating.replace('+', '')) : undefined;
      request = axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_KEY, language: 'en-US',
          with_genres: selectedGenre || undefined,
          primary_release_year: selectedYear || undefined,
          'vote_average.gte': minRating,
          sort_by: 'popularity.desc', page,
        }
      });
    } else {
      request = axios.get(`${BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_KEY, language: 'en-US', page }
      });
    }

    request
      .then(res => {
        setResults(res.data.results.filter(r => r.media_type !== 'person'));
        setTotalPages(res.data.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery, page, selectedGenre, selectedYear, selectedRating]);

  const clearFilters = () => {
    setSelectedGenre(''); setSelectedYear(''); setSelectedRating('');
    setQuery(''); setPage(1);
  };

  const hasActiveFilter = selectedGenre || selectedYear || selectedRating || query;

  return (
    <div className="px-6 py-10" style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>

      <div className="mb-8 max-w-3xl">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Discover</p>
        <h1 className="text-3xl font-bold text-white mb-6">Find your next favorite</h1>

        {/* Live search input */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Start typing to search..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm outline-none"
            style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          {/* Live indicator while typing */}
          {query !== debouncedQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select value={selectedGenre} onChange={e => { setSelectedGenre(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ backgroundColor: '#0F1623', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ backgroundColor: '#0F1623', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={selectedRating} onChange={e => { setSelectedRating(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ backgroundColor: '#0F1623', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="">Any Rating</option>
            {RATINGS.map(r => <option key={r} value={r}>{r} stars</option>)}
          </select>

          {hasActiveFilter && (
            <button onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
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

      {results.length > 0 && (
        <>
          <p className="text-gray-500 text-sm mb-4">
            {debouncedQuery ? `Results for "${debouncedQuery}"` : 'Popular titles'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {results.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2 rounded-xl text-sm text-white disabled:opacity-30"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.08)' }}>
              ← Previous
            </button>
            <span className="text-gray-500 text-sm">Page {page} of {Math.min(totalPages, 500)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
              className="px-5 py-2 rounded-xl text-sm text-white disabled:opacity-30"
              style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.08)' }}>
              Next →
            </button>
          </div>
        </>
      )}

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