import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

interface CarTypeBadgeProps {
  type: string;
  count: number;
}

export default function CarTypeBadge({ type, count }: CarTypeBadgeProps) {
  return (
    <Tooltip title={`${type}: ${count} cars`}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          mr: 1,
          mb: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'medium', mr: 0.5 }}>
          {type}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {count}
        </Typography>
      </Box>
    </Tooltip>
  );
} 