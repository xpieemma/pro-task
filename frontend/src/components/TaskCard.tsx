import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';

interface Props {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const TaskCard = ({ task, onUpdate }: Props) => {
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
      className="bg-white p-3 rounded shadow mb-2 cursor-grab active:cursor-grabbing select-none"
    >
      <h4 data-testid="task-title" className="font-medium text-gray-800">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 truncate mt-1">{task.description}</p>
      )}
      {task.dueDate && (
        <p className="text-xs text-gray-400 mt-1">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default TaskCard;
