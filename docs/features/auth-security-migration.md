# Authentication Security Migration Plan

## 🎯 Goal: Migrate from localStorage to httpOnly Cookies + Server-Side Security

### 📋 Overview

Convert current client-side localStorage authentication to secure server-side session management using SvelteKit's native capabilities.

## Phase 1: Server-Side Login Implementation

### 🎯 Objective

Move login logic from client-side fetch to SvelteKit server actions.

### 📝 Tasks

#### 1.1 Create Server-Side Login Action

**File:** `src/routes/login/+page.server.ts`

```typescript
export const actions = {
  default: async ({ request, cookies }) => {
    // Extract form data
    // Call Tastytrade API server-side
    // Set httpOnly cookie
    // Return success/error
  },
};
```

#### 1.2 Update Login Form

**File:** `src/routes/login/+page.svelte`

- Change from `fetch()` to form submission
- Use SvelteKit's `enhance` action
- Handle server-side validation errors
- Maintain current UI/UX

#### 1.3 Create Server-Side Auth Utilities

**File:** `src/lib/server/auth.ts`

```typescript
export async function authenticateWithTastytrade(credentials);
export async function validateSession(token: string);
export async function refreshSession(token: string);
```

### ✅ Acceptance Criteria

- [ ] Login works via form submission (no client fetch)
- [ ] Session token stored in httpOnly cookie
- [ ] Error handling maintains current UX
- [ ] Demo credentials still work
- [ ] Tests pass

### 📊 Estimated Effort: 4-6 hours

---

## Phase 2: Server-Side Session Validation

### 🎯 Objective

Implement session validation in `hooks.server.ts` for every request.

### 📝 Tasks

#### 2.1 Enhanced Hooks Implementation

**File:** `src/hooks.server.ts`

```typescript
export const handle = async ({ event, resolve }) => {
  // Get session token from httpOnly cookie
  // Validate with Tastytrade API if needed
  // Set event.locals.user
  // Handle route protection
  // Automatic token refresh
};
```

#### 2.2 Type Definitions

**File:** `src/app.d.ts`

```typescript
declare global {
  namespace App {
    interface Locals {
      user: User | null;
      session: SessionData | null;
    }
  }
}
```

#### 2.3 Server-Side Route Protection

- Implement route classification (public/protected)
- Server-side redirects for unauthenticated users
- Preserve intended destination

### ✅ Acceptance Criteria

- [ ] All requests validate session server-side
- [ ] Protected routes redirect unauthenticated users
- [ ] `event.locals.user` available in all server functions
- [ ] No client-side token validation needed
- [ ] Performance remains good (cached validation)

### 📊 Estimated Effort: 6-8 hours

---

## Phase 3: Client-Side Migration

### 🎯 Objective

Remove localStorage dependencies and use server-provided auth state.

### 📝 Tasks

#### 3.1 Update Auth Store

**File:** `src/lib/stores/auth.ts`

- Remove localStorage token management
- Use server-provided user data from page props
- Simplify auth state management
- Maintain reactive updates

#### 3.2 Layout Server Integration

**File:** `src/routes/+layout.server.ts`

```typescript
export const load = async (event) => {
  return {
    user: event.locals.user,
  };
};
```

#### 3.3 Remove Client-Side Token Logic

- Update API clients to use cookies automatically
- Remove manual Authorization headers
- Simplify logout to server action

### ✅ Acceptance Criteria

- [ ] No localStorage token access in client code
- [ ] Auth state comes from server props
- [ ] Logout works via server action
- [ ] All API calls use httpOnly cookies
- [ ] Client bundle size reduced

### 📊 Estimated Effort: 4-6 hours

---

## Phase 4: Security Hardening

### 🎯 Objective

Add additional security measures and cleanup.

### 📝 Tasks

#### 4.1 Cookie Security Configuration

```typescript
cookies.set('session-token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 24 * 60 * 60, // 24 hours
  path: '/',
});
```

#### 4.2 CSRF Protection

- Implement CSRF token for state-changing operations
- Add SameSite cookie protection
- Server-side origin validation

#### 4.3 Session Management

- Implement session cleanup/expiration
- Add refresh token logic if needed
- Server-side session invalidation

#### 4.4 Security Headers

```typescript
// Add security headers in hooks.server.ts
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-Frame-Options', 'DENY');
// etc.
```

### ✅ Acceptance Criteria

- [ ] All security headers implemented
- [ ] CSRF protection active
- [ ] Session cleanup working
- [ ] Security audit passes
- [ ] No XSS vulnerabilities

### 📊 Estimated Effort: 3-4 hours

---

## Phase 5: Testing & Documentation

### 📝 Tasks

#### 5.1 Update Tests

- Modify existing auth tests for server-side flow
- Add server-side session validation tests
- Update integration tests for form submission
- Test cookie-based authentication

#### 5.2 Performance Testing

- Measure server-side validation performance
- Test session validation caching
- Load testing with concurrent sessions

#### 5.3 Documentation Updates

- Update README with new security approach
- Document server-side authentication flow
- Add deployment considerations

### ✅ Acceptance Criteria

- [ ] All tests pass with new implementation
- [ ] Performance meets requirements
- [ ] Documentation reflects actual implementation
- [ ] Security review completed

### 📊 Estimated Effort: 4-5 hours

---

## 📊 Total Implementation Plan

| Phase                       | Effort | Dependencies | Risk   |
| --------------------------- | ------ | ------------ | ------ |
| Phase 1: Server Login       | 4-6h   | None         | Low    |
| Phase 2: Session Validation | 6-8h   | Phase 1      | Medium |
| Phase 3: Client Migration   | 4-6h   | Phase 2      | Low    |
| Phase 4: Security Hardening | 3-4h   | Phase 3      | Low    |
| Phase 5: Testing & Docs     | 4-5h   | All phases   | Low    |

**Total Estimated Effort:** 21-29 hours

## 🚀 Implementation Strategy

### Week 1: Foundation (Phases 1-2)

- Server-side login implementation
- Session validation in hooks
- Core security migration

### Week 2: Client & Security (Phases 3-4)

- Client-side migration
- Security hardening
- CSRF protection

### Week 3: Testing & Polish (Phase 5)

- Comprehensive testing
- Performance optimization
- Documentation updates

## 🔒 Security Benefits After Migration

- ✅ **Zero XSS Risk**: Tokens never accessible to client JavaScript
- ✅ **CSRF Protected**: SameSite cookies + server validation
- ✅ **Server-Side Validation**: Every request validated before processing
- ✅ **Automatic Cleanup**: Session expiration handled server-side
- ✅ **Better Performance**: Pre-authenticated page loads
