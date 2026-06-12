import { useState } from 'react';
import { Container, Paper, TextInput, Button, Avatar, Group, FileInput, Badge, Stack } from '@mantine/core';
import { IconUser, IconDeviceFloppy } from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import { notifications } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';

const MAX_SIZE = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarSrc = useAvatarUrl(user);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile', { username });
      updateUser({ username: res.data.username });
      notifications.show({ title: 'Saved', message: 'Profile updated successfully', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to update profile', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

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
      <PageHeader title="My Profile" description="Manage your account details and profile photo." icon={IconUser} />
      <Paper p="xl" withBorder>
        <Group align="flex-start" wrap="wrap">
          <Avatar size={120} src={avatarSrc} radius="md" />
          <Stack gap="xs" style={{ flex: 1, minWidth: 200 }}>
            <TextInput label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextInput label="Email" value={user?.email || ''} readOnly />
            <Badge color={user?.role === 'ADMIN' ? 'cinema' : 'gray'} variant="light">Role: {user?.role}</Badge>
            <Button color="cinema" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSaveProfile} loading={saving} w="fit-content">
              Save Changes
            </Button>
          </Stack>
        </Group>
        <FileInput label="Upload Profile Photo" placeholder="Choose image (max 5MB)" onChange={setAvatar} accept="image/*" mt="xl" />
        <Button mt="md" color="cinema" onClick={handleUpload} loading={uploading} disabled={!avatar}>Upload Avatar</Button>
      </Paper>
    </Container>
  );
}
