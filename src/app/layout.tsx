import './globals.css';
import { Inter } from 'next/font/google';
import { LayoutProvider } from './shared/contexts/LayoutContext';
import Header from '@/shared/components/Header';

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
          <Header />
          <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {children}
          </main>
        </LayoutProvider>
      </body>
    </html>
  );
}
