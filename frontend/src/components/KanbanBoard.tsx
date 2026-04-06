import { useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "../types";
import TaskCard from "./TaskCard";

const STATUSES: Task["status"][] = ["To Do", "In Progress", "Done"];

interface ColumnProps {
  status: Task["status"];
  children: React.ReactNode;
}

const KanbanColumn = ({ status, children }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-4 min-h-[200px] transition-colors ${
        isOver ? "bg-gray-200 ring-2 ring-blue-300" : "bg-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold mb-3 text-gray-700">{status}</h3>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};

interface Props {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => Promise<void>;
  projectOwnerId?: string | undefined;
}

const KanbanBoard = ({
  tasks,
  onUpdate,
  onDelete,
  onRefresh,
  projectOwnerId,
}: Props) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // User must drag 5px before drag event starts (allows normal clicks)
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTask = tasks.find((t) => t._id === active.id);
    if (draggedTask) setActiveTask(draggedTask);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    let newStatus: Task["status"] | null = null;

    // Dropped directly onto a column droppable
    if (STATUSES.includes(over.id as Task["status"])) {
      newStatus = over.id as Task["status"];
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <KanbanColumn key={status} status={status}>
              <SortableContext
                items={columnTasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onRefresh={onRefresh}
                    projectOwnerId={projectOwnerId}
                  />
                ))}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 shadow-xl scale-105 rotate-2 cursor-grabbing transition-transform">
            <TaskCard
              task={activeTask}
              onUpdate={() => {}}
              onDelete={() => {}}
              projectOwnerId={projectOwnerId}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
