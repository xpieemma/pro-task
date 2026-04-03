// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const { login, loginAsGuest } = useAuth();    
//   const [guestSubmitting, setGuestSubmitting] = useState(false);


// const navigate = useNavigate();
// const handleGuest = async () => {
//   setGuestSubmitting(true);
//   try {
//     await loginAsGuest();
//     navigate('/dashboard'); 
//   } catch (err) {
//     toast.error('Guest login failed');
//   } finally {
//     setGuestSubmitting(false);
//   }
// };

  

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     if (!email || !password) {
//       toast.error('Please fill in all fields');
//       setSubmitting(false);
//       return;
//     }
//     try {
//       await login(email, password);
//       navigate('/dashboard');
//     }catch (err) {
//   console.error('Login error:', err);
//   const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
//   toast.error(message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
//       <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back</h2>
//         <form onSubmit={handleSubmit}>

//           <input
//             type="email" autoComplete="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
//             required
//           />
//           <input
//             type="password" autoComplete="current-password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400"
//             required
//           />
//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition disabled:opacity-60"
//           >
//             {submitting ? 'Signing in...' : 'Sign In'}
//           </button>
//            <div className="text-right mb-6">
//   <Link to="/forgot-password" className="text-sm text-gray-500 hover:underline">
//     Forgot password?
//   </Link>
// </div>
//         </form>
//         <div className="mt-6 text-center">
//   <Link to="/showcase" className="text-gray-500 text-sm hover:underline">
//     ✨ Explore API Showcase (no login required)
//   </Link>
// </div>
//         <div className="mt-6">
//   <div className="relative flex py-4 items-center">
//     <div className="flex-grow border-t border-gray-300"></div>
//     <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
//     <div className="flex-grow border-t border-gray-300"></div>
//   </div>
//   <button 
//     type="button"
//     onClick={handleGuest}
//     disabled={submitting || guestSubmitting}
//     className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
//   >
//     {guestSubmitting ? 'Loading...' : 'Continue as Guest'}
//   </button>
// </div>
//         <p className="mt-4 text-center text-gray-600">
//           Don&apos;t have an account?{' '}
//           <Link to="/register" className="text-gray-800 font-semibold hover:underline">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  
  const { login, loginAsGuest } = useAuth();    

  const handleGuest = async () => {
    setGuestSubmitting(true);
    try {
      // ✅ FIX 1 & 2: Context handles the navigation and error toasts
      await loginAsGuest();
    } catch (err) {
      console.error('Guest login error:', err);
    } finally {
      setGuestSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ✅ FIX 1 & 2: Context handles the navigation and error toasts
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome back</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email" 
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          
          <div className="relative mb-6">
            <input
              type="password" 
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
            {/* ✅ FIX 3: Moved Forgot Password closer to the password field */}
            <div className="text-right mt-1.5">
              <Link to="/forgot-password" className="text-sm text-gray-500 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || guestSubmitting}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <button 
            type="button"
            onClick={handleGuest}
            disabled={submitting || guestSubmitting}
            className="w-full bg-gray-50 text-gray-800 py-3 rounded-lg hover:bg-gray-100 transition font-medium border border-gray-200 flex items-center justify-center gap-2"
          >
            {guestSubmitting ? (
              <span className="animate-pulse">Loading Guest Account...</span>
            ) : (
              'Continue as Guest'
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-gray-800 font-semibold hover:underline">
            Register
          </Link>
        </p>
        
        {/* API Showcase link clearly separated at the bottom */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link to="/showcase" className="text-blue-600 font-medium text-sm hover:underline">
            ✨ Explore API Showcase (no login required)
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Login;