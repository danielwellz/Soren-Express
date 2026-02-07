import { Button, Stack, Typography } from '@mui/material';
import React from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      justifyContent="center"
      className="surface-glass fade-in-up"
      sx={{
        minHeight: 260,
        textAlign: 'center',
        p: 4,
        borderRadius: 3,
        border: '1px dashed #a8b8cd',
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
