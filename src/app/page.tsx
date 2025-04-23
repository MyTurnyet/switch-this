import React from 'react';
import { FeatureCard } from './components/FeatureCard';
import { theme } from './theme';

const features = [
  {
    title: 'Switchlist Management',
    description: 'Create, edit, and organize your switchlists with an intuitive interface.'
  },
  {
    title: 'Rolling Stock Tracking',
    description: 'Keep detailed records of your locomotives and cars with ease.'
  },
  {
    title: 'Operations Planning',
    description: 'Plan and optimize your railroad operations efficiently.'
  }
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 100%)`,
        padding: theme.spacing.xl
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            marginBottom: theme.spacing.xl,
            textAlign: 'center',
            padding: theme.spacing.xl
          }}
        >
          <h1
            style={{
              background: theme.colors.text.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '3rem',
              fontWeight: '800',
              marginBottom: theme.spacing.md,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Model Railroad Switchlist Generator
          </h1>
          <p
            style={{
              color: theme.colors.text.secondary,
              fontSize: '1.5rem',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            Generate and manage switchlists for your model railroad with ease. Keep track of your rolling stock and optimize your operations.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: theme.spacing.xl,
            padding: theme.spacing.lg
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
