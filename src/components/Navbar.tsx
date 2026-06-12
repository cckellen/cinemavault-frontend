import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Group, Button, Avatar, Menu, Burger, Drawer, Stack, Text, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMovie, IconLogout } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useAvatarUrl } from '../hooks/useAvatarUrl';

const navItems = [
  { to: '/movies', label: 'Movies' },
  { to: '/favorites', label: 'Favourites', auth: true },
  { to: '/watchlist', label: 'Watchlist', auth: true },
  { to: '/messages', label: 'Messages', auth: true },
  { to: '/admin/movies', label: 'Admin', auth: true, admin: true },
  { to: '/profile', label: 'Profile', auth: true },
] as const;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);
  const avatarSrc = useAvatarUrl(user);

  const handleLogout = () => {
    logout();
    navigate('/login');
    close();
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderLink = (to: string, label: string) => (
    <Button
      key={to}
      variant={isActive(to) ? 'light' : 'subtle'}
      color={isActive(to) ? 'cinema' : 'gray'}
      component={Link}
      to={to}
      onClick={close}
      className={isActive(to) ? 'cv-nav-link' : undefined}
    >
      {label}
    </Button>
  );

  const visibleItems = navItems.filter((item) => {
    if (!('auth' in item)) return true;
    if (!user) return false;
    if ('admin' in item && item.admin) return user.role === 'ADMIN';
    return true;
  });

  return (
    <header style={{ borderBottom: '1px solid #373a40', background: '#141517', position: 'sticky', top: 0, zIndex: 100 }}>
      <Container size="xl" py="sm">
        <Group justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="cinema" />
            <Link to="/movies" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="xs">
                <IconMovie size={28} color="#ffd147" />
                <Text fw={700} size="xl" c="cinema.4">CinemaVault</Text>
              </Group>
            </Link>
          </Group>

          <Group visibleFrom="sm">
            {user ? visibleItems.map((item) => renderLink(item.to, item.label)) : (
              <>
                <Button component={Link} to="/login" variant="subtle">Login</Button>
                <Button component={Link} to="/register" color="cinema">Register</Button>
              </>
            )}
            {user && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Avatar src={avatarSrc} radius="xl" style={{ cursor: 'pointer' }} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.username || user.email}</Menu.Label>
                  <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogout}>Logout</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          <Drawer opened={opened} onClose={close} title="Menu" hiddenFrom="sm" position="right">
            <Stack>
              {user ? (
                <>
                  {visibleItems.map((item) => renderLink(item.to, item.label))}
                  <Button color="red" variant="light" leftSection={<IconLogout size={16} />} onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" onClick={close}>Login</Button>
                  <Button component={Link} to="/register" color="cinema" onClick={close}>Register</Button>
                </>
              )}
            </Stack>
          </Drawer>
        </Group>
      </Container>
    </header>
  );
}
