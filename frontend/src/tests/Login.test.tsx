
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test/testUtils';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';


vi.mock('../context/AuthContext' );

vi.mock('../services/api'); 

// Pull the mocked version so we can configure it per-test
const mockLogin = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
  });
});

describe('Login page', () => {
  it('renders email, password fields and a submit button', () => {
    renderWithRouter(<Login />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to the register page', () => {
    renderWithRouter(<Login />);

    const link = screen.getByRole('link', { name: /register/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'password123');
    });
  });

  it('disables the submit button while submitting', async () => {
    // Never resolves so we can inspect the in-flight state
    mockLogin.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  it('re-enables the button after a failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });
});
