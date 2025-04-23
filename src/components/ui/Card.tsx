import React from 'react';
import { theme } from '../../styles/theme';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  testId?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  hover = true,
  testId
}) => {
  return (
    <div
      data-testid={testId}
      className={clsx(
        theme.components.card,
        theme.spacing.card.x,
        theme.spacing.card.y,
        hover && theme.components.cardHover,
        className
      )}
    >
      {children}
    </div>
  );
}; 