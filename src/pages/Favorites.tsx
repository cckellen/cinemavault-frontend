import { useState, useEffect } from 'react';
import { Container, Grid, Loader, Center } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';
import { notifications } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchFavorites();
  }, [token]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load favourites', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (movieId: string) => {
    try {
      await api.delete(`/favorites/${movieId}`);
      notifications.show({ title: 'Removed', message: 'Removed from favourites', color: 'green' });
      fetchFavorites();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to remove', color: 'red' });
    }
  };

  if (loading) return <Center py="xl"><Loader color="cinema" /></Center>;

  return (
    <Container size="xl" py="xl">
      <PageHeader title="My Favourites" description="Films you have saved to your personal collection." icon={IconHeart} />
      {favorites.length === 0 ? (
        <EmptyState
          icon={IconHeart}
          title="No favourites yet"
          description="Browse the movie catalogue and tap Save on any film you love."
          actionLabel="Discover Movies"
          actionTo="/movies"
        />
      ) : (
        <Grid>
          {favorites.map((movie) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
              <MovieCard movie={movie} isFavourite showActions onToggleFavourite={removeFavorite} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
