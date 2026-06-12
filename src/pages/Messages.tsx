import { useState, useEffect } from 'react';
import { Container, Title, Textarea, Button, Paper, Table, Text, Group, ActionIcon, Modal, Badge, Select, ScrollArea } from '@mantine/core';
import { IconTrash, IconMessageReply } from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Message, Movie } from '../types';
import { notifications } from '@mantine/notifications';

export default function Messages() {
  const [content, setContent] = useState('');
  const [movieId, setMovieId] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    if (user?.role !== 'ADMIN') fetchMovies();
  }, [user]);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies', { params: { limit: 100 } });
      const list = Array.isArray(res.data) ? res.data : res.data.data;
      setMovies(list);
    } catch {
      /* ignore */
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load messages', color: 'red' });
    }
  };

  const sendMessage = async () => {
    if (!content.trim()) return;
    try {
      await api.post('/messages', { content, movieId: movieId || undefined });
      setContent('');
      setMovieId(null);
      fetchMessages();
      notifications.show({ title: 'Sent!', message: 'Message sent to administrator', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to send message', color: 'red' });
    }
  };

  const sendReply = async () => {
    if (!replyTo || !replyContent.trim()) return;
    try {
      await api.post(`/messages/${replyTo.id}/reply`, { content: replyContent });
      setReplyContent('');
      setReplyOpen(false);
      setReplyTo(null);
      fetchMessages();
      notifications.show({ title: 'Replied', message: 'Reply sent', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to send reply', color: 'red' });
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${id}`);
      fetchMessages();
      notifications.show({ title: 'Deleted', message: 'Message removed', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <Container size="lg" py="xl">
      <Title>Messages</Title>

      {!isAdmin && (
        <Paper p="md" withBorder mt="md">
          <Select
            label="Related film (optional)"
            placeholder="Select a film"
            data={movies.map((m) => ({ value: m.id, label: m.title }))}
            value={movieId}
            onChange={setMovieId}
            clearable
            searchable
            mb="sm"
          />
          <Textarea
            label="Your message"
            placeholder="Write your message to the administrator..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minRows={3}
            required
          />
          <Button mt="sm" onClick={sendMessage} disabled={!content.trim()}>Send to Admin</Button>
        </Paper>
      )}

      <Title order={3} mt="xl">Message History</Title>
      <ScrollArea mt="md">
        <Table striped miw={700}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>Film</Table.Th>
              <Table.Th>Content</Table.Th>
              <Table.Th>Date</Table.Th>
              {isAdmin && <Table.Th>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {messages.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{m.from}</Table.Td>
                <Table.Td>{m.to}</Table.Td>
                <Table.Td>{m.movie?.title || '-'}</Table.Td>
                <Table.Td>{m.content}</Table.Td>
                <Table.Td>{new Date(m.createdAt).toLocaleDateString()}</Table.Td>
                {isAdmin && (
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" onClick={() => { setReplyTo(m); setReplyOpen(true); }}><IconMessageReply size={16} /></ActionIcon>
                      <ActionIcon color="red" onClick={() => deleteMessage(m.id)}><IconTrash size={16} /></ActionIcon>
                      {!m.isRead && <Badge size="xs" color="blue">New</Badge>}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
            {messages.length === 0 && (
              <Table.Tr><Table.Td colSpan={isAdmin ? 6 : 5}><Text c="dimmed">No messages yet.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Modal opened={replyOpen} onClose={() => setReplyOpen(false)} title={`Reply to ${replyTo?.from}`}>
        <Textarea placeholder="Your reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} minRows={4} />
        <Button fullWidth mt="md" onClick={sendReply} disabled={!replyContent.trim()}>Send Reply</Button>
      </Modal>
    </Container>
  );
}
