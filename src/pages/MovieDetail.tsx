import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Title, Image, Text, Badge, Group, Button, Paper, Loader, Center, Stack, Textarea, Modal } from '@mantine/core';
import { IconHeart, IconArrowLeft, IconMessage, IconCheck, IconBookmark } from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';
import { notifications } from '@mantine/notifications';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (id) fetchMovie(id);
  }, [id]);

  const fetchMovie = async (movieId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/movies/${movieId}`);
      setMovie(res.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Movie not found', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async () => {
    if (!movie) return;
    try {
      await api.post('/favorites', { movieId: movie.id });
      notifications.show({ title: 'Added!', message: 'Added to favourites', color: 'green' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      notifications.show({ title: 'Error', message: axiosErr.response?.data?.error || 'Failed', color: 'red' });
    }
  };

  const addWatchlist = async (status: 'WATCHLIST' | 'WATCHED') => {
    if (!movie) return;
    try {
      await api.post('/watchlist', { movieId: movie.id, status });
      notifications.show({
        title: 'Updated',
        message: status === 'WATCHED' ? 'Marked as watched' : 'Added to watchlist',
        color: 'green',
      });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update watchlist', color: 'red' });
    }
  };

  const sendMessage = async () => {
    if (!movie || !messageText.trim()) return;
    try {
      await api.post('/messages', { content: messageText, movieId: movie.id });
      setMessageOpen(false);
      setMessageText('');
      notifications.show({ title: 'Sent!', message: 'Message sent to administrator', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to send message', color: 'red' });
    }
  };

  if (loading) return <Center py="xl"><Loader color="cinema" size="lg" /></Center>;
  if (!movie) return <Container py="xl"><Text>Movie not found.</Text></Container>;

  return (
    <Container size="lg" py="xl">
      <Button component={Link} to="/movies" variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} mb="md">Back to Movies</Button>
      <Paper p="xl" withBorder className="cv-movie-card">
        <Stack gap="xl">
          <Group align="flex-start" wrap="wrap" gap="xl">
            <Image
              src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
              maw={300}
              w="100%"
              radius="md"
              alt={movie.title}
              fallbackSrc="https://via.placeholder.com/300x450?text=No+Poster"
            />
            <Stack gap="sm" style={{ flex: 1, minWidth: 260 }}>
              <Title order={1}>{movie.title}</Title>
              <Group>
                <Badge size="lg" color="cinema">{movie.genre}</Badge>
                {movie.year && <Badge variant="outline">{movie.year}</Badge>}
                {movie.rating != null && <Badge color="yellow" size="lg">★ {movie.rating}</Badge>}
                {movie.runtime && <Badge variant="outline">{movie.runtime}</Badge>}
                {movie.omdbId && <Badge variant="outline" color="blue">OMDB</Badge>}
              </Group>
              {movie.director && <Text><strong>Director:</strong> {movie.director}</Text>}
              {movie.castInfo && <Text><strong>Cast:</strong> {movie.castInfo}</Text>}
              {movie.plot && <Text mt="md" c="dimmed" lh={1.6}>{movie.plot}</Text>}
            </Stack>
          </Group>
          {user && (
            <Group wrap="wrap">
              <Button color="red" variant="light" leftSection={<IconHeart size={16} />} onClick={addFavorite}>Add to Favourites</Button>
              <Button variant="light" color="cinema" leftSection={<IconBookmark size={16} />} onClick={() => addWatchlist('WATCHLIST')}>Add to Watchlist</Button>
              <Button variant="light" color="green" leftSection={<IconCheck size={16} />} onClick={() => addWatchlist('WATCHED')}>Mark Watched</Button>
              <Button variant="outline" color="gray" leftSection={<IconMessage size={16} />} onClick={() => { setMessageText(`I am interested in "${movie.title}". `); setMessageOpen(true); }}>Message Admin</Button>
            </Group>
          )}
        </Stack>
      </Paper>

      <Modal opened={messageOpen} onClose={() => setMessageOpen(false)} title={`Message about ${movie.title}`}>
        <Textarea
          label="Your message to the administrator"
          placeholder="Express your interest in this film..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          minRows={4}
          required
        />
        <Button fullWidth mt="md" color="cinema" onClick={sendMessage} disabled={!messageText.trim()}>Send Message</Button>
      </Modal>
    </Container>
  );
}
