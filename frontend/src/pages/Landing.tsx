// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useState } from 'react';
// import toast from 'react-hot-toast';

// const Landing = () => {
//   const { loginAsDemo } = useAuth();
//   const navigate = useNavigate();
//   const [isLaunching, setIsLaunching] = useState(false);

//   const handleDemoLogin = async () => {
//     try {
//       setIsLaunching(true);
//       await loginAsDemo();
//       navigate('/dashboard');
//     } catch (err) {
//      toast.error('Demo is busy');
//     } finally {
//       setIsLaunching(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       {/* Hero */}
//       <div className="max-w-6xl mx-auto px-4 py-16 text-center">
//         <h1 className="text-5xl font-bold text-gray-800 mb-4">
//           Pro‑Tasker
//         </h1>
//         <p className="text-xl text-gray-600 mb-8">
//           Real‑time project management with Kanban, calendar, and live collaboration.
//         </p>
//         <div className="flex justify-center gap-4">
//           <Link
//             to="/login"
//             className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
//           >
//             Log In
//           </Link>
//           <Link
//             to="/register"
//             className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//           >
//             Sign Up
//           </Link>
//           <button
//             onClick={handleDemoLogin}
//         disabled={isLaunching}
//         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
//       >
//         {isLaunching ? 'Launching...' : 'Try Demo'}
//           </button>
//         </div>
//       </div>

//       {/* Features */}
//       <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
//         <div className="text-center">
//           <div className="text-4xl mb-3">📋</div>
//           <h3 className="text-xl font-semibold mb-2">Kanban Board</h3>
//           <p className="text-gray-600">Drag tasks between To Do, In Progress, and Done.</p>
//         </div>
//         <div className="text-center">
//           <div className="text-4xl mb-3">📅</div>
//           <h3 className="text-xl font-semibold mb-2">Calendar View</h3>
//           <p className="text-gray-600">See all tasks by due date; drag to reschedule.</p>
//         </div>
//         <div className="text-center">
//           <div className="text-4xl mb-3">⚡</div>
//           <h3 className="text-xl font-semibold mb-2">Real‑time Sync</h3>
//           <p className="text-gray-600">Changes appear instantly for all collaborators.</p>
//         </div>
//       </div>

//       <div>
//       {/* ✅ Your new button */}
//       <Link to="/showcase">
//         <button>View Showcase</button>
//       </Link>
//     </div>
//     </div>
//   );
// };

// export default Landing;


import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

  const FEATURES = [
  {
    emoji: '📋',
    title: 'Kanban Board',
    desc: 'Drag tasks between To Do, In Progress, and Done with fluid animations.',
  },
  {
    emoji: '📅',
    title: 'Calendar View',
    desc: 'See all tasks by due date; drag and drop to instantly reschedule your week.',
  },
  {
    emoji: '⚡',
    title: 'Real-time Sync',
    desc: 'Powered by WebSockets. Changes appear instantly for all collaborators.',
  },
];

const Landing = () => {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleDemoLogin = async () => {
    try {
      setIsLaunching(true);
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      const message = err instanceof Error ? err.message: 'Failed to launch Demo';
      toast.error(message);
    } finally {
      setIsLaunching(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col font-sans">
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center flex-grow flex flex-col justify-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Pro-Tasker
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Real-time project management with Kanban, intelligent calendars, and live collaboration.
        </p>
        
        {/* Primary Call to Actions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/login"
            className="px-8 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 bg-white text-slate-700 font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
          >
            Sign Up
          </Link>
          <button
            onClick={handleDemoLogin}
            disabled={isLaunching}
            className="px-8 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLaunching ? (
              <>
                <span className="animate-spin text-xl">⏳</span> Launching...
              </>
            ) : (
              'Try Demo'
            )}
          </button>
        </div>

        {/* Secondary Action (Showcase) */}
        <div className="flex justify-center">
           <Link 
             to="/showcase"
             className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1"
           >
             ✨ View Component Showcase
           </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => ( 
            <div key={idx}  className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
<div className="text-4xl mb-4" aria-hidden="true">{feature.emoji}</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
        <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
      </div>  ))}
          
        </div>
      </div>
      <footer className="text-center text-sm text-slate-400 py-6 border-t mt-auto">
        © {new Date().getFullYear()} Pro-Tasker — Demo for educational purposes
      </footer>
    </div>
  );
};

export default Landing;