import { DndContext, closestCenter, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../types';
import TaskCard from './TaskCard';

const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'Done'];

interface ColumnProps {
  status: Task['status'];
  children: React.ReactNode;
}

const KanbanColumn = ({ status, children }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-4 min-h-[200px] transition-colors ${
        isOver ? 'bg-gray-200' : 'bg-gray-100'
      }`}
    >
      <h3 className="font-bold mb-3 text-gray-700">{status}</h3>
      {children}
    </div>
  );
};

interface Props {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const KanbanBoard = ({ tasks, onUpdate }: Props) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    let newStatus: Task['status'] | null = null;

    // Dropped directly onto a column droppable
    if (STATUSES.includes(over.id as Task['status'])) {
      newStatus = over.id as Task['status'];
    } else {
      // Dropped onto another task — use that task's column
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus) {
      const task = tasks.find((t) => t._id === taskId);
      if (task && task.status !== newStatus) {
        onUpdate(taskId, { status: newStatus });
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <KanbanColumn key={status} status={status}>
              <SortableContext
                items={columnTasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={onUpdate} />
                ))}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
