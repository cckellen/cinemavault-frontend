import { useState } from 'react';
import { TextInput, PasswordInput, Button, Container, Title, Paper, Alert, Text, Stack } from '@mantine/core';
import { IconLogin, IconMovie } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      notifications.show({ title: 'Welcome back!', message: 'Login successful', color: 'green' });
      navigate('/movies');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-auth-bg">
      <Container size={420} py="xl">
        <Stack align="center" mb="lg">
          <IconMovie size={48} color="#ffd147" />
          <Title order={2} ta="center">Welcome to CinemaVault</Title>
          <Text c="dimmed" ta="center" size="sm">Sign in to explore films, save favourites and manage your watchlist.</Text>
        </Stack>
        <Paper withBorder shadow="md" p={30} radius="md">
          {error && <Alert color="red" mb="md">{error}</Alert>}
          <TextInput label="Email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordInput label="Password" placeholder="Your password" mt="md" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button fullWidth mt="xl" color="cinema" leftSection={<IconLogin size={18} />} onClick={handleLogin} loading={loading}>Login</Button>
          <Button variant="subtle" fullWidth mt="md" onClick={() => navigate('/register')}>Create an account</Button>
        </Paper>
      </Container>
    </div>
  );
}
