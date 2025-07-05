# Authentication Login Prompt Feature Plan

## 📋 Feature Overview

### User Story

As a user, I want to be prompted for my Tastytrade credentials when the app starts up, so that I can securely access my watchlist data and perform authenticated API operations.

### Acceptance Criteria

- [ ] App displays login form immediately on startup before any other content
- [ ] User must provide valid username and password to proceed
- [ ] Successful authentication stores OAuth2 access token and displays main app
- [ ] Failed authentication shows clear error message and allows retry
- [ ] Authentication state persists across browser sessions (refresh token functionality)
- [ ] Unauthenticated users cannot access any protected functionality
- [ ] Loading states are clearly communicated during authentication
- [ ] Access tokens are automatically refreshed before expiry (15-minute lifecycle)

### Success Metrics

- User can authenticate successfully with valid credentials
- Invalid credentials show appropriate error messages
- OAuth2 access tokens are properly stored and used for API requests
- App redirects to main dashboard after successful login
- Token refresh functionality maintains seamless user experience
- Proper "Bearer" authorization headers are used for all authenticated requests

## 🏗️ Technical Architecture

### Components

```
src/lib/components/auth/
├── LoginForm.svelte          # Main login form component
├── LoginForm.spec.ts         # Unit tests for login form
├── AuthGuard.svelte          # Authentication wrapper component
└── AuthGuard.spec.ts         # Unit tests for auth guard
```

### API Integration

#### Authentication Strategy

Tastytrade API supports two authentication methods:

1. **OAuth2 Access Tokens (Recommended)**:
   - Generated via `POST /oauth/token` endpoint
   - Valid for 15 minutes, must be refreshed
   - Authorization header: `Bearer <access_token>`
   - Future-proof (session tokens will be deprecated)

2. **Session Tokens (Legacy)**:
   - Generated via `POST /sessions` endpoint
   - Valid for 24 hours
   - Authorization header: `<session_token>` (no "Bearer" prefix)
   - Being deprecated for API users

**Implementation Decision**: Use OAuth2 access tokens for future compatibility.

#### OAuth2 Setup Requirements

- **OAuth Client Registration**: Must register OAuth2 client with Tastytrade
- **Client Credentials**: Obtain client_id and client_secret from Tastytrade
- **Grant Types**: Support "password" grant type for username/password login
- **Scopes**: Request appropriate scopes for watchlist and market data access

#### Technical Components

- **OAuth Client**: Extend existing `BaseApiClient` with OAuth2 flow
- **Token Management**: Handle 15-minute token lifecycle with automatic refresh
- **Token Storage**: Secure storage for access tokens and refresh tokens
- **Authorization Headers**: Proper "Bearer" prefix for OAuth2 tokens
- **Token Refresh**: Background refresh before expiry to maintain session

### State Management

```typescript
// src/lib/stores/auth.ts
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  isLoading: boolean;
  error: string | null;
}

// OAuth2 token response
interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds (typically 900 for 15 minutes)
  scope: string;
}
```

### Authentication Flow

1. App startup → Check for existing access token and expiry
2. If no token or expired → Check for refresh token
3. If refresh token exists → Attempt token refresh
4. If no refresh token → Show login form
5. User submits credentials → API call to `/oauth/token`
6. Success → Store access token, refresh token, and expiry
7. Failure → Show error, allow retry
8. Background: Monitor token expiry and refresh automatically

## 🎨 UI/UX Design

### Skeleton UI Components

- **Modal**: Use `Modal` component for login overlay
- **Input Groups**: Use `InputGroup` with validation states
- **Buttons**: Use `btn` classes with loading states
- **Form Layout**: Use `form-group` and `form-control` patterns

### Tailwind Patterns

```svelte
<!-- Login Form Container -->
<div class="fixed inset-0 bg-surface-backdrop-token z-50 flex items-center justify-center">
  <div class="card p-8 w-full max-w-md mx-4 shadow-xl">
    <!-- Form content -->
  </div>
</div>

<!-- Loading States -->
<button class="btn variant-filled-primary" disabled={isLoading}>
  {#if isLoading}
    <span class="animate-spin">⏳</span>
  {/if}
  Sign In
</button>
```

### Accessibility

- Proper form labels and ARIA attributes
- Keyboard navigation support
- Screen reader friendly error messages
- Focus management for modal behavior

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```typescript
// LoginForm.spec.ts
describe('LoginForm', () => {
  it('should render login form fields');
  it('should validate required fields');
  it('should handle successful login');
  it('should display error on failed login');
  it('should show loading state during authentication');
  it('should handle remember-me toggle');
});

// AuthGuard.spec.ts
describe('AuthGuard', () => {
  it('should show login form when unauthenticated');
  it('should show protected content when authenticated');
  it('should redirect to login on token expiry');
});
```

### E2E Tests (Playwright)

```typescript
// auth.spec.ts
test.describe('Authentication Flow', () => {
  test('should prompt for login on startup');
  test('should authenticate with valid credentials');
  test('should reject invalid credentials');
  test('should persist session across browser refresh');
  test('should handle remember-me functionality');
});
```

### Visual Regression

- Login form rendering in light/dark themes
- Loading states and error messages
- Mobile responsive behavior
- Focus states and accessibility

## 📋 Implementation Phases

### Phase 1: Core Authentication Infrastructure (TDD)

**Tests First:**

- Write failing tests for auth store with OAuth2 tokens
- Write failing tests for OAuth2 API client
- Write failing tests for token storage and refresh utilities

**Implementation:**

- Create authentication store with Svelte runes (access/refresh tokens)
- Implement OAuth2 API client extending BaseApiClient
- Add token persistence and refresh utilities
- Implement proper "Bearer" authorization headers

**Quality Gate:** All auth infrastructure tests pass

### Phase 2: Login Form Component (TDD)

**Tests First:**

- Write failing tests for LoginForm component
- Write failing tests for form validation
- Write failing tests for OAuth2 API integration

**Implementation:**

- Create LoginForm.svelte with Skeleton UI
- Implement form validation using Zod
- Connect to OAuth2 authentication store
- Handle OAuth2 token response and storage

**Quality Gate:** LoginForm tests pass, visual regression tests pass

### Phase 3: Authentication Guard (TDD)

**Tests First:**

- Write failing tests for AuthGuard component
- Write failing tests for route protection
- Write failing tests for token refresh and session restoration

**Implementation:**

- Create AuthGuard component
- Integrate with app layout
- Implement OAuth2 token restoration and refresh logic
- Handle automatic token refresh before expiry

**Quality Gate:** E2E authentication flow tests pass

### Phase 4: Integration & Polish

**Tests First:**

- Write failing E2E tests for complete OAuth2 user journey
- Write failing tests for token refresh edge cases and error handling

**Implementation:**

- Integrate OAuth2 authentication with existing API clients
- Add loading states and error handling for token operations
- Implement seamless token refresh with proper error boundaries
- Add monitoring for token expiry and proactive refresh

**Quality Gate:** All tests pass, no regressions introduced

## 📁 File Structure

```
src/lib/
├── components/auth/
│   ├── LoginForm.svelte
│   ├── LoginForm.spec.ts
│   ├── AuthGuard.svelte
│   └── AuthGuard.spec.ts
├── stores/
│   ├── auth.ts
│   └── auth.spec.ts
├── api/
│   ├── clients/
│   │   ├── oauth.ts
│   │   └── oauth.spec.ts
│   └── types/
│       └── oauth.ts (OAuth2 token types)
└── utils/
    ├── token-storage.ts
    ├── token-storage.spec.ts
    ├── token-refresh.ts
    └── token-refresh.spec.ts

src/routes/
├── +layout.svelte (updated with AuthGuard)
└── +page.svelte (protected content)

tests/
└── auth.spec.ts (E2E authentication tests)
```

## ⚠️ Risks & Considerations

### Technical Challenges

- **OAuth2 Token Management**: Proper access token and refresh token lifecycle
- **Token Refresh Timing**: Refreshing tokens before expiry without race conditions
- **API Error Handling**: Graceful handling of authentication and token refresh failures
- **State Synchronization**: Keeping auth state consistent across components
- **Security**: Protecting against XSS and token leakage (especially refresh tokens)

### UX Challenges

- **Loading States**: Clear feedback during authentication and token refresh
- **Error Messages**: User-friendly error descriptions for OAuth2 failures
- **Token Expiry**: Seamless token refresh without user interruption
- **Mobile Experience**: Responsive design for login form
- **Background Refresh**: Invisible token refresh maintaining user experience

### Mitigation Strategies

- Implement comprehensive error boundaries for OAuth2 flows
- Use TypeScript for type safety across all auth interfaces
- Add extensive logging for debugging token lifecycle
- Implement proper token refresh logic with retry mechanisms
- Follow security best practices for OAuth2 token storage
- Use secure HttpOnly cookies for refresh tokens when possible
- Implement token expiry monitoring and proactive refresh

## ✅ Definition of Done

### Quality Checklist

- [ ] All unit tests pass with >95% coverage
- [ ] All E2E tests pass across browsers
- [ ] Visual regression tests pass
- [ ] No ESLint errors or warnings
- [ ] TypeScript strict mode compliance
- [ ] Accessibility requirements met (WCAG 2.1)
- [ ] Mobile responsive design verified
- [ ] Security review completed

### Functional Completeness

- [ ] User can login with valid credentials
- [ ] Invalid credentials show appropriate errors
- [ ] OAuth2 access tokens are stored and used correctly
- [ ] Token refresh functionality works seamlessly
- [ ] Token expiry handling implemented with proactive refresh
- [ ] Loading states are user-friendly during auth operations
- [ ] Error handling is comprehensive for OAuth2 flows
- [ ] Proper "Bearer" authorization headers are used

### Integration Requirements

- [ ] Authentication integrates with existing API clients
- [ ] No breaking changes to existing functionality
- [ ] Consistent with existing UI patterns
- [ ] Documentation updated
- [ ] Performance benchmarks met

---

**Implementation Notes:**

- Follow existing code patterns and conventions
- Use Skeleton UI components consistently
- Implement proper TypeScript types for OAuth2 flows
- Ensure all tests pass before merging
- Test with actual Tastytrade sandbox credentials
- **OAuth2 Requirements**: You must have an OAuth client registered with Tastytrade
- **Token Refresh**: Implement proactive refresh 1-2 minutes before 15-minute expiry
- **Authorization Headers**: Use "Bearer <token>" format for OAuth2 (not session tokens)
- **Security**: Never store credentials server-side, only tokens in secure storage
