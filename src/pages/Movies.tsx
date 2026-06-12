import { useState, useEffect } from 'react';
import { Container, Title, TextInput, Select, Grid, Card, Image, Badge, Button, Group, Text, NumberInput, Loader, Center, Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconHeart, IconSearch, IconEye, IconHeartFilled } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';
import { notifications } from '@mantine/notifications';

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
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
      <Title order={1} mb="md">Discover Movies</Title>
      <Group mb="lg" grow preventGrowOverflow={false}>
        <TextInput placeholder="Search title, plot or director..." value={search} onChange={(e) => setSearch(e.target.value)} leftSection={<IconSearch size={16} />} />
        <Select placeholder="Genre" value={genre} onChange={(val) => setGenre(val || '')} data={['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Thriller', 'Romance']} clearable />
        <NumberInput placeholder="Year" value={year} onChange={(v) => setYear(v as number | '')} min={1900} max={2030} />
        <NumberInput placeholder="Min Rating" value={minRating} onChange={(v) => setMinRating(v as number | '')} min={0} max={10} step={0.5} decimalScale={1} />
        <Select placeholder="Sort by" value={sort} onChange={(val) => setSort(val || '')} data={[{ value: 'title', label: 'Title' }, { value: 'year', label: 'Year' }, { value: 'rating', label: 'Rating' }]} clearable />
      </Group>

      {error && <Text c="red" mb="md">{error}</Text>}
      {loading ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <Grid>
          {movies.map((movie) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Card.Section>
                  <Image src={movie.poster || 'https://via.placeholder.com/300x400?text=No+Poster'} h={280} alt={movie.title} />
                </Card.Section>
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500} lineClamp={1}>{movie.title}</Text>
                  {movie.rating != null && <Badge color="yellow">{movie.rating}</Badge>}
                </Group>
                <Text size="sm" c="dimmed">{movie.genre}{movie.year ? ` • ${movie.year}` : ''}</Text>
                <Stack gap="xs" mt="md">
                  <Button component={Link} to={`/movies/${movie.id}`} variant="light" leftSection={<IconEye size={16} />} fullWidth>Details</Button>
                  {user && (
                    <Group grow>
                      <Button
                        variant={favoriteIds.has(movie.id) ? 'filled' : 'subtle'}
                        color={favoriteIds.has(movie.id) ? 'red' : 'gray'}
                        leftSection={favoriteIds.has(movie.id) ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                        onClick={() => toggleFavorite(movie.id)}
                      >
                        {favoriteIds.has(movie.id) ? 'Favourited' : 'Favourite'}
                      </Button>
                      <Button variant="subtle" onClick={() => addToWatchlist(movie.id)}>Watchlist</Button>
                    </Group>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
          {movies.length === 0 && <Text c="dimmed">No movies found matching your criteria.</Text>}
        </Grid>
      )}
    </Container>
  );
}
