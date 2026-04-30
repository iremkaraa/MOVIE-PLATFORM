// TMDB API service — all calls to The Movie Database API
import axios from 'axios';

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

// Axios instance for TMDB
const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_KEY,
    language: 'en-US',
  },
});

// Get trending movies and TV shows for homepage
export const getTrending = () =>
  tmdb.get('/trending/all/week');

// Search movies and TV shows by query text
export const searchMedia = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page } });

// Get detailed info for a single movie
export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,similar' }
  });

// Get detailed info for a single TV series
export const getTVDetails = (id) =>
  tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'credits,videos,similar' }
  });

// Vibe Match — discover movies by genre, sorted by popularity
export const getMoviesByVibe = (genreIds) =>
  tmdb.get('/discover/movie', {
    params: {
      with_genres: genreIds,
      sort_by: 'popularity.desc',
      'vote_count.gte': 50,
      include_adult: false,
    }
  });

// Get movies by genre for filtering
export const getMoviesByGenre = (genreId, page = 1) =>
  tmdb.get('/discover/movie', { params: { with_genres: genreId, page } });

// Get list of all genres
export const getGenres = () =>
  tmdb.get('/genre/movie/list');

export default tmdb;