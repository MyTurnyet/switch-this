import Link from 'next/link';

const Header = () => {
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
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link 
              href="/layout-state" 
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Layout State
            </Link>
            <Link 
              href="/industries" 
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Industries
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 