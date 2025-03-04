
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const HeaderSection = () => {
  const { user } = useAuth();

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Adspirer</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-blue-400 transition-colors">About</Link>
          <Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
          {user ? (
            <Link to="/app">
              <Button variant="default">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="ghost" className="hover:text-blue-400 transition-colors">Login</Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="default">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
