import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, loginAsGuest } = useAuth();
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };
  const handleGuest = async () => {
    setGuestSubmitting(true);
    try {
      await loginAsGuest();
      navigate('/dashboard');
    } catch (err) {
      console.error('Guest login error:', err);
      toast.error('Guest login failed');
    } finally {
      setGuestSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-800 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>

      <div className="mt-6 border-t pt-6">
      <button 
        type="button"
        onClick={handleGuest}
        disabled={guestSubmitting}
        className="w-full py-2 text-gray-500 hover:text-gray-800 transition text-sm"
      >
        Don't want an account? <span className="font-bold underline">Try Guest Mode</span>
      </button>
    </div>
    </div>

    
  );
};

export default Register;
