import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import api from '../services/api';
import { renderWithRouter, makeActivity } from '../test/testUtils';
import ActivityFeed from '../components/ActivityFeed';

vi.mock('../services/api'); 

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ActivityFeed', () => {
  it('shows loading text while fetching', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    renderWithRouter(<ActivityFeed projectId="project-1" />);
    expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
  });

  it('shows "No activity yet" when the feed is empty', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<ActivityFeed projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
    });
  });

  it('renders each activity entry with user name, action, and details', async () => {
    const activities = [
      makeActivity({
        _id: 'a1',
        user: { _id: 'u1', name: 'Alice', email: 'alice@example.com' },
        action: 'created task',
        details: 'Created task "Fix login"',
        createdAt: new Date(Date.now() - 120_000).toISOString(),
      }),
      makeActivity({
        _id: 'a2',
        user: { _id: 'u1', name: 'Alice', email: 'alice@example.com' },
        action: 'changed status',
        details: 'Changed "Fix login" from To Do to Done',
        createdAt: new Date(Date.now() - 60_000).toISOString(),
      }),
    ];
    vi.mocked(api.get).mockResolvedValue({ data: activities });
    renderWithRouter(<ActivityFeed projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getAllByText('Alice')).toHaveLength(2);
      expect(screen.getByText('created task')).toBeInTheDocument();
      expect(screen.getByText('changed status')).toBeInTheDocument();
      expect(screen.getByText(/fix login/i)).toBeInTheDocument();
    });
  });

  it('renders relative timestamps', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [makeActivity({ createdAt: new Date(Date.now() - 300_000).toISOString() })],
    });
    renderWithRouter(<ActivityFeed projectId="project-1" />);

    await waitFor(() => {
      // date-fns formatDistanceToNow produces "X minutes ago"
      expect(screen.getByText(/minutes ago/i)).toBeInTheDocument();
    });
  });

  it('calls the correct API endpoint for the given projectId', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<ActivityFeed projectId="project-abc-123" />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/projects/project-abc-123/tasks/activity');
    });
  });

  it('re-fetches when the socket emits activity-updated', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderWithRouter(<ActivityFeed projectId="project-1" />);

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    // Simulate socket event
    const { mockSocket } = await import('../test/testUtils');
    const [[, handler]] = vi.mocked(mockSocket.on).mock.calls.filter(
      ([event]) => event === 'activity-updated'
    );
    vi.mocked(api.get).mockResolvedValue({ data: [makeActivity()] });
    handler();

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });
});
