import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Container, Text, Button, Loader, Center } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import AdminMovies from './pages/AdminMovies';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <Center py="xl"><Loader color="cinema" /></Center>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/movies" />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Center py="xl"><Loader color="cinema" /></Center>;
  if (user) return <Navigate to="/movies" />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <Container py="xl" ta="center">
      <Text size="xl" fw={700}>404 — Page Not Found</Text>
      <Text c="dimmed" mt="sm">The page you are looking for does not exist.</Text>
      <Button component={Link} to="/movies" color="cinema" mt="md">Back to Movies</Button>
    </Container>
  );
}

export default function App() {
  return (
    <>
      <Notifications position="top-right" />
      <Router>
        <AuthProvider>
          <Layout>
            <Navbar />
            <Routes>
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/admin/movies" element={<ProtectedRoute adminOnly><AdminMovies /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/movies" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </Router>
    </>
  );
}
