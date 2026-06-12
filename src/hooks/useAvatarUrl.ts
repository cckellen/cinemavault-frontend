import { User } from '../types';
import { API_BASE } from '../services/api';

export function useAvatarUrl(user: User | null): string | undefined {
  const avatar = user?.avatar || user?.avatarUrl;
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  return `${API_BASE.replace('/api', '')}${avatar}`;
}
