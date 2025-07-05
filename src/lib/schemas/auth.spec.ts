import { describe, it, expect } from 'vitest';
import { validateLoginForm, loginSchema, getFieldError } from './auth';

describe('Auth Schema Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        username: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        username: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Please enter a valid email address');
      }
    });

    it('should reject empty username', () => {
      const invalidData = {
        username: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Username is required');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        username: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Password is required');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        username: 'test@example.com',
        password: '123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Password must be at least 6 characters');
      }
    });
  });

  describe('validateLoginForm', () => {
    it('should return success for valid data', () => {
      const validData = {
        username: 'test@example.com',
        password: 'password123',
      };

      const result = validateLoginForm(validData);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.data).toEqual(validData);
    });

    it('should return formatted errors for invalid data', () => {
      const invalidData = {
        username: '',
        password: '123',
      };

      const result = validateLoginForm(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.username).toBe('Username is required');
      expect(result.errors.password).toBe('Password must be at least 6 characters');
      expect(result.data).toBeUndefined();
    });

    it('should handle multiple validation errors', () => {
      const invalidData = {
        username: 'not-an-email',
        password: '',
      };

      const result = validateLoginForm(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.username).toBe('Please enter a valid email address');
      expect(result.errors.password).toBe('Password is required');
    });

    it('should handle malformed data', () => {
      const result = validateLoginForm(null);

      expect(result.success).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('getFieldError', () => {
    it('should return error message for existing field', () => {
      const errors = {
        username: 'Username is required',
        password: 'Password is required',
      };

      expect(getFieldError(errors, 'username')).toBe('Username is required');
      expect(getFieldError(errors, 'password')).toBe('Password is required');
    });

    it('should return null for non-existing field', () => {
      const errors = {
        username: 'Username is required',
      };

      expect(getFieldError(errors, 'password')).toBeNull();
      expect(getFieldError(errors, 'nonexistent')).toBeNull();
    });

    it('should handle empty errors object', () => {
      expect(getFieldError({}, 'username')).toBeNull();
    });
  });
});
