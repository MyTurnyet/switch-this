import { Inter } from 'next/font/google';
import { LayoutProvider } from './shared/contexts/LayoutContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Switchlist Generator',
  description: 'Generate and manage switchlists for your model railroad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body className={inter.className}>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
