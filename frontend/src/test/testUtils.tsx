import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';


export const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('../services/socket', () => ({
  connectSocket: vi.fn(() => mockSocket),
  getSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(),
}));

// ─── API mock ─────────────────────────────────────────────────────────────────
// Tests override per-method behaviour with vi.mocked(api.get).mockResolvedValue(...)

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// ─── Auth context helper ───────────────────────────────────────────────────────

export const mockUser = {
  _id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  token: 'fake-jwt-token',
};

// Provide a pre-authenticated context without going through the real login flow.
vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context/AuthContext')>();
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })),
  };
});

// ─── Render wrapper ───────────────────────────────────────────────────────────
// Wraps in MemoryRouter so components that call useNavigate / Link don't crash.

interface WrapperOptions extends RenderOptions {
  initialEntries?: string[];
}

export const renderWithRouter = (
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: WrapperOptions = {}
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    ),
    ...options,
  });

// ─── Fake data factories ───────────────────────────────────────────────────────

export const makeProject = (overrides = {}) => ({
  _id: 'project-1',
  name: 'Sprint 1',
  description: 'A test project',
  owner: { _id: 'user-1', name: 'Alice', email: 'alice@example.com' },
  collaborators: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const makeTask = (overrides = {}) => ({
  _id: 'task-1',
  title: 'Fix the login bug',
  description: 'Users cannot log in on Safari',
  status: 'To Do' as const,
  dueDate: null,
  project: 'project-1',
  ...overrides,
});

export const makeActivity = (overrides = {}) => ({
  _id: 'activity-1',
  user: { _id: 'user-1', name: 'Alice', email: 'alice@example.com' },
  action: 'created task',
  details: 'Created task "Fix the login bug"',
  createdAt: new Date(Date.now() - 60_000).toISOString(),
  ...overrides,
});
