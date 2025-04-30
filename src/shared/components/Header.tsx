'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const baseClass = "font-medium transition-colors";
    return pathname === path 
      ? `${baseClass} text-primary-600` 
      : `${baseClass} text-gray-600 hover:text-primary-600`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Switch This
          </Link>
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className={getLinkClass('/')}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className={getLinkClass('/about')}
            >
              About
            </Link>
            <Link 
              href="/layout-state" 
              className={getLinkClass('/layout-state')}
            >
              Layout State
            </Link>
            <Link 
              href="/industries" 
              className={getLinkClass('/industries')}
            >
              Industries
            </Link>
            <Link 
              href="/rolling-stock" 
              className={getLinkClass('/rolling-stock')}
            >
              Rolling Stock
            </Link>
            <Link 
              href="/train-routes" 
              className={getLinkClass('/train-routes')}
            >
              Train Routes
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 