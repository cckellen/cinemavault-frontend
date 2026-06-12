import { useState, useEffect } from 'react';
import { Container, Tabs, Grid, Loader, Center } from '@mantine/core';
import { IconCheck, IconBookmark } from '@tabler/icons-react';
import api from '../services/api';
import { WatchlistItem } from '../types';
import { notifications } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';

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

  const renderGrid = (items: WatchlistItem[], emptyTitle: string, showMarkWatched = false) => {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={showMarkWatched ? IconBookmark : IconCheck}
          title={emptyTitle}
          description="Add films from the movie catalogue to track what you want to watch."
          actionLabel="Browse Movies"
          actionTo="/movies"
        />
      );
    }
    return (
      <Grid>
        {items.map((movie) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
            <MovieCard
              movie={movie}
              showActions
              onWatchlist={showMarkWatched ? markWatched : undefined}
              watchlistLabel="Mark Watched"
              onRemove={removeItem}
            />
          </Grid.Col>
        ))}
      </Grid>
    );
  };

  if (loading) return <Center py="xl"><Loader color="cinema" /></Center>;

  return (
    <Container size="xl" py="xl">
      <PageHeader title="My Watchlist" description="Track films you plan to watch and those you have already seen." icon={IconBookmark} />
      <Tabs defaultValue="watchlist" color="cinema">
        <Tabs.List>
          <Tabs.Tab value="watchlist">Want to Watch ({watchlist.length})</Tabs.Tab>
          <Tabs.Tab value="watched">Watched ({watched.length})</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="watchlist" pt="md">{renderGrid(watchlist, 'Nothing on your watchlist', true)}</Tabs.Panel>
        <Tabs.Panel value="watched" pt="md">{renderGrid(watched, 'No watched films yet')}</Tabs.Panel>
      </Tabs>
    </Container>
  );
}
