import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { login } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await login('demo@example.com', 'demodemo');
    } catch (err) {
      console.error('Demo login failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Pro‑Tasker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Real‑time project management with Kanban, calendar, and live collaboration.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Sign Up
          </Link>
          <button
            onClick={handleDemoLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Demo
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-xl font-semibold mb-2">Kanban Board</h3>
          <p className="text-gray-600">Drag tasks between To Do, In Progress, and Done.</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-xl font-semibold mb-2">Calendar View</h3>
          <p className="text-gray-600">See all tasks by due date; drag to reschedule.</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Real‑time Sync</h3>
          <p className="text-gray-600">Changes appear instantly for all collaborators.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;