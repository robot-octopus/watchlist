import { describe, it, expect } from 'vitest';
import {
  isPublicRoute,
  isProtectedRoute,
  getRedirectPath,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  DEFAULT_PROTECTED_REDIRECT,
  DEFAULT_LOGIN_REDIRECT,
} from './routes';

describe('Route Configuration', () => {
  describe('isPublicRoute', () => {
    it('should return true for login route', () => {
      expect(isPublicRoute('/login')).toBe(true);
    });

    it('should return true for root route', () => {
      expect(isPublicRoute('/')).toBe(true);
    });

    it('should return false for protected routes', () => {
      expect(isPublicRoute('/watchlist')).toBe(false);
      expect(isPublicRoute('/settings')).toBe(false);
    });

    it('should return false for unknown routes', () => {
      expect(isPublicRoute('/unknown')).toBe(false);
    });
  });

  describe('isProtectedRoute', () => {
    it('should return false for root route', () => {
      expect(isProtectedRoute('/')).toBe(false);
    });

    it('should return true for watchlist route', () => {
      expect(isProtectedRoute('/watchlist')).toBe(true);
    });

    it('should return true for settings route', () => {
      expect(isProtectedRoute('/settings')).toBe(true);
    });

    it('should return false for login route', () => {
      expect(isProtectedRoute('/login')).toBe(false);
    });

    it('should return true for unknown routes (default protected)', () => {
      expect(isProtectedRoute('/unknown')).toBe(true);
    });
  });

  describe('getRedirectPath', () => {
    it('should redirect unauthenticated users to login for protected routes', () => {
      expect(getRedirectPath(false, '/watchlist')).toBe('/login');
      expect(getRedirectPath(false, '/settings')).toBe('/login');
    });

    it('should not redirect unauthenticated users on public routes', () => {
      expect(getRedirectPath(false, '/login')).toBe('/login');
      expect(getRedirectPath(false, '/')).toBe('/');
    });

    it('should redirect authenticated users from login to watchlist', () => {
      expect(getRedirectPath(true, '/login')).toBe('/watchlist');
    });

    it('should not redirect authenticated users on protected routes', () => {
      expect(getRedirectPath(true, '/watchlist')).toBe('/watchlist');
      expect(getRedirectPath(true, '/settings')).toBe('/settings');
    });

    it('should not redirect authenticated users on public routes', () => {
      expect(getRedirectPath(true, '/')).toBe('/');
    });
  });

  describe('Route Constants', () => {
    it('should have correct public routes', () => {
      expect(PUBLIC_ROUTES).toContain('/login');
      expect(PUBLIC_ROUTES).toContain('/');
    });

    it('should have correct protected routes', () => {
      expect(PROTECTED_ROUTES).toContain('/watchlist');
      expect(PROTECTED_ROUTES).toContain('/settings');
      expect(PROTECTED_ROUTES).not.toContain('/');
    });

    it('should have correct default redirects', () => {
      expect(DEFAULT_PROTECTED_REDIRECT).toBe('/login');
      expect(DEFAULT_LOGIN_REDIRECT).toBe('/watchlist');
    });
  });
});
