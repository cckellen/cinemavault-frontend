import { useState, useEffect } from 'react';
import { Container, Title, Grid, Card, Image, Badge, Text, Button, Group, Loader, Center } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';
import { notifications } from '@mantine/notifications';

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

  if (loading) return <Center py="xl"><Loader /></Center>;

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">My Favourites</Title>
      <Grid>
        {favorites.length > 0 ? favorites.map((movie) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={movie.id}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section component={Link} to={`/movies/${movie.id}`} style={{ cursor: 'pointer' }}>
                <Image src={movie.poster || 'https://via.placeholder.com/300'} h={280} alt={movie.title} />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500}>{movie.title}</Text>
                {movie.rating != null && <Badge color="yellow">{movie.rating}</Badge>}
              </Group>
              <Text size="sm" c="dimmed">{movie.genre}{movie.year ? ` • ${movie.year}` : ''}</Text>
              <Button fullWidth mt="md" color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={() => removeFavorite(movie.id)}>
                Remove
              </Button>
            </Card>
          </Grid.Col>
        )) : <Text c="dimmed">No favourites yet. Browse movies to add some!</Text>}
      </Grid>
    </Container>
  );
}
