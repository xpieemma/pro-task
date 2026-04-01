import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import api from '../services/api';
import { renderWithRouter, makeProject, mockUser } from '../test/testUtils';
import Dashboard from '../pages/Dashboard';
vi.mock('../services/api'); 
beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Loading & empty state ─────────────────────────────────────────────────────

describe('Dashboard — loading & empty state', () => {
  it('shows a spinner while fetching projects', async () => {
    // Never resolves
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    renderWithRouter(<Dashboard />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner
  });

  it('shows the empty-state message when user has no projects', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
    });
  });
});

// ─── Rendering projects ────────────────────────────────────────────────────────

describe('Dashboard — project list', () => {
  it('greets the logged-in user by name', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/hello, alice/i)).toBeInTheDocument();
    });
  });

  it('renders a card for each project', async () => {
    const projects = [
      makeProject({ _id: 'p1', name: 'Alpha' }),
      makeProject({ _id: 'p2', name: 'Beta' }),
    ];
    vi.mocked(api.get).mockResolvedValue({ data: projects });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });
  });

  it('shows the "Owner" label on projects the user owns', async () => {
    const owned = makeProject({ owner: { _id: mockUser._id, name: 'Alice', email: 'alice@example.com' } });
    vi.mocked(api.get).mockResolvedValue({ data: [owned] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/owner/i)).toBeInTheDocument();
    });
  });

  it('does NOT show delete button for projects the user does not own', async () => {
    const foreignProject = makeProject({
      _id: 'foreign',
      name: "Bob's Project",
      owner: { _id: 'other-user', name: 'Bob', email: 'bob@example.com' },
    });
    vi.mocked(api.get).mockResolvedValue({ data: [foreignProject] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  it('shows delete button only for projects the user owns', async () => {
    const owned = makeProject();
    const foreign = makeProject({
      _id: 'p2',
      name: 'Not mine',
      owner: { _id: 'other-user', name: 'Bob', email: 'bob@example.com' },
    });
    vi.mocked(api.get).mockResolvedValue({ data: [owned, foreign] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(1);
    });
  });
});

// ─── Create project form ───────────────────────────────────────────────────────

describe('Dashboard — create project', () => {
  it('renders the new project form', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/project name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    });
  });

  it('calls POST /projects when form is submitted', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.post).mockResolvedValue({ data: makeProject({ name: 'New One' }) });
    renderWithRouter(<Dashboard />);

    await waitFor(() => screen.getByPlaceholderText(/project name/i));

    fireEvent.change(screen.getByPlaceholderText(/project name/i), {
      target: { value: 'New One' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/projects', expect.objectContaining({ name: 'New One' }));
    });
  });

  it('clears the name field after successful creation', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.post).mockResolvedValue({ data: makeProject({ name: 'New One' }) });
    renderWithRouter(<Dashboard />);

    await waitFor(() => screen.getByPlaceholderText(/project name/i));

    const nameInput = screen.getByPlaceholderText(/project name/i);
    fireEvent.change(nameInput, { target: { value: 'New One' } });
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });
  });

  it('does not submit if project name is blank', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => screen.getByRole('button', { name: /create project/i }));
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    expect(api.post).not.toHaveBeenCalled();
  });
});

// ─── Logout ────────────────────────────────────────────────────────────────────

describe('Dashboard — logout', () => {
  it('renders a logout button', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });
});
