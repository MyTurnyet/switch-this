'use client';

import React from 'react';
import { theme } from '../theme';

interface FeatureCardProps {
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => (
  <div
    data-testid="feature-card"
    style={{
      background: theme.colors.background.gradient,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.background.tertiary}`,
      transition: 'all 0.3s ease-in-out',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      const target = e.currentTarget;
      const titleElement = target.querySelector('h2');
      const descElement = target.querySelector('p');
      
      target.style.transform = 'translateY(-8px)';
      target.style.boxShadow = theme.shadows.lg;
      target.style.background = theme.colors.primary.gradient;
      
      if (titleElement) titleElement.style.color = theme.colors.primary.contrast;
      if (descElement) descElement.style.color = theme.colors.primary.contrast;
    }}
    onMouseLeave={(e) => {
      const target = e.currentTarget;
      const titleElement = target.querySelector('h2');
      const descElement = target.querySelector('p');
      
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = theme.shadows.md;
      target.style.background = theme.colors.background.gradient;
      
      if (titleElement) titleElement.style.color = theme.colors.primary.main;
      if (descElement) descElement.style.color = theme.colors.text.secondary;
    }}
  >
    <h2
      style={{
        color: theme.colors.primary.main,
        marginBottom: theme.spacing.md,
        fontSize: '1.5rem',
        fontWeight: '700',
        transition: 'color 0.3s ease-in-out'
      }}
    >
      {title}
    </h2>
    <p
      style={{
        color: theme.colors.text.secondary,
        fontSize: '1.125rem',
        lineHeight: '1.6',
        transition: 'color 0.3s ease-in-out'
      }}
    >
      {description}
    </p>
  </div>
); 