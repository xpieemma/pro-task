import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  title?: string;
}

const PublicLayout = ({ children, title }: Props) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/showcase" className="text-gray-800 font-semibold text-lg">
                ✨ API Showcase
              </Link>
              <Link to="/showcase" className="text-gray-600 hover:text-gray-800 text-sm">
                Home
              </Link>
            </div>
            <div>
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900"
                >
                  Open App
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;