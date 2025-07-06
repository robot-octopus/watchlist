# Tastytrade Watchlist Feature Plan

This document outlines the comprehensive watchlist feature implementation plan for the Tastytrade trading platform.

## 📋 Core Requirements

### Watchlist Screen Features

- **📊 Watchlist Switching**: Interactive interface to switch between different watchlists
- **📈 Quote Table**: Display table with required columns:
  - Stock Symbol
  - Bid Price
  - Ask Price
  - Last Price
- **🛠️ Watchlist Modification**:
  - Add symbol to existing watchlist
  - Remove symbol from existing watchlist
  - Create new watchlist with given name
  - Delete watchlist
- **🔌 API Integration**: Use watchlists endpoints for all CRUD operations
- **🔍 Symbol Search**: Auto-completion interface when adding symbols
- **⏰ Quote Refresh**: 5-second polling updates for active watchlist

### Bonus Requirements

- **🌐 Bonus 1**: Streaming market data via WebSocket (https://developer.tastytrade.com/streaming-market-data/)
- **📊 Bonus 2**: Symbol detail view with current price and 24-hour chart (https://developer.tastytrade.com/streaming-market-data/#candle-events)

## 🎯 Features Planned

### Core Authentication & Security

- 🔄 **Direct API Integration**: Custom authentication for Tastytrade's session-based API
- 🔄 **Route Protection**: Server-side and client-side route guards using SvelteKit
- 🔄 **Token Management**: Secure storage with validation (localStorage → httpOnly cookies planned)
- 🔄 **Intended Destination**: Smart redirects to user's original destination
- 🔄 **Demo Mode**: Working authentication with sandbox credentials
- 🔄 **Security Best Practices**: Secure logout, token cleanup, navigation protection

### SvelteKit Server-Side Security

- 🔄 **Server Hooks**: Authentication validation in `hooks.server.ts`
- 🔄 **Server Load Functions**: Pre-authenticated page loads
- 🔄 **httpOnly Cookies**: Secure token storage (migration from localStorage)
- 🔄 **Custom API Integration**: Direct compatibility with Tastytrade's endpoints
- 🔄 **Session Management**: Server-side session validation and refresh

### Core Watchlist Functionality

- 📋 **Multiple Watchlists**: Create, delete, and switch between watchlists
- 📋 **Symbol Management**: Add and remove symbols from watchlists
- 📋 **Real-time Quotes**: 5-second polling updates for active watchlist
- 📋 **Symbol Search**: Auto-complete symbol search with API integration
- 📋 **Watchlist Table**: Display Stock Symbol, Bid Price, Ask Price, Last Price
- 📋 **API Integration**: Use watchlists endpoints for all CRUD operations

### UI/UX Features

- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Dark/Light Theme**: Consistent theming across all components
- 🎨 **Professional Layout**: Modern trading interface design
- 🎨 **Loading States**: Proper loading indicators and error handling
- 🎨 **Data Tables**: Comprehensive quote display with price formatting

### Bonus Features

- 🏆 **Streaming Market Data**: Replace polling with WebSocket streaming (https://developer.tastytrade.com/streaming-market-data/)
- 🏆 **Symbol Detail View**: Click symbol to view current price and 24-hour chart (https://developer.tastytrade.com/streaming-market-data/#candle-events)

## 📁 Project Structure

```
src/
├── lib/
│   ├── api/                    # API clients and types
│   │   ├── base-client.ts      # Base HTTP client with auth
│   │   ├── clients/
│   │   │   ├── oauth.ts        # Authentication API client
│   │   │   ├── watchlists.ts   # Watchlist management API
│   │   │   ├── symbol-search.ts # Symbol search API
│   │   │   └── market-metrics.ts # Market data API
│   │   └── types/              # TypeScript type definitions
│   ├── config/                 # Configuration utilities
│   │   └── routes.ts          # Route protection configuration
│   ├── utils/                  # Utility functions
│   │   ├── token-storage.ts   # Secure token storage with validation
│   │   └── auth-validation.ts # Authentication validation utilities
│   ├── stores/                 # Svelte stores for state management
│   │   ├── auth.ts            # Authentication state with route protection
│   │   └── watchlist.ts       # Watchlist and quote state
│   └── components/            # Reusable UI components
│       ├── LoginForm.svelte
│       ├── WatchlistManager.svelte
│       ├── WatchlistTable.svelte
│       ├── AddSymbolForm.svelte
│       ├── CreateWatchlistForm.svelte
│       └── SymbolDetailView.svelte
├── routes/
│   ├── +layout.svelte         # Client-side route protection
│   └── login/
│       └── +page.svelte       # Login page
└── hooks.server.ts            # Server-side route protection
```

## 🔧 Technical Implementation

### State Management

- **Authentication Store**: Manages user sessions with SvelteKit server integration
- **Watchlist Store**: Handles watchlist data, active watchlist selection, and quote streaming
- **Server-Side State**: Pre-authenticated user data via `event.locals`
- **Reactive Updates**: Real-time UI updates using Svelte's reactive store system

### API Integration

- **Direct Tastytrade Integration**: Perfect compatibility with custom session endpoints
- **Base Client**: Centralized HTTP client with authentication headers
- **OAuth Client**: Handles Tastytrade session creation and deletion
- **Server-Side Validation**: Session validation in `hooks.server.ts`
- **Watchlist Client**: CRUD operations for watchlist management
- **Symbol Search Client**: Auto-complete symbol search functionality

### Security Architecture

- **Current**: localStorage-based token storage (working but XSS vulnerable)
- **Planned**: httpOnly cookies with server-side session management
- **Route Protection**: SvelteKit server-side guards with client-side fallbacks
- **Session Management**: Direct integration with Tastytrade's session lifecycle
- **CSRF Protection**: SameSite cookies and server-side validation

### Quote Streaming

- **Implementation Plan**: Will simulate real-time market data updates initially
- **5-Second Updates**: Configurable quote refresh intervals for active watchlist
- **WebSocket Ready**: Architecture will support easy migration to WebSocket streaming
- **Bonus Enhancement**: Replace polling with real streaming via DxLink protocol

## 🗺️ Planned User Journey

### 1. Authentication

1. User will visit the application
2. Be presented with login form
3. Enter credentials for Tastytrade sandbox
4. Get authenticated and redirected to watchlist interface

### 2. Watchlist Management

1. View existing watchlists (empty initially)
2. Create new watchlist with custom name
3. Switch between multiple watchlists using interactive tabs
4. Delete unwanted watchlists with confirmation

### 3. Symbol Management

1. Click "Add Symbol" for active watchlist
2. Search for symbols using auto-complete interface
3. Select symbol from search results
4. Symbol gets added to watchlist with real-time quotes
5. Remove symbols with confirmation dialog

### 4. Quote Monitoring

1. View real-time bid/ask/last prices in table format
2. Monitor price changes and percentage changes
3. See color-coded positive/negative changes
4. Receive 5-second automatic quote updates

### 5. Symbol Details (Bonus Feature)

1. Click on any symbol in the watchlist
2. View detailed symbol information modal
3. See current price, bid/ask spread, volume
4. View 24-hour price chart
5. Close modal to return to watchlist

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm (package manager)

### Installation

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Add your demo credentials to `.env.local`:
   ```bash
   DEMO_USERNAME=your_demo_username
   DEMO_PASSWORD=your_demo_password
   ```

### Development

- Start development server: `pnpm dev`
- Run tests: `pnpm test`
- Build for production: `pnpm build`

### Demo Authentication

The application uses environment variables for demo credentials:

- Set `DEMO_USERNAME` and `DEMO_PASSWORD` in your `.env.local` file
- These credentials are used for testing the authentication flow
- The demo mode simulates Tastytrade's authentication API

## 🔐 Authentication Strategy

### Why Direct API Integration (Not Auth.js/Lucia)

Tastytrade uses **custom session-based authentication**, not standard OAuth2:

```typescript
// Tastytrade's actual API endpoints
POST /sessions              # Login with username/password
GET /customers/me          # Get user info with session token
DELETE /sessions           # Logout and invalidate session
```

**Popular libraries don't fit:**

- ❌ **Auth.js**: Designed for OAuth2, not custom session APIs
- ❌ **Lucia**: Expects standard auth patterns, adds complexity
- ✅ **Direct Integration**: Perfect compatibility with Tastytrade's endpoints

### Planned SvelteKit Authentication Architecture

#### **Phase 1: Enhanced Server-Side Security**

```
Client Request → hooks.server.ts → Server Load Function → Page Component
                       ↓
                 Validate httpOnly cookie
                       ↓
                 Check Tastytrade session
                       ↓
                 Pass user data to page
```

#### **Phase 2: Server-Side Session Management**

```
src/
├── hooks.server.ts              # Global auth validation
├── lib/
│   └── server/
│       └── auth.ts              # Tastytrade API integration
├── routes/
│   ├── +layout.server.ts        # Global auth state
│   ├── login/+page.server.ts    # Server-side login
│   └── api/
│       └── auth/
│           ├── login/+server.ts     # Set httpOnly cookie
│           ├── logout/+server.ts    # Clear session
│           └── refresh/+server.ts   # Token validation
```

### Current vs. Planned Implementation

#### **Current Approach (Working but Not Ideal)**

1. **Client-side Login**: Direct fetch to Tastytrade API
2. **localStorage Storage**: Token stored in browser (XSS vulnerable)
3. **Client-side Validation**: Token checked on each request
4. **Route Protection**: Both server and client-side guards

#### **Planned Secure Approach**

1. **Server-side Login**: Login handled in `+page.server.ts`
2. **httpOnly Cookie Storage**: Server sets secure cookie
3. **Server-side Validation**: Tokens validated in `hooks.server.ts`
4. **Pre-authenticated Pages**: User data available on page load

### Security Migration Plan

#### **Step 1: Server-Side Login**

```typescript
// src/routes/login/+page.server.ts
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const credentials = {
      username: data.get('username'),
      password: data.get('password'),
    };

    // Direct call to Tastytrade API
    const session = await authenticateWithTastytrade(credentials);

    // Set secure httpOnly cookie
    cookies.set('session-token', session.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true, user: session.user };
  },
};
```

#### **Step 2: Server-Side Validation**

```typescript
// Enhanced hooks.server.ts
export const handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get('session-token');

  if (sessionToken) {
    // Validate with Tastytrade API
    event.locals.user = await validateTastytradeSession(sessionToken);
  }

  // Route protection logic
  if (protectedRoute && !event.locals.user) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
```

#### **Step 3: Secure Token Storage**

```typescript
// src/lib/server/auth.ts
export async function validateTastytradeSession(token: string) {
  try {
    const response = await fetch(`${TASTYTRADE_API}/customers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
}
```

### Benefits of SvelteKit Server-Side Approach

#### **Security Improvements**

- ✅ **No XSS Risk**: Tokens never exposed to client JavaScript
- ✅ **httpOnly Cookies**: Automatic CSRF protection with SameSite
- ✅ **Server Validation**: Auth checked before pages load
- ✅ **Pre-rendered Auth State**: No client-side loading states

#### **Performance Benefits**

- ✅ **Faster Page Loads**: User data available immediately
- ✅ **Reduced Client Bundle**: No client-side auth libraries
- ✅ **Server-Side Redirects**: Instant redirects for protected routes
- ✅ **Better SEO**: Proper server-side rendering with auth state

#### **Developer Experience**

- ✅ **SvelteKit Native**: Uses framework's intended patterns
- ✅ **Type Safety**: Full TypeScript support with event.locals
- ✅ **Simple Client Code**: Pages just use user data from props
- ✅ **Direct API Integration**: No abstraction layer complexity

## 📊 Quote Data Structure

```typescript
interface Quote {
  symbol: string;
  bid?: number; // Best bid price
  ask?: number; // Best ask price
  last?: number; // Last traded price
  change?: number; // Price change from previous close
  changePercent?: number; // Percentage change
  volume?: number; // Trading volume
  timestamp?: number; // Last update timestamp
}
```

## 🎨 UI Components

### WatchlistManager

- Main container component
- Handles navigation between watchlists
- Manages create/delete operations
- Integrates all sub-components

### WatchlistTable

- Displays symbol quotes in tabular format
- Real-time price updates
- Color-coded change indicators
- Symbol remove functionality
- Clickable symbols for detail view

### AddSymbolForm

- Symbol search with auto-complete
- API integration for symbol lookup
- Form validation and error handling
- Responsive design

### SymbolDetailView

- Modal overlay for symbol details
- Comprehensive price information
- 24-hour price chart visualization
- Professional trading interface design

## 🚀 Future Enhancements

### Real Streaming Implementation

- Replace mock quotes with WebSocket connection
- Implement DxLink streaming protocol
- Handle connection management and reconnection

### Enhanced Charts

- Integration with charting libraries (Chart.js, D3, TradingView)
- Multiple timeframes (1min, 5min, 1hour, daily)
- Technical indicators and overlays

### Advanced Features

- Portfolio tracking
- Price alerts and notifications
- Advanced order management
- Options chain integration

## 🧪 Testing Strategy

The implementation will include comprehensive test coverage:

### Planned Unit Tests

- **OAuth Client Tests**: Authentication, token refresh, and user extraction
- **Route Configuration Tests**: Route protection logic validation
- **Token Storage Tests**: Secure token management
- **Auth Store Tests**: Authentication state management
- **Watchlist Store Tests**: Watchlist CRUD operations and quote management

### Planned Integration Tests

- **Login Integration Tests**: Complete authentication flow
- **Watchlist Management Tests**: Full CRUD operations
- **Symbol Search Tests**: Auto-completion and API integration
- **Quote Streaming Tests**: Real-time data updates

### Planned Visual Tests

- **Watchlist Table Tests**: Quote display and formatting
- **Component Tests**: UI consistency across different states
- **Loading State Tests**: Proper loading indicators and transitions
- **Responsive Tests**: Mobile and desktop layouts

### Test Coverage Areas

- Authentication flow (login/logout)
- Route protection (server-side and client-side)
- Watchlist management (create, delete, switch)
- Symbol management (add, remove, search)
- Quote streaming and updates
- Error handling and edge cases
- Form validation and user feedback
- Loading states and transitions
- Keyboard navigation and accessibility

## 📱 Mobile Responsiveness

- Responsive grid layouts
- Touch-friendly interface elements
- Optimized for portrait and landscape modes
- Consistent experience across devices

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

## 🔒 Security Considerations

### Authentication Security

- **Token-based authentication** with session management
- **Secure token storage** with localStorage validation
- **Token expiry handling** with automatic cleanup
- **Secure logout** with server-side session invalidation

### Route Protection

- **Server-side route guards** in `hooks.server.ts`
- **Client-side route protection** in layout components
- **Intended destination tracking** for post-login redirects
- **Navigation protection** using `replaceState: true`

### Data Security

- **API error handling** with graceful degradation
- **Input validation and sanitization** for all forms
- **CSRF protection** through proper token handling
- **No sensitive data exposure** in client-side code

### Development Security

- **Demo credentials** for sandbox environment only
- **Environment isolation** between development and production
- **Secure defaults** for all authentication flows
- **Error handling** without sensitive information leakage

---

This implementation plan provides a **secure, SvelteKit-native authentication system** that integrates perfectly with Tastytrade's custom session API.

**Current Status:** ✅ Working authentication with direct API integration (best practice for custom APIs)

**Next Phase:** 🔄 Enhanced security with httpOnly cookies and server-side session management

**Why Our Approach Works:** Unlike Auth.js/Lucia which expect OAuth2, our direct integration matches Tastytrade's actual authentication endpoints perfectly, following SvelteKit best practices for custom API integration.

## 📋 Detailed Implementation Plans

For specific implementation guidance, see our comprehensive sub-plans:

- **[📍 Master Roadmap](./docs/IMPLEMENTATION_ROADMAP.md)** - Complete project timeline with dependencies
- **[🔐 Authentication Security Migration](./docs/features/auth-security-migration.md)** - httpOnly cookies + server-side security
- **[📊 Watchlist Implementation](./docs/features/watchlist-implementation.md)** - CRUD operations + real-time quotes
- **[🏆 Bonus Features](./docs/features/bonus-features.md)** - Streaming data + symbol detail views

### Implementation Overview

- **Total Effort**: 89-116 hours across 3 phases
- **MVP Timeline**: 6-8 weeks (secure auth + core watchlist)
- **Full Features**: 8-10 weeks (including bonus streaming)
- **Risk Assessment**: Low risk for MVP, medium risk for enhanced features

**Ready to start building! See the [Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md) for next steps.** 🚀
