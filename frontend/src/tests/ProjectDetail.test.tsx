import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import api from '../services/api';
import { makeProject, makeTask, makeActivity } from '../test/testUtils';
import ProjectDetail from '../pages/ProjectDetail';
vi.mock('../services/api'); 

// Route param :id
const PROJECT_ID = 'project-1';

// Must render inside Routes/Route so useParams can resolve :id
const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>
  );

const stubSuccessfulLoad = (taskOverrides: object[] = []) => {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url.includes('/tasks/activity')) return Promise.resolve({ data: [] });
    if (url.includes('/tasks')) return Promise.resolve({ data: taskOverrides });
    return Promise.resolve({ data: makeProject() });
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Loading ───────────────────────────────────────────────────────────────────

describe('ProjectDetail — loading', () => {
  it('shows a spinner on initial load', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

// ─── Project header ────────────────────────────────────────────────────────────

describe('ProjectDetail — header', () => {
  it('renders the project name', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    });
  });

  it('renders the project description', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('A test project')).toBeInTheDocument();
    });
  });

  it('renders the owner name in the collaborators section', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/alice.*owner/i)).toBeInTheDocument();
    });
  });
});

// ─── Task creation ─────────────────────────────────────────────────────────────

describe('ProjectDetail — task creation', () => {
  it('renders the add task form', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });
  });

  it('calls POST /tasks when the form is submitted', async () => {
    stubSuccessfulLoad();
    vi.mocked(api.post).mockResolvedValue({
      data: makeTask({ _id: 'new-task', title: 'Write tests' }),
    });
    renderDetail();

    await waitFor(() => screen.getByPlaceholderText(/task title/i));

    fireEvent.change(screen.getByPlaceholderText(/task title/i), {
      target: { value: 'Write tests' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/projects/${PROJECT_ID}/tasks`,
        expect.objectContaining({ title: 'Write tests' })
      );
    });
  });

  it('adds the task optimistically before the API responds', async () => {
    stubSuccessfulLoad();
    // Slow API — never resolves immediately
    vi.mocked(api.post).mockReturnValue(new Promise(() => {}));
    renderDetail();

    await waitFor(() => screen.getByPlaceholderText(/task title/i));

    fireEvent.change(screen.getByPlaceholderText(/task title/i), {
      target: { value: 'Optimistic task' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    // Should appear immediately without waiting for API
    expect(screen.getByText('Optimistic task')).toBeInTheDocument();
  });
});

// ─── Search & filter ───────────────────────────────────────────────────────────

describe('ProjectDetail — search and filter', () => {
  const tasks = [
    makeTask({ _id: 't1', title: 'Fix login bug', status: 'To Do' }),
    makeTask({ _id: 't2', title: 'Add dark mode', status: 'In Progress' }),
    makeTask({ _id: 't3', title: 'Deploy to prod', status: 'Done' }),
  ];

  it('filters tasks by search text', async () => {
    stubSuccessfulLoad(tasks);
    renderDetail();

    await waitFor(() => screen.getByText('Fix login bug'));

    fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
      target: { value: 'login' },
    });

    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy to prod')).not.toBeInTheDocument();
  });

  it('filters tasks by status', async () => {
    stubSuccessfulLoad(tasks);
    renderDetail();

    await waitFor(() => screen.getByText('Fix login bug'));

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Done' },
    });

    expect(screen.getByText('Deploy to prod')).toBeInTheDocument();
    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
    expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();
  });

  it('shows all tasks when filter is reset to "all"', async () => {
    stubSuccessfulLoad(tasks);
    renderDetail();

    await waitFor(() => screen.getByText('Fix login bug'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Done' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'all' } });

    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('Deploy to prod')).toBeInTheDocument();
  });
});

// ─── View toggle ──────────────────────────────────────────────────────────────

describe('ProjectDetail — view toggle', () => {
  it('shows the Kanban board by default', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('switches to Calendar view when tab is clicked', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => screen.getByRole('button', { name: /calendar/i }));
    fireEvent.click(screen.getByRole('button', { name: /calendar/i }));

    await waitFor(() => {
      expect(screen.getByText(/calendar view/i)).toBeInTheDocument();
    });
  });

  it('switches back to Kanban from Calendar', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => screen.getByRole('button', { name: /calendar/i }));
    fireEvent.click(screen.getByRole('button', { name: /calendar/i }));
    fireEvent.click(screen.getByRole('button', { name: /kanban/i }));

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
    });
  });
});

// ─── Invite collaborator ───────────────────────────────────────────────────────

describe('ProjectDetail — invite collaborator', () => {
  it('renders the invite input and button', async () => {
    stubSuccessfulLoad();
    renderDetail();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/invite by email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument();
    });
  });

  it('calls POST /invite when Invite button is clicked', async () => {
    stubSuccessfulLoad();
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Collaborator added' } });
    renderDetail();

    await waitFor(() => screen.getByPlaceholderText(/invite by email/i));

    fireEvent.change(screen.getByPlaceholderText(/invite by email/i), {
      target: { value: 'bob@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /invite/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/projects/${PROJECT_ID}/invite`,
        { email: 'bob@example.com' }
      );
    });
  });

  it('clears the invite input after a successful invite', async () => {
    stubSuccessfulLoad();
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Collaborator added' } });
    renderDetail();

    await waitFor(() => screen.getByPlaceholderText(/invite by email/i));

    const input = screen.getByPlaceholderText(/invite by email/i);
    fireEvent.change(input, { target: { value: 'bob@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /invite/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});
