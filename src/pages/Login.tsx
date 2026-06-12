import { useState } from 'react';
import { TextInput, PasswordInput, Button, Container, Title, Paper, Alert } from '@mantine/core';
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
    <Container size={420} my={40}>
      <Title ta="center">Login to CinemaVault</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && <Alert color="red" mb="md">{error}</Alert>}
        <TextInput label="Email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PasswordInput label="Password" placeholder="Your password" mt="md" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button fullWidth mt="xl" onClick={handleLogin} loading={loading}>Login</Button>
        <Button variant="subtle" fullWidth mt="md" onClick={() => navigate('/register')}>Register</Button>
      </Paper>
    </Container>
  );
}
