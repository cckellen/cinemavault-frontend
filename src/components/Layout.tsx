import { Container, Group, Text, Anchor, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { API_BASE } from '../services/api';

const docsUrl = API_BASE.replace(/\/api\/?$/, '/api-docs');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap={0} mih="100vh">
      <div style={{ flex: 1 }}>{children}</div>
      <footer className="cv-footer">
        <Container size="xl" py="md">
          <Group justify="space-between" wrap="wrap">
            <Text size="sm" c="dimmed">CinemaVault — 6003CEM Web API Development Portfolio</Text>
            <Group gap="md">
              <Anchor component={Link} to="/movies" size="sm" c="dimmed">Movies</Anchor>
              <Anchor href={docsUrl} target="_blank" size="sm" c="dimmed">API Docs</Anchor>
            </Group>
          </Group>
        </Container>
      </footer>
    </Stack>
  );
}
