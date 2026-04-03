import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';

interface Props {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<Task['status'], string> = {
  'To Do': 'bg-gray-200 text-gray-700',
  'In Progress': 'bg-blue-200 text-blue-700',
  'Done': 'bg-green-200 text-green-700',
};

const TaskCard = ({ task, onUpdate, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm mb-3 cursor-grab active:cursor-grabbing select-none border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onUpdate(task._id, { completed: !task.completed })}
            className="h-4 w-4"
          />

          <div>
            <h4 data-testid="task-title" className="font-semibold text-gray-800">
              {task.title}
            </h4>

            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}

            {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) && (
              <p className="text-xs text-gray-400 mt-1">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            <button
  onClick={() => onDelete(task._id)}
  className="text-red-500 text-xs"
>
  Delete
</button>

          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
