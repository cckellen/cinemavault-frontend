export interface Movie {
  id: string;
  title: string;
  titleZh?: string;
  plot?: string;
  genre: string;
  year?: number;
  rating?: number;
  poster?: string;
  director?: string;
  castInfo?: string;
  runtime?: string;
  isActive?: boolean;
  omdbId?: string | null;
  imdbRating?: number | null;
  posterUrl?: string | null;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface User {
  id: string;
  username: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
  avatarUrl?: string | null;
}

export interface Message {
  id: string;
  content: string;
  from: string;
  to: string;
  movieId?: string;
  movie?: { id: string; title: string };
  isRead: boolean;
  createdAt: string;
}

export interface WatchlistItem extends Movie {
  status: 'WATCHLIST' | 'WATCHED';
  watchlistId: string;
}

export interface OmdbSearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}
