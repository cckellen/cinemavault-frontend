import { useState, useEffect } from 'react';
import { Container, TextInput, Select, Grid, Group, Text, NumberInput, Loader, Center, Paper, Badge } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconMovie } from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';
import { notifications } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    api.get('/genres').then((res) => setGenres(res.data.genres)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [debouncedSearch, genre, year, minRating, sort]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavoriteIds(new Set(res.data.map((m: Movie) => m.id)));
    } catch {
      /* ignore */
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (genre) params.genre = genre;
      if (year) params.year = year;
      if (minRating) params.minRating = minRating;
      if (sort) params.sort = sort;

      const res = await api.get('/movies', { params });
      const list = Array.isArray(res.data) ? res.data : res.data.data;
      setMovies(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load movies';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (movieId: string) => {
    try {
      if (favoriteIds.has(movieId)) {
        await api.delete(`/favorites/${movieId}`);
        setFavoriteIds((prev) => { const n = new Set(prev); n.delete(movieId); return n; });
        notifications.show({ title: 'Removed', message: 'Removed from favourites', color: 'gray' });
      } else {
        await api.post('/favorites', { movieId });
        setFavoriteIds((prev) => new Set(prev).add(movieId));
        notifications.show({ title: 'Added!', message: 'Movie added to favourites', color: 'green' });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      notifications.show({ title: 'Error', message: axiosErr.response?.data?.error || 'Failed', color: 'red' });
    }
  };

  const addToWatchlist = async (movieId: string) => {
    try {
      await api.post('/watchlist', { movieId, status: 'WATCHLIST' });
      notifications.show({ title: 'Added!', message: 'Added to watchlist', color: 'blue' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      notifications.show({ title: 'Error', message: axiosErr.response?.data?.error || 'Failed', color: 'red' });
    }
  };

  return (
    <Container size="xl" py="xl">
      <div className="cv-hero" style={{ marginBottom: '2rem' }}>
        <PageHeader
          title="Discover Movies"
          description="Browse, search and save your favourite films from the CinemaVault catalogue."
          icon={IconMovie}
        />
        {!user && (
          <Badge color="cinema" variant="light" size="lg">Sign in to save favourites and manage your watchlist</Badge>
        )}
      </div>

      <Paper p="md" mb="lg" withBorder>
        <Group grow preventGrowOverflow={false}>
          <TextInput placeholder="Search title, plot or director..." value={search} onChange={(e) => setSearch(e.target.value)} leftSection={<IconSearch size={16} />} />
          <Select placeholder="Genre" value={genre} onChange={(val) => setGenre(val || '')} data={genres.length ? genres : ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Thriller', 'Romance']} clearable />
          <NumberInput placeholder="Year" value={year} onChange={(v) => setYear(v as number | '')} min={1900} max={2030} />
          <NumberInput placeholder="Min Rating" value={minRating} onChange={(v) => setMinRating(v as number | '')} min={0} max={10} step={0.5} decimalScale={1} />
          <Select placeholder="Sort by" value={sort} onChange={(val) => setSort(val || '')} data={[{ value: 'title', label: 'Title' }, { value: 'year', label: 'Year' }, { value: 'rating', label: 'Rating' }]} clearable />
        </Group>
      </Paper>

      {error && <Text c="red" mb="md">{error}</Text>}
      {loading ? (
        <Center py="xl"><Loader color="cinema" /></Center>
      ) : movies.length === 0 ? (
        <Center py="xl"><Text c="dimmed">No movies found matching your criteria.</Text></Center>
      ) : (
        <Grid>
          {movies.map((movie) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
              <MovieCard
                movie={movie}
                isFavourite={favoriteIds.has(movie.id)}
                onToggleFavourite={user ? toggleFavorite : undefined}
                onWatchlist={user ? (id) => addToWatchlist(id) : undefined}
                showActions={!!user}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
