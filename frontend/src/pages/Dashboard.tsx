import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Socket listeners in a separate effect so fetchProjects is stable
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleProjectCreated = (project: Project) => {
      // Only add if we don't already have it (avoid duplicate from optimistic update)
      setProjects((prev) =>
        prev.some((p) => p._id === project._id) ? prev : [project, ...prev]
      );
    };
    const handleProjectUpdated = (updated: Project) => {
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    };
    // Socket handles removal — no local delete needed alongside it
    const handleProjectDeleted = ({ id }: { id: string }) => {
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    };

    socket.on('project-created', handleProjectCreated);
    socket.on('project-updated', handleProjectUpdated);
    socket.on('project-deleted', handleProjectDeleted);

    return () => {
      socket.off('project-created', handleProjectCreated);
      socket.off('project-updated', handleProjectUpdated);
      socket.off('project-deleted', handleProjectDeleted);
    };
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      // Server emits 'project-created' via socket, which adds it to state
      await api.post('/projects', { name: name.trim(), description });
      setName('');
      setDescription('');
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      // Server emits 'project-deleted' via socket, which removes it from state
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.name}</h1>
        <button
          onClick={logout}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
        >
          Logout
        </button> 
        <Link to="/showcase" className="bg-gray-100 px-3 py-1 rounded-lg text-sm hover:bg-gray-200">
  ✦ Showcase
</Link>
      </div>

      <form onSubmit={createProject} className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">New Project</h2>
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          rows={2}
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500 mt-16">
          No projects yet. Create one above to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onDelete={deleteProject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
