// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { Task } from '../types';

// interface Props {
//   task: Task;
//   onUpdate: (id: string, updates: Partial<Task>) => void;
//   onDelete: (id: string) => void;
// }

// const statusColors: Record<Task['status'], string> = {
//   'To Do': 'bg-gray-200 text-gray-700',
//   'In Progress': 'bg-blue-200 text-blue-700',
//   'Done': 'bg-green-200 text-green-700',
// };

// const TaskCard = ({ task, onUpdate, onDelete }: Props) => {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: task._id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className="bg-white p-4 rounded-lg shadow-sm mb-3 cursor-grab active:cursor-grabbing select-none border border-gray-100"
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-center gap-3">
//           <input
//             type="checkbox"
//             checked={task.completed}
//             onChange={() => onUpdate(task._id, { completed: !task.completed })}
//             className="h-4 w-4"
//           />

//           <div>
//             <h4 data-testid="task-title" className="font-semibold text-gray-800">
//               {task.title}
//             </h4>

//             {task.description && (
//               <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
//                 {task.description}
//               </p>
//             )}

//             {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) && (
//               <p className="text-xs text-gray-400 mt-1">
//                 Due: {new Date(task.dueDate).toLocaleDateString()}
//               </p>
//             )}
//             <button
//   onClick={() => onDelete(task._id)}
//   className="text-red-500 text-xs"
// >
//   Delete
// </button>

//           </div>
//         </div>
//         <span
//           className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}
//         >
//           {task.status}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default TaskCard;


import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import AttachmentList from './AttachmentList'; 
import { useAuth } from '../context/AuthContext';

interface Props {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  projectOwnerId?: string;
}

const statusColors: Record<Task['status'], string> = {
  'To Do': 'bg-gray-200 text-gray-700',
  'In Progress': 'bg-blue-200 text-blue-700',
  'Done': 'bg-green-200 text-green-700',
};

const TaskCard = ({ task, onUpdate, onDelete, onRefresh, projectOwnerId }: Props) => {
  const { user } = useAuth();
  const isOwner = user?._id === projectOwnerId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id, disabled: task._id.startsWith('temp-') });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };


  const handleToggleDone = () => {
    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    onUpdate(task._id, { status: newStatus });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg shadow-sm mb-3 border select-none transition-colors
        ${isDragging ? 'border-gray-400 shadow-md ring-2 ring-gray-200' : 'border-gray-200'} 
        ${task._id.startsWith('temp-') ? 'opacity-50 cursor-wait' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 w-full">
          
     
          <div onPointerDown={(e) => e.stopPropagation()} className="pt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={task.status === 'Done'}
              onChange={handleToggleDone}
              className="h-4 w-4 cursor-pointer accent-gray-800"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 
              data-testid="task-title" 
              className={`font-semibold truncate transition-all duration-200 ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}

            {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) && (
              <p className={`text-xs mt-1 font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500' : 'text-gray-400'}`}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}

       
            <div onPointerDown={(e) => e.stopPropagation()} className="mt-2">
              <AttachmentList
                projectId={task.project}
                taskId={task._id}
                attachments={task.attachments || []}
                onAttachmentChange={onRefresh || (() => {})}
              />
            </div>

         
            {isOwner && onDelete && (
              <div onPointerDown={(e) => e.stopPropagation()} className="mt-2">
                <button
                  onClick={() => onDelete(task._id)}
                  className="text-red-500 text-xs hover:underline bg-red-50 px-2 py-1 rounded"
                >
                  Delete task
                </button>
              </div>
            )}

          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;