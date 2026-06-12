import { Text, Button, Stack, ThemeIcon } from '@mantine/core';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number | string }>;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="cv-empty-state">
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" variant="light" color="cinema">
          <Icon size={36} />
        </ThemeIcon>
        <Text fw={600} size="lg">{title}</Text>
        <Text size="sm" maw={400}>{description}</Text>
        {actionLabel && actionTo && (
          <Button component={Link} to={actionTo} color="cinema">{actionLabel}</Button>
        )}
      </Stack>
    </div>
  );
}
