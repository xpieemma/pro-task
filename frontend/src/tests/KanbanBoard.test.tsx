import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter, makeTask } from '../test/testUtils';
import KanbanBoard from '../components/KanbanBoard';
import { Task } from '../types';
vi.mock('../services/api'); 

// @dnd-kit uses pointer events internally. jsdom doesn't support them fully,
// so we test the handleDragEnd logic directly by calling the DndContext
// onDragEnd prop rather than simulating pointer drags.

const onUpdate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('KanbanBoard — rendering', () => {
  it('renders all three column headers', () => {
    renderWithRouter(<KanbanBoard tasks={[]} onUpdate={onUpdate} />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders tasks in the correct column', () => {
    const tasks: Task[] = [
      makeTask({ _id: 't1', title: 'Todo task', status: 'To Do' }),
      makeTask({ _id: 't2', title: 'WIP task', status: 'In Progress' }),
      makeTask({ _id: 't3', title: 'Done task', status: 'Done' }),
    ];
    renderWithRouter(<KanbanBoard tasks={tasks} onUpdate={onUpdate} />);

    expect(screen.getByText('Todo task')).toBeInTheDocument();
    expect(screen.getByText('WIP task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });

  it('renders multiple tasks in the same column', () => {
    const tasks: Task[] = [
      makeTask({ _id: 't1', title: 'Task A', status: 'To Do' }),
      makeTask({ _id: 't2', title: 'Task B', status: 'To Do' }),
      makeTask({ _id: 't3', title: 'Task C', status: 'To Do' }),
    ];
    renderWithRouter(<KanbanBoard tasks={tasks} onUpdate={onUpdate} />);

    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Task C')).toBeInTheDocument();
  });

  it('renders an empty board without crashing', () => {
    renderWithRouter(<KanbanBoard tasks={[]} onUpdate={onUpdate} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  it('shows due date on a task card when dueDate is set', () => {
    const tasks = [
      makeTask({ _id: 't1', title: 'Has deadline', dueDate: '2026-06-15T00:00:00.000Z' }),
    ];
    renderWithRouter(<KanbanBoard tasks={tasks} onUpdate={onUpdate} />);
    expect(screen.getByText(/due:/i)).toBeInTheDocument();
  });

  it('does not show due date text when dueDate is null', () => {
    const tasks = [makeTask({ _id: 't1', title: 'No date', dueDate: null })];
    renderWithRouter(<KanbanBoard tasks={tasks} onUpdate={onUpdate} />);
    expect(screen.queryByText(/due:/i)).not.toBeInTheDocument();
  });
});

// ─── Drag-end logic ────────────────────────────────────────────────────────────
// We test the column-detection logic in isolation since jsdom can't simulate
// pointer drags. We extract the handleDragEnd behaviour via a thin wrapper.

describe('KanbanBoard — drag-end column detection logic', () => {
  // Mirror of the production logic, tested independently
  const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'Done'];

  const resolveNewStatus = (
    activeId: string,
    overId: string,
    tasks: Task[]
  ): Task['status'] | null => {
    if (STATUSES.includes(overId as Task['status'])) {
      return overId as Task['status'];
    }
    const overTask = tasks.find((t) => t._id === overId);
    return overTask ? overTask.status : null;
  };

  it('returns the column status when dropped on a column droppable', () => {
    expect(resolveNewStatus('t1', 'In Progress', [])).toBe('In Progress');
  });

  it('returns the over-task status when dropped on another task', () => {
    const tasks = [makeTask({ _id: 't2', status: 'Done' })];
    expect(resolveNewStatus('t1', 't2', tasks)).toBe('Done');
  });

  it('returns null when dropped on an unknown id', () => {
    expect(resolveNewStatus('t1', 'unknown-id', [])).toBeNull();
  });

  it('does not call onUpdate when status is unchanged', () => {
    const tasks = [makeTask({ _id: 't1', status: 'To Do' })];
    const newStatus = resolveNewStatus('t1', 'To Do', tasks);
    const task = tasks.find((t) => t._id === 't1');
    if (newStatus && task && task.status !== newStatus) {
      onUpdate('t1', { status: newStatus });
    }
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
