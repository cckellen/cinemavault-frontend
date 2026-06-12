import { useState, useEffect } from 'react';
import { Container, Title, Tabs, Grid, Card, Image, Badge, Text, Button, Group, Loader, Center } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { WatchlistItem } from '../types';
import { notifications } from '@mantine/notifications';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watched, setWatched] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [wl, wd] = await Promise.all([
        api.get('/watchlist', { params: { status: 'WATCHLIST' } }),
        api.get('/watchlist', { params: { status: 'WATCHED' } }),
      ]);
      setWatchlist(wl.data);
      setWatched(wd.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load watchlist', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const markWatched = async (movieId: string) => {
    try {
      await api.post('/watchlist', { movieId, status: 'WATCHED' });
      notifications.show({ title: 'Updated', message: 'Marked as watched', color: 'green' });
      fetchItems();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update', color: 'red' });
    }
  };

  const removeItem = async (movieId: string) => {
    try {
      await api.delete(`/watchlist/${movieId}`);
      fetchItems();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to remove', color: 'red' });
    }
  };

  const renderGrid = (items: WatchlistItem[], showMarkWatched = false) => (
    <Grid>
      {items.length > 0 ? items.map((movie) => (
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={movie.id}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section component={Link} to={`/movies/${movie.id}`} style={{ cursor: 'pointer' }}>
              <Image src={movie.poster || 'https://via.placeholder.com/300'} h={250} alt={movie.title} />
            </Card.Section>
            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>{movie.title}</Text>
              {movie.rating != null && <Badge color="yellow">{movie.rating}</Badge>}
            </Group>
            <Group mt="md">
              {showMarkWatched && (
                <Button size="xs" leftSection={<IconCheck size={14} />} onClick={() => markWatched(movie.id)}>Mark Watched</Button>
              )}
              <Button size="xs" color="red" variant="light" leftSection={<IconTrash size={14} />} onClick={() => removeItem(movie.id)}>Remove</Button>
            </Group>
          </Card>
        </Grid.Col>
      )) : <Text c="dimmed">No items in this list.</Text>}
    </Grid>
  );

  if (loading) return <Center py="xl"><Loader /></Center>;

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">My Watchlist</Title>
      <Tabs defaultValue="watchlist">
        <Tabs.List>
          <Tabs.Tab value="watchlist">Want to Watch ({watchlist.length})</Tabs.Tab>
          <Tabs.Tab value="watched">Watched ({watched.length})</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="watchlist" pt="md">{renderGrid(watchlist, true)}</Tabs.Panel>
        <Tabs.Panel value="watched" pt="md">{renderGrid(watched)}</Tabs.Panel>
      </Tabs>
    </Container>
  );
}
