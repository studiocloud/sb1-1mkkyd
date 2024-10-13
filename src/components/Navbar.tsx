import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, Package, ShoppingCart, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <nav className="bg-blue-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">IMS</Link>
        {user ? (
          <div className="space-x-4">
            <Link 
              to="/" 
              className={`text-white hover:text-blue-200 ${isActive('/') ? 'font-bold' : ''}`}
            >
              <BarChart2 className="inline-block mr-1" size={18} />
              Dashboard
            </Link>
            <Link 
              to="/inventory" 
              className={`text-white hover:text-blue-200 ${isActive('/inventory') ? 'font-bold' : ''}`}
            >
              <Package className="inline-block mr-1" size={18} />
              Inventory
            </Link>
            <Link 
              to="/sales" 
              className={`text-white hover:text-blue-200 ${isActive('/sales') ? 'font-bold' : ''}`}
            >
              <ShoppingCart className="inline-block mr-1" size={18} />
              Sales
            </Link>
            <button 
              onClick={handleSignOut} 
              className="text-white hover:text-blue-200"
            >
              <LogOut className="inline-block mr-1" size={18} />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link 
              to="/login" 
              className={`text-white hover:text-blue-200 ${isActive('/login') ? 'font-bold' : ''}`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={`text-white hover:text-blue-200 ${isActive('/register') ? 'font-bold' : ''}`}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;