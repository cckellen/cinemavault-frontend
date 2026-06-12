import { useState, useEffect } from 'react';
import { Container, Title, Button, Table, Modal, TextInput, Select, NumberInput, Group, ActionIcon, Text, Tabs, Textarea, ScrollArea, Image } from '@mantine/core';
import { IconEdit, IconTrash, IconDownload } from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Movie, OmdbSearchResult } from '../types';
import { notifications } from '@mantine/notifications';

interface MovieForm {
  title: string;
  genre: string;
  year: number;
  rating: number;
  poster: string;
  plot: string;
  director: string;
}

const emptyForm: MovieForm = { title: '', genre: '', year: 2025, rating: 7.0, poster: '', plot: '', director: '' };

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [opened, setOpened] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [omdbQuery, setOmdbQuery] = useState('');
  const [omdbResults, setOmdbResults] = useState<OmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchMovies();
  }, [token]);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/admin/movies');
      setMovies(res.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load movies', color: 'red' });
    }
  };

  const saveMovie = async () => {
    if (!form.title || !form.genre) {
      notifications.show({ title: 'Validation', message: 'Title and genre are required', color: 'orange' });
      return;
    }
    try {
      if (editingMovie) {
        await api.put(`/admin/movies/${editingMovie.id}`, form);
        notifications.show({ title: 'Updated', message: 'Movie updated', color: 'green' });
      } else {
        await api.post('/admin/movies', form);
        notifications.show({ title: 'Created', message: 'Movie created', color: 'green' });
      }
      setOpened(false);
      fetchMovies();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to save movie', color: 'red' });
    }
  };

  const deleteMovie = async (id: string) => {
    if (!confirm('Delete this movie?')) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      notifications.show({ title: 'Deleted', message: 'Movie removed', color: 'green' });
      fetchMovies();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
    }
  };

  const searchOmdb = async () => {
    if (!omdbQuery) return;
    setLoading(true);
    try {
      const res = await api.get('/omdb/search', { params: { q: omdbQuery } });
      setOmdbResults(res.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      notifications.show({ title: 'OMDB Error', message: axiosErr.response?.data?.error || 'Search failed', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const importFromOmdb = async (imdbId: string) => {
    try {
      await api.post('/admin/movies/import', { imdbId });
      notifications.show({ title: 'Imported', message: 'Movie imported from OMDB', color: 'green' });
      fetchMovies();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      notifications.show({ title: 'Import Error', message: axiosErr.response?.data?.error || 'Import failed', color: 'red' });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="md">
        <Title>Manage Movies (Admin)</Title>
        <Button onClick={() => { setEditingMovie(null); setForm(emptyForm); setOpened(true); }}>Add New Movie</Button>
      </Group>

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">Movie List</Tabs.Tab>
          <Tabs.Tab value="omdb">Import from OMDB</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="md">
          <ScrollArea>
          <Table striped highlightOnHover miw={700}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Genre</Table.Th>
                <Table.Th>Year</Table.Th>
                <Table.Th>Rating</Table.Th>
                <Table.Th>Active</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {movies.map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>{m.title}</Table.Td>
                  <Table.Td>{m.genre}</Table.Td>
                  <Table.Td>{m.year}</Table.Td>
                  <Table.Td>{m.rating}</Table.Td>
                  <Table.Td>{m.isActive !== false ? 'Yes' : 'No'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon onClick={() => { setEditingMovie(m); setForm({ title: m.title, genre: m.genre, year: m.year || 2025, rating: m.rating || 7, poster: m.poster || '', plot: m.plot || '', director: m.director || '' }); setOpened(true); }}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" onClick={() => deleteMovie(m.id)}><IconTrash size={16} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="omdb" pt="md">
          <Group mb="md">
            <TextInput placeholder="Search OMDB..." value={omdbQuery} onChange={(e) => setOmdbQuery(e.target.value)} style={{ flex: 1 }} />
            <Button onClick={searchOmdb} loading={loading}>Search</Button>
          </Group>
          {omdbResults.map((r) => (
            <Group key={r.imdbID} justify="space-between" mb="sm" p="sm" wrap="nowrap" style={{ border: '1px solid #eee', borderRadius: 8 }}>
              {r.Poster && r.Poster !== 'N/A' && <Image src={r.Poster} w={40} h={60} alt={r.Title} radius="sm" />}
              <div style={{ flex: 1 }}>
                <Text fw={500}>{r.Title}</Text>
                <Text size="sm" c="dimmed">{r.Year} · {r.Type}</Text>
              </div>
              <Button size="xs" leftSection={<IconDownload size={14} />} onClick={() => importFromOmdb(r.imdbID)}>Import</Button>
            </Group>
          ))}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editingMovie ? 'Edit Movie' : 'New Movie'} size="lg">
        <TextInput label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select label="Genre" required mt="sm" value={form.genre} onChange={(v) => setForm({ ...form, genre: v || '' })} data={['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Thriller', 'Romance']} />
        <NumberInput label="Year" mt="sm" value={form.year} onChange={(v) => setForm({ ...form, year: (v as number) || 2025 })} />
        <NumberInput label="Rating" mt="sm" value={form.rating} onChange={(v) => setForm({ ...form, rating: (v as number) || 7 })} decimalScale={1} step={0.1} min={0} max={10} />
        <TextInput label="Poster URL" mt="sm" value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} />
        <TextInput label="Director" mt="sm" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} />
        <Textarea label="Plot" mt="sm" value={form.plot} onChange={(e) => setForm({ ...form, plot: e.target.value })} minRows={3} />
        <Button fullWidth mt="md" onClick={saveMovie}>Save</Button>
      </Modal>
    </Container>
  );
}
