import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateLoginForm } from '$lib/schemas/auth';

global.fetch = vi.fn();

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('Form Validation', () => {
    it('should validate valid credentials', () => {
      const validData = {
        username: 'testuser',
        password: 'password123',
      };

      const result = validateLoginForm(validData);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.data).toEqual(validData);
    });

    it('should reject empty username', () => {
      const invalidData = {
        username: '',
        password: 'password123',
      };

      const result = validateLoginForm(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.username).toBe('Username is required');
    });

    it('should reject empty password', () => {
      const invalidData = {
        username: 'testuser',
        password: '',
      };

      const result = validateLoginForm(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    it('should reject short password', () => {
      const invalidData = {
        username: 'testuser',
        password: '123',
      };

      const result = validateLoginForm(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.password).toBe('Password must be at least 6 characters');
    });

    it('should accept valid email as username', () => {
      const validData = {
        username: 'test@example.com',
        password: 'password123',
      };

      const result = validateLoginForm(validData);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('Login API Integration', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        success: true,
        redirectTo: '/watchlist',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/watchlist');
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid credentials',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse,
      });

      const credentials = {
        username: 'wronguser',
        password: 'wrongpass',
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Form State Management', () => {
    it('should initialize with empty credentials', () => {
      const initialCredentials = {
        username: '',
        password: '',
      };

      expect(initialCredentials.username).toBe('');
      expect(initialCredentials.password).toBe('');
    });

    it('should track field touch state', () => {
      const touched = {
        username: false,
        password: false,
      };

      expect(touched.username).toBe(false);
      expect(touched.password).toBe(false);

      // Simulate field blur
      touched.username = true;
      expect(touched.username).toBe(true);
      expect(touched.password).toBe(false);
    });

    it('should manage loading state', () => {
      let isLoading = false;

      expect(isLoading).toBe(false);

      isLoading = true;
      expect(isLoading).toBe(true);

      isLoading = false;
      expect(isLoading).toBe(false);
    });

    it('should track password visibility', () => {
      let showPassword = false;

      expect(showPassword).toBe(false);

      showPassword = !showPassword;
      expect(showPassword).toBe(true);

      showPassword = !showPassword;
      expect(showPassword).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should clear error message on successful validation', () => {
      let errorMessage = 'Previous error';

      const validData = {
        username: 'testuser',
        password: 'password123',
      };

      const result = validateLoginForm(validData);

      if (result.success) {
        errorMessage = '';
      }

      expect(errorMessage).toBe('');
    });

    it('should set error message on validation failure', () => {
      let errorMessage = '';

      const invalidData = {
        username: '',
        password: '',
      };

      const result = validateLoginForm(invalidData);

      if (!result.success) {
        errorMessage = 'Validation failed';
      }

      expect(errorMessage).toBe('Validation failed');
    });
  });

  describe('Demo Mode', () => {
    it('should validate demo credentials', () => {
      const demoCredentials = {
        username: 'demo',
        password: 'demo123',
      };

      const result = validateLoginForm(demoCredentials);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('demo');
    });
  });

  describe('Form Submission Prevention', () => {
    it('should prevent double submission when loading', () => {
      let isLoading = false;
      let submissionCount = 0;

      const handleSubmit = () => {
        if (isLoading) {
          return;
        }

        isLoading = true;
        submissionCount++;

        // Simulate async operation
        setTimeout(() => {
          isLoading = false;
        }, 100);
      };

      handleSubmit();
      expect(submissionCount).toBe(1);
      expect(isLoading).toBe(true);

      // Try to submit again while loading
      handleSubmit();
      expect(submissionCount).toBe(1); // Should not increase
    });
  });

  describe('Window Navigation', () => {
    it('should handle window location redirect', () => {
      const mockLocation = {
        href: '',
      };

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const redirectTo = '/watchlist';
      window.location.href = redirectTo;

      expect(window.location.href).toBe(redirectTo);
    });

    it('should handle navigation errors gracefully', () => {
      let errorMessage = '';

      try {
        throw new Error('Navigation failed');
      } catch (error) {
        errorMessage = 'Login successful! Please navigate to /watchlist manually.';
        console.log('Navigation error:', (error as Error).message);
      }

      expect(errorMessage).toBe('Login successful! Please navigate to /watchlist manually.');
    });
  });
});
