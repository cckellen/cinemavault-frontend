import { useState } from 'react';
import { TextInput, PasswordInput, Button, Container, Title, Paper, Alert } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { notifications } from '@mantine/notifications';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password || form.password.length < 6) {
      setError('Email and password (min 6 chars) are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      notifications.show({ title: 'Welcome!', message: 'Account created successfully', color: 'green' });
      navigate('/movies');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Register to CinemaVault</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && <Alert color="red" mb="md">{error}</Alert>}
        <TextInput label="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <TextInput label="Email" mt="md" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <PasswordInput label="Password" mt="md" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button fullWidth mt="xl" loading={loading} onClick={handleSubmit}>Register</Button>
        <Button variant="subtle" fullWidth mt="sm" onClick={() => navigate('/login')}>Already have an account? Login</Button>
      </Paper>
    </Container>
  );
}
