import { Title, Text, Group, ThemeIcon } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number | string }>;
}

export default function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <Group mb="xl" align="flex-start">
      {Icon && (
        <ThemeIcon size={48} radius="md" variant="light" color="cinema">
          <Icon size={28} />
        </ThemeIcon>
      )}
      <div>
        <Title order={1}>{title}</Title>
        {description && <Text c="dimmed" mt={4}>{description}</Text>}
      </div>
    </Group>
  );
}
