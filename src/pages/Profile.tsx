import { useState } from 'react';
import { Container, Title, Paper, TextInput, Button, Avatar, Group, FileInput, Text } from '@mantine/core';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import { notifications } from '@mantine/notifications';

const MAX_SIZE = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const avatarSrc = useAvatarUrl(user);

  const handleUpload = async () => {
    if (!avatar) return;
    if (!ALLOWED_TYPES.includes(avatar.type)) {
      notifications.show({ title: 'Invalid file', message: 'Please upload JPEG, PNG, WebP or GIF', color: 'red' });
      return;
    }
    if (avatar.size > MAX_SIZE) {
      notifications.show({ title: 'File too large', message: `Maximum size is ${MAX_SIZE / 1024 / 1024}MB`, color: 'red' });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', avatar);
    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: res.data.avatar, avatarUrl: res.data.avatarUrl });
      notifications.show({ title: 'Success', message: 'Avatar uploaded successfully', color: 'green' });
      setAvatar(null);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to upload avatar', color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title>Profile</Title>
      <Paper p="xl" mt="md" withBorder>
        <Group>
          <Avatar size={120} src={avatarSrc} radius="md" />
          <div>
            <TextInput label="Username" value={user?.username || ''} readOnly />
            <TextInput label="Email" value={user?.email || ''} mt="md" readOnly />
            <Text size="sm" c="dimmed" mt="xs">Role: {user?.role}</Text>
          </div>
        </Group>
        <FileInput label="Upload Profile Photo" placeholder="Choose image (max 5MB)" onChange={setAvatar} accept="image/*" mt="md" />
        <Button mt="md" onClick={handleUpload} loading={uploading} disabled={!avatar}>Upload Avatar</Button>
      </Paper>
    </Container>
  );
}
