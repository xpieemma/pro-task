import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { User } from '../types';




interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  navigate: (path: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleAuthSuccess = (data:any, message: string) =>{
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    connectSocket(data.token);
    toast.success(message);
    navigate('/dashboard');
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        connectSocket(token);
      } catch  {
        logout();
        
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
  try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      connectSocket(data.token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Login failed');
  }
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    connectSocket(data.token);
    toast.success('Account created');
    navigate('/dashboard');
  };
  const loginAsGuest = async () => {
  try {
    const { data } = await api.post('/auth/login', { email: 'demo@example.com', password: 'demodemo' });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    connectSocket(data.token);
    toast.success('Logged in as guest');
    navigate('/dashboard');
  } catch (err) {
    console.error('Guest login failed', err);
  } finally {
    setLoading(false);
  }
};

const loginAsDemo = async () => {
    const { data } = await api.post('/auth/login', { email: 'demo@example.com', password: 'demodemo' });
   handleAuthSuccess(data, 'Launching Live Demo...');
  
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    disconnectSocket();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, loginAsDemo, navigate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
