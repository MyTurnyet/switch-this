'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const Header = () => {
  const pathname = usePathname();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLinkClass = (path: string) => {
    const baseClass = "font-medium transition-colors";
    return pathname === path 
      ? `${baseClass} text-primary-600` 
      : `${baseClass} text-gray-600 hover:text-primary-600`;
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              href="/switchlists" 
              className={getLinkClass('/switchlists')}
            >
              Switchlists
            </Link>
            
            {/* Admin dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={`${getLinkClass('/admin')} flex items-center`}
                aria-expanded={adminMenuOpen}
                aria-haspopup="true"
              >
                Admin
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`ml-1 h-4 w-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link 
                    href="/industries" 
                    className={`block px-4 py-2 text-sm ${getLinkClass('/industries').replace('text-primary-600', 'text-primary-600 bg-gray-100').replace('text-gray-600', 'text-gray-700')}`}
                  >
                    Industries
                  </Link>
                  <Link 
                    href="/locations" 
                    className={`block px-4 py-2 text-sm ${getLinkClass('/locations').replace('text-primary-600', 'text-primary-600 bg-gray-100').replace('text-gray-600', 'text-gray-700')}`}
                  >
                    Locations
                  </Link>
                  <Link 
                    href="/rolling-stock" 
                    className={`block px-4 py-2 text-sm ${getLinkClass('/rolling-stock').replace('text-primary-600', 'text-primary-600 bg-gray-100').replace('text-gray-600', 'text-gray-700')}`}
                  >
                    Rolling Stock
                  </Link>
                  <Link 
                    href="/train-routes" 
                    className={`block px-4 py-2 text-sm ${getLinkClass('/train-routes').replace('text-primary-600', 'text-primary-600 bg-gray-100').replace('text-gray-600', 'text-gray-700')}`}
                  >
                    Train Routes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 