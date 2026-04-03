// import { useParams } from 'react-router-dom';
// import { useEffect, useState, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import api from '../services/api';
// import { getSocket } from '../services/socket';
// import { Project, Task, User as UserType } from '../types';
// import KanbanBoard from '../components/KanbanBoard';
// import SearchFilter from '../components/SearchFilter';
// import ActivityFeed from '../components/ActivityFeed';
// import CalendarView from '../components/CalendarView';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { useMemo } from 'react';

// const ProjectDetail = () => {
//   const { id } = useParams<{ id: string }>();
//   const [project, setProject] = useState<Project | null>(null);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [inviteEmail, setInviteEmail] = useState('');
//   const [inviting, setInviting] = useState(false);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [activeView, setActiveView] = useState<'kanban' | 'calendar'>('kanban');
//   const [error, setError] = useState(false);



//   const fetchProject = useCallback(async () => {
//     try {
//       const { data } = await api.get(`/projects/${id}`);
//       setProject(data);
//     } catch {
//       toast.error('Failed to load project');
//       setError(true);
//     }
//   }, [id]);

//   const fetchTasks = useCallback(async () => {
//     try {
//       const { data } = await api.get(`/projects/${id}/tasks`);
//       setTasks(data);
//     } catch {
//       toast.error('Failed to load tasks');
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchProject();
//     fetchTasks();
//   }, [fetchProject, fetchTasks]);

//   // Socket: join room + real-time listeners — all in one effect so cleanup is atomic
//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     socket.emit('join-project', id);

//     const handleTaskCreated = (task: Task) => {
//       const projectId = typeof task.project === 'string' ? task.project : (task.project as {_id: string})._id;

//       if (projectId === id) {
//         setTasks((prev) =>
//           prev.some((t) => t._id === task._id) ? prev : [task, ...prev]
//         );
//       }
//     };
//     const handleTaskUpdated = (updated: Task) => {
//       setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
//     };
//     const handleTaskDeleted = ({ taskId, projectId }: { taskId: string; projectId: string | { _id: string } }) => {
//       const projectIdStr = typeof projectId === 'string' ? projectId : (projectId as { _id: string })._id;
//       if (projectIdStr === id) {
//         setTasks((prev) => prev.filter((t) => t._id !== taskId));
//       }
//     };
//     const handleCollaboratorAdded = ({ user }: { user: UserType }) => {
//       setProject((prev) => prev ? { ...prev, collaborators: [...prev.collaborators, user] } : prev);
//       toast.success(`${user.name} joined as collaborator`);
//       // fetchProject();
//     };

//     socket.on('task-created', handleTaskCreated);
//     socket.on('task-updated', handleTaskUpdated);
//     socket.on('task-deleted', handleTaskDeleted);
//     socket.on('collaborator-added', handleCollaboratorAdded);

//     return () => {
//       socket.emit('leave-project', id);
//       socket.off('task-created', handleTaskCreated);
//       socket.off('task-updated', handleTaskUpdated);
//       socket.off('task-deleted', handleTaskDeleted);
//       socket.off('collaborator-added', handleCollaboratorAdded);
//     };
//   }, [id]);

  
//   const addTask = async (taskData: Partial<Task>) => {
//     const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
//     const tempTask: Task = {
//       _id: tempId,
//       title: taskData.title ?? '',
//       description: taskData.description,
//       status: taskData.status ?? 'To Do',
//       dueDate: taskData.dueDate ?? null,
//       project: id!,
//     };
//     setTasks((prev) => [tempTask, ...prev]);
//     try {
//       const { data } = await api.post(`/projects/${id}/tasks`, taskData);
//       setTasks((prev) => prev.map((t) => (t._id === tempId ? data : t)));
//     } catch {
//       setTasks((prev) => prev.filter((t) => t._id !== tempId));
//       toast.error('Failed to create task');
//     }
//   };

//   // Optimistic update with rollback
//   const updateTask = async (taskId: string, updates: Partial<Task>) => {
//     const originalTasks = [...tasks];
//     setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t)));
//     try {
//       const { data } = await api.put(`/projects/${id}/tasks/${taskId}`, updates);
//       setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
//     } catch {
//       setTasks(originalTasks);
//       toast.error('Failed to update task');
//     }
//   };

//   // Optimistic delete with rollback
//   const deleteTask = async (taskId: string) => {
//     const originalTasks = [...tasks];
//     setTasks((prev) => prev.filter((t) => t._id !== taskId));
//     try {
//       await api.delete(`/projects/${id}/tasks/${taskId}`);
//     } catch {
//       setTasks(originalTasks);
//       toast.error('Failed to delete task');
//     }
//   };


//   const inviteCollaborator = async () => {
//     if (!inviteEmail.trim()) return;

//   const isAlreadyCollaborator = project?.collaborators.some(c => c.email === inviteEmail.trim()) ||
//   project?.owner.email === inviteEmail.trim();
// if (isAlreadyCollaborator) {
//   toast.error('User is already a collaborator');
//   return;
// }



//     setInviting(true);
//     try {
//       await api.post(`/projects/${id}/invite`, { email: inviteEmail.trim() });
//       setInviteEmail('');
//       toast.success('Invitation sent');
//     } catch {
//       toast.error('Failed to invite — check the email address');
//     } finally {
//       setInviting(false);
//     }
//   };


//   const filteredTasks = useMemo(() => tasks.filter((task) => {
//     const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
//     const matchesSearch =
//       task.title.toLowerCase().includes(search.toLowerCase()) ||
//       task.description?.toLowerCase().includes(search.toLowerCase());
//     return matchesStatus && matchesSearch;
//   }), [tasks, statusFilter, search]);

//   if (error) return <p role="alert">Failed to load project</p>;

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-800 mb-1">{project?.name}</h1>
//       {project?.description && (
//         <p className="text-gray-500 mb-6">{project.description}</p>
//       )}

//       {/* Collaborators & Invite */}
//       <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
//         <h3 className="font-semibold mb-2 text-gray-800">Collaborators</h3>
//         <div className="flex flex-wrap gap-2 mb-3">
//           <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
//             {project?.owner.name} (owner)
//           </span>
//           {project?.collaborators.map((c) => (
//             <span key={c._id} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
//               {c.name}
//             </span>
//           ))}
//         </div>
//         <div className="flex gap-2">
//           <input
//             type="email"
//             placeholder="Invite by email"
//             value={inviteEmail}
//             onChange={(e) => setInviteEmail(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && inviteCollaborator()}
//             className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
//           />
//           <button
//             onClick={inviteCollaborator}
//             disabled={inviting}
//             className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition disabled:opacity-60"
//           >
//             {inviting ? 'Inviting...' : 'Invite'}
//           </button>
//         </div>
//       </div>

//       {/* Add Task */}
//       <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Task</h2>
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             const form = e.target as HTMLFormElement;
//             const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
//             const description = (
//               form.elements.namedItem('description') as HTMLTextAreaElement
//             ).value.trim();
//             if (!title) return;
//             addTask({ title, description });
//             form.reset();
//           }}
//         >
//           <input
//             name="title"
//             placeholder="Task title"
//             className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
//             required
//           />
//           <textarea
//             name="description"
//             placeholder="Description (optional)"
//             className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
//             rows={2}
//           />
//           <button
//             type="submit"
//             className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
//           >
//             Create Task
//           </button>
//         </form>
//       </div>

//       {/* View Tabs */}
//       <div className="flex gap-0 mb-4 border-b border-gray-200">
//         <button
//           onClick={() => setActiveView('kanban')}
//           className={`px-5 py-2 text-sm font-medium border-b-2 transition ${
//             activeView === 'kanban'
//               ? 'border-gray-800 text-gray-800'
//               : 'border-transparent text-gray-500 hover:text-gray-700'
//           }`}
//         >
//           Kanban Board
//         </button>
//         <button
//           onClick={() => setActiveView('calendar')}
//           className={`px-5 py-2 text-sm font-medium border-b-2 transition ${
//             activeView === 'calendar'
//               ? 'border-gray-800 text-gray-800'
//               : 'border-transparent text-gray-500 hover:text-gray-700'
//           }`}
//         >
//           Calendar
//         </button>
//       </div>

//       {activeView === 'kanban' ? (
//         <>
//           <SearchFilter onSearch={setSearch} onFilterStatus={setStatusFilter} />
//           <KanbanBoard
//             tasks={filteredTasks}
//             onUpdate={updateTask}
//             onDelete={deleteTask}
//           />
//         </>
//       ) : (
//         <CalendarView
//           tasks={tasks}
//           projectId={id!}
//           onTaskUpdate={updateTask}
//           onTaskAdd={addTask}
//         />
//       )}

//       <ActivityFeed projectId={id!} />
//     </div>
//   );
// };

// export default ProjectDetail;


import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { Project, Task, User as UserType } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import SearchFilter from '../components/SearchFilter';
import ActivityFeed from '../components/ActivityFeed';
import CalendarView from '../components/CalendarView';
import LoadingSpinner from '../components/LoadingSpinner';
import { GoogleGenerativeAI } from '@google/generative-ai'; // ✅ Required for AI feature

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState<'kanban' | 'calendar'>('kanban');
  const [error, setError] = useState(false);

  // AI Feature State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error('Failed to load project');
      setError(true);
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}/tasks`);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [fetchProject, fetchTasks]);

  // ✅ FIX 2: Socket Reconnection Logic
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join room initially
    socket.emit('join-project', id);

    // Re-join room if socket reconnects after a drop
    const handleReconnect = () => socket.emit('join-project', id);
    socket.on('connect', handleReconnect);

    const handleTaskCreated = (task: Task) => {
      const projectId = typeof task.project === 'string' ? task.project : (task.project as { _id: string })._id;
      if (projectId === id) {
        setTasks((prev) => prev.some((t) => t._id === task._id) ? prev : [task, ...prev]);
      }
    };
    const handleTaskUpdated = (updated: Task) => {
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    };
    const handleTaskDeleted = ({ taskId, projectId }: { taskId: string; projectId: string | { _id: string } }) => {
      const projectIdStr = typeof projectId === 'string' ? projectId : (projectId as { _id: string })._id;
      if (projectIdStr === id) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }
    };
    const handleCollaboratorAdded = ({ user }: { user: UserType }) => {
      setProject((prev) => prev ? { ...prev, collaborators: [...prev.collaborators, user] } : prev);
      toast.success(`${user.name} joined as collaborator`);
    };

    socket.on('task-created', handleTaskCreated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-deleted', handleTaskDeleted);
    socket.on('collaborator-added', handleCollaboratorAdded);

    return () => {
      socket.emit('leave-project', id);
      socket.off('connect', handleReconnect);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-deleted', handleTaskDeleted);
      socket.off('collaborator-added', handleCollaboratorAdded);
    };
  }, [id]);

  const addTask = async (taskData: Partial<Task>) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tempTask: Task = {
      _id: tempId,
      title: taskData.title ?? '',
      description: taskData.description,
      status: taskData.status ?? 'To Do',
      dueDate: taskData.dueDate ?? null,
      project: id!,
    };
    
    setTasks((prev) => [tempTask, ...prev]);
    
    try {
      const { data } = await api.post(`/projects/${id}/tasks`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? data : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      toast.error('Failed to create task');
    }
  };

  // ✅ NEW FEATURE: AI Task Breakdown
  const generateAITasks = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      toast.error('Please add a Gemini API Key in the Story Weaver tool first to use AI features.');
      return;
    }
    if (!project?.description) {
      toast.error('Your project needs a description for the AI to analyze!');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" } // Forces strict JSON array
      });

      const prompt = `Analyze this project name: "${project.name}" and description: "${project.description}". 
      Break it down into 3 to 5 logical, actionable tasks. 
      Return a JSON array of objects. Each object must have a "title" string and a short "description" string.`;

      const result = await model.generateContent(prompt);
      const tasksArray = JSON.parse(result.response.text());

      if (!Array.isArray(tasksArray)) throw new Error('Invalid AI format');

      // Add each generated task
      for (const t of tasksArray) {
        await addTask({ title: t.title, description: t.description, status: 'To Do' });
      }
      toast.success('AI successfully generated tasks!');
      
    } catch (error) {
      console.error('AI Task Gen Error:', error);
      toast.error('AI failed to generate tasks. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ✅ FIX 1: Optimistic update with targeted functional rollback
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Find the exact task state BEFORE we update it, to use as our rollback payload
    let taskToRevert: Task | undefined;
    
    setTasks((prev) => {
      taskToRevert = prev.find((t) => t._id === taskId);
      return prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t));
    });

    try {
      const { data } = await api.put(`/projects/${id}/tasks/${taskId}`, updates);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
    } catch {
      if (taskToRevert) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? taskToRevert! : t)));
      }
      toast.error('Failed to update task');
    }
  };

  // ✅ FIX 1: Optimistic delete with targeted functional rollback
  const deleteTask = async (taskId: string) => {
    let taskToRevert: Task | undefined;

    setTasks((prev) => {
      taskToRevert = prev.find((t) => t._id === taskId);
      return prev.filter((t) => t._id !== taskId);
    });

    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
    } catch {
      if (taskToRevert) {
        setTasks((prev) => [taskToRevert!, ...prev]);
      }
      toast.error('Failed to delete task');
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    const isAlreadyCollaborator = project?.collaborators.some(c => c.email === inviteEmail.trim()) ||
                                  project?.owner.email === inviteEmail.trim();
    if (isAlreadyCollaborator) {
      toast.error('User is already a collaborator');
      return;
    }

    setInviting(true);
    try {
      await api.post(`/projects/${id}/invite`, { email: inviteEmail.trim() });
      setInviteEmail('');
      toast.success('Invitation sent');
    } catch {
      toast.error('Failed to invite — check the email address');
    } finally {
      setInviting(false);
    }
  };

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [tasks, statusFilter, search]);

  if (error) return <p role="alert" className="text-red-500 text-center mt-10">Failed to load project.</p>;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">{project?.name}</h1>
      {project?.description && (
        <p className="text-gray-500 mb-6">{project.description}</p>
      )}

      {/* Collaborators & Invite */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-semibold mb-2 text-gray-800">Collaborators</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
            {project?.owner.name} (owner)
          </span>
          {project?.collaborators.map((c) => (
            <span key={c._id} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
              {c.name}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Invite by email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && inviteCollaborator()}
            className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
          />
          <button
            onClick={inviteCollaborator}
            disabled={inviting}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition disabled:opacity-60"
          >
            {inviting ? 'Inviting...' : 'Invite'}
          </button>
        </div>
      </div>

      {/* Add Task & AI Generator */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Task</h2>
          <button
            onClick={generateAITasks}
            disabled={isGeneratingAI || !project?.description}
            className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 flex items-center gap-1"
            title={!project?.description ? "Project needs a description first" : "Generate tasks with Gemini"}
          >
            {isGeneratingAI ? '✨ Thinking...' : '✨ Auto-Generate Tasks'}
          </button>
        </div>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
            const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim();
            if (!title) return;
            
            // ✅ Fix: Only submit once
            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            submitBtn.disabled = true;
            
            addTask({ title, description }).finally(() => {
              submitBtn.disabled = false;
              form.reset();
            });
          }}
        >
          <input
            name="title"
            placeholder="Task title"
            className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            rows={2}
          />
          <button
            type="submit"
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            Create Task
          </button>
        </form>
      </div>

      {/* View Tabs */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveView('kanban')}
          className={`px-5 py-2 text-sm font-medium border-b-2 transition ${
            activeView === 'kanban'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setActiveView('calendar')}
          className={`px-5 py-2 text-sm font-medium border-b-2 transition ${
            activeView === 'calendar'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Calendar
        </button>
      </div>

      {activeView === 'kanban' ? (
        <>
          <SearchFilter onSearch={setSearch} onFilterStatus={setStatusFilter} />
          {/* ✅ FIX 3: Restored missing props so Delete buttons & Attachments work properly */}
          <KanbanBoard
            tasks={filteredTasks}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onRefresh={fetchTasks}
            projectOwnerId={project?.owner._id}
          />
        </>
      ) : (
        <CalendarView
          tasks={tasks}
          projectId={id!}
          onTaskUpdate={updateTask}
          onTaskAdd={addTask}
        />
      )}

      <ActivityFeed projectId={id!} />
    </div>
  );
};

export default ProjectDetail;