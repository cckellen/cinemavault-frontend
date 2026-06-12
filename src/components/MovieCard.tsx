import { Card, Image, Badge, Text, Button, Group, Stack } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconEye } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  isFavourite?: boolean;
  onToggleFavourite?: (id: string) => void;
  onWatchlist?: (id: string) => void;
  onRemove?: (id: string) => void;
  watchlistLabel?: string;
  showActions?: boolean;
}

export default function MovieCard({ movie, isFavourite, onToggleFavourite, onWatchlist, onRemove, watchlistLabel = 'Watchlist', showActions }: MovieCardProps) {
  return (
    <Card className="cv-movie-card" padding="lg" h="100%">
      <Card.Section>
        <Image
          src={movie.poster || 'https://via.placeholder.com/300x400?text=No+Poster'}
          h={300}
          alt={movie.title}
          fallbackSrc="https://via.placeholder.com/300x400?text=No+Poster"
        />
      </Card.Section>
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={600} lineClamp={1}>{movie.title}</Text>
        {movie.rating != null && <Badge color="cinema" variant="filled">★ {movie.rating}</Badge>}
      </Group>
      <Text size="sm" c="dimmed">{movie.genre}{movie.year ? ` · ${movie.year}` : ''}</Text>
      {movie.plot && <Text size="xs" c="dimmed" lineClamp={2} mt="xs">{movie.plot}</Text>}
      <Stack gap="xs" mt="md">
        <Button component={Link} to={`/movies/${movie.id}`} variant="light" color="cinema" leftSection={<IconEye size={16} />} fullWidth>
          View Details
        </Button>
        {showActions && (onToggleFavourite || onWatchlist || onRemove) && (
          <Group grow>
            {onToggleFavourite && (
              <Button
                variant={isFavourite ? 'filled' : 'subtle'}
                color={isFavourite ? 'red' : 'gray'}
                leftSection={isFavourite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                onClick={() => onToggleFavourite(movie.id)}
              >
                {isFavourite ? 'Saved' : 'Save'}
              </Button>
            )}
            {onWatchlist && (
              <Button variant="light" color="cinema" onClick={() => onWatchlist(movie.id)}>{watchlistLabel}</Button>
            )}
            {onRemove && (
              <Button variant="subtle" color="red" onClick={() => onRemove(movie.id)}>Remove</Button>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}
