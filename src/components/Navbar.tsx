import { Link, useNavigate } from 'react-router-dom';
import { Group, Button, Avatar, Menu, Burger, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../contexts/AuthContext';
import { useAvatarUrl } from '../hooks/useAvatarUrl';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [opened, { toggle, close }] = useDisclosure(false);
  const avatarSrc = useAvatarUrl(user);

  const handleLogout = () => {
    logout();
    navigate('/login');
    close();
  };

  const navLinks = user ? (
    <>
      <Button variant="subtle" component={Link} to="/movies" onClick={close}>Movies</Button>
      <Button variant="subtle" component={Link} to="/favorites" onClick={close}>Favourites</Button>
      <Button variant="subtle" component={Link} to="/watchlist" onClick={close}>Watchlist</Button>
      <Button variant="subtle" component={Link} to="/messages" onClick={close}>Messages</Button>
      {user.role === 'ADMIN' && <Button variant="subtle" component={Link} to="/admin/movies" onClick={close}>Admin</Button>}
      <Button variant="subtle" component={Link} to="/profile" onClick={close}>Profile</Button>
    </>
  ) : (
    <>
      <Button component={Link} to="/login" onClick={close}>Login</Button>
      <Button component={Link} to="/register" variant="outline" onClick={close}>Register</Button>
    </>
  );

  return (
    <Group p="md" justify="space-between" style={{ borderBottom: '1px solid #eee' }}>
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Link to="/movies" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold', color: 'inherit' }}>
          CinemaVault
        </Link>
      </Group>

      <Group visibleFrom="sm">
        {navLinks}
        {user && (
          <Menu>
            <Menu.Target>
              <Avatar src={avatarSrc} radius="xl" style={{ cursor: 'pointer' }} />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user.username || user.email}</Menu.Label>
              <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Drawer opened={opened} onClose={close} title="Menu" hiddenFrom="sm" position="right">
        <Stack>
          {navLinks}
          {user && <Button color="red" variant="light" onClick={handleLogout}>Logout</Button>}
        </Stack>
      </Drawer>
    </Group>
  );
}
