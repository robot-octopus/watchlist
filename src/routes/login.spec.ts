import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import { goto } from '$app/navigation';
import LoginPage from './+page.svelte';

// Mock the navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

// Mock the auth store
const mockAuthStore = {
  subscribe: vi.fn(),
  login: vi.fn(),
};

vi.mock('$lib/stores/auth', () => ({
  authStore: mockAuthStore,
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock store subscription with default unauthenticated state
    mockAuthStore.subscribe.mockImplementation((callback) => {
      callback({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
      return () => {}; // unsubscribe function
    });
  });

  it('should render login form', () => {
    render(LoginPage);

    expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username or Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(LoginPage);

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await fireEvent.click(submitButton);

    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    render(LoginPage);

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');

    expect(passwordInput.type).toBe('password');

    await fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    await fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should call auth store login on form submission', async () => {
    render(LoginPage);

    const usernameInput = screen.getByLabelText('Username or Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    await fireEvent.input(usernameInput, { target: { value: 'test@example.com' } });
    await fireEvent.input(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(submitButton);

    expect(mockAuthStore.login).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123',
    });
  });

  it('should redirect to home when authenticated', () => {
    // Mock authenticated state
    mockAuthStore.subscribe.mockImplementation((callback) => {
      callback({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: { id: '123', email: 'test@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenExpiry: new Date(),
      });
      return () => {};
    });

    render(LoginPage);

    expect(goto).toHaveBeenCalledWith('/');
  });

  it('should show loading state during authentication', () => {
    // Mock loading state
    mockAuthStore.subscribe.mockImplementation((callback) => {
      callback({
        isAuthenticated: false,
        isLoading: true,
        error: null,
        user: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
      return () => {};
    });

    render(LoginPage);

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('should display authentication error', () => {
    // Mock error state
    mockAuthStore.subscribe.mockImplementation((callback) => {
      callback({
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials',
        user: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
      return () => {};
    });

    render(LoginPage);

    expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
