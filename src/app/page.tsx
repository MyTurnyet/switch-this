import React from 'react';
import { FeatureCard } from './components/FeatureCard';

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
    <main>
      <div>
        <div>
          <h1>
            Model Railroad Switchlist Generator
          </h1>
          <p>
            Generate and manage switchlists for your model railroad with ease. Keep track of your rolling stock and optimize your operations.
          </p>
        </div>

        <div>
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
