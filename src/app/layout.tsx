import './globals.css';
import { Inter } from 'next/font/google';
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
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
