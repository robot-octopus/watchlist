# Project Structure

## 🏗️ High-Level Architecture

```
watchlist/
├── src/
│   ├── routes/              # SvelteKit page routes
│   ├── lib/                 # Shared application logic
│   ├── app.html             # HTML shell
│   └── app.css              # Global styles
├── tests/                   # Playwright integration tests
├── docs/                    # Project documentation
└── static/                  # Static assets
```

## 📁 Detailed Structure

### `/src/routes/` - Page Routes

```
routes/
├── +layout.server.ts        # Server-side layout logic
├── +layout.svelte           # App shell with navigation
├── +page.server.ts          # Homepage server logic
├── +page.svelte             # Homepage component
├── api/                     # API endpoints
│   ├── auth/                # Authentication endpoints
│   └── theme/               # Theme toggle endpoint
├── login/                   # Login page
│   ├── +page.server.ts
│   └── +page.svelte
└── watchlist/               # Watchlist page
    ├── +page.server.ts
    └── +page.svelte
```

### `/src/lib/` - Shared Logic

#### API Layer

```
lib/api/
├── base-client.ts           # Base API client with auth
├── index.ts                 # API exports
├── clients/                 # API client implementations
│   ├── oauth.ts             # Authentication API
│   ├── quotes.ts            # Market quotes API
│   ├── watchlists.ts        # Watchlist CRUD API
│   ├── symbol-search.ts     # Symbol search API
│   ├── streaming.ts         # Real-time streaming API
│   └── market-metrics.ts    # Market data API
└── types/                   # TypeScript types
    ├── oauth.ts             # Auth types
    ├── instruments.ts       # Instrument types
    └── market-metrics.ts    # Market data types
```

#### Component Layer

```
lib/components/
├── LoginForm/               # Authentication components
│   ├── LoginForm.svelte
│   └── LoginForm.spec.ts
├── Navbar/                  # Navigation components
│   ├── Navbar.svelte
│   ├── Navbar.spec.ts
│   ├── ThemeToggle.svelte
│   └── ThemeToggle.spec.ts
├── Watchlist/               # Watchlist management
│   ├── WatchlistManager.svelte
│   ├── WatchlistCard.svelte
│   ├── WatchlistTable.svelte
│   ├── index.js             # Component exports
│   └── *.spec.ts            # Component tests
├── SymbolLookup/            # Symbol search & add
│   ├── AddSymbolForm.svelte
│   ├── SymbolSearch.svelte
│   ├── SymbolSearchInput.svelte
│   ├── index.js             # Component exports
│   └── *.spec.ts            # Component tests
├── Chart(unused)/           # Unused chart components
└── StreamingChart.svelte    # Active chart component
```

#### Business Logic Layer

```
lib/
├── stores/                  # Svelte stores (state management)
│   ├── auth.ts              # Authentication state
│   └── auth.spec.ts
├── schemas/                 # Validation schemas
│   ├── auth.ts              # Auth form validation
│   ├── symbol.ts            # Symbol validation
│   └── *.spec.ts            # Schema tests
├── config/                  # Application configuration
│   ├── routes.ts            # Route definitions
│   └── routes.spec.ts
└── utils/                   # Utility functions
    ├── auth-validation.ts   # Auth helpers
    ├── token-storage.ts     # Token management
    ├── watchlist-actions.ts # Watchlist business logic
    ├── mock-stock-data.ts   # Test data
    └── *.spec.ts            # Utility tests
```

#### Streaming Layer

```
lib/streaming/
├── dxlink-streamer.ts      # DXLink WebSocket streaming
├── mock-streamer.ts        # Mock streaming for development
└── streamQuotes.ts         # Quote streaming utilities
```

### `/tests/` - Integration Tests

```
tests/
├── app.spec.ts             # Main application tests
├── auth-login.spec.ts      # Authentication flow tests
├── login-integration.spec.ts # Login integration tests
├── navbar-simple.spec.ts   # Basic navbar tests
├── navbar-visual.spec.ts   # Visual navbar tests
├── navbar.spec.ts          # Navbar functionality tests
├── protected-routes.spec.ts # Route protection tests
├── visual-debugging.spec.ts # Visual debugging tests
└── *.spec.ts-snapshots/    # Visual test snapshots
```

### `/docs/` - Documentation

```
docs/
├── README.md               # Documentation index
├── STRUCTURE.md            # This file
├── TESTING.md              # Testing guide
├── IMPLEMENTATION_ROADMAP.md # Project roadmap
├── LOCAL_DEV.md            # Development setup
├── API_INTEGRATION.md      # API integration guide
├── FORM_HANDLING.md        # Form patterns
├── TDD_WORKFLOW.md         # TDD process
└── features/               # Feature documentation
    ├── README.md           # Feature index
    ├── watchlist-implementation.md
    ├── auth-security-migration.md
    ├── auth-route-protection.md
    ├── auth-login-prompt.md
    ├── bonus-features.md
    └── archived/           # Archived features
```

## 🎯 Key Architectural Principles

### 1. **Layer Separation**

- **Routes**: Page-level logic and server-side operations
- **Components**: Reusable UI components with tests
- **API**: External service communication
- **Stores**: Application state management
- **Utils**: Pure business logic functions

### 2. **Component Organization**

- **Folder-based**: Related components grouped in directories
- **Index exports**: Clean import paths via `index.js` files
- **Co-located tests**: Each component has accompanying `.spec.ts` file

### 3. **API Architecture**

- **Base client**: Shared authentication and error handling
- **Specialized clients**: Domain-specific API operations
- **Type safety**: Full TypeScript coverage for API contracts

### 4. **Testing Strategy**

- **Unit tests**: Co-located with source files (`.spec.ts`)
- **Integration tests**: Playwright tests in `/tests/` directory
- **Visual tests**: Screenshot-based regression testing

### 5. **Configuration**

- **Centralized routes**: Route definitions in `lib/config/routes.ts`
- **Environment-aware**: Different configs for dev/test/prod
- **Type-safe**: All configuration properly typed

## 📂 Import Patterns

### Recommended Import Paths

```typescript
// Components (using index exports)
import { WatchlistManager, WatchlistCard } from '$lib/components/Watchlist';
import { AddSymbolForm, SymbolSearch } from '$lib/components/SymbolLookup';

// API clients
import { OAuthClient } from '$lib/api/clients/oauth';
import { WatchlistsClient } from '$lib/api/clients/watchlists';

// Stores and utilities
import { authStore } from '$lib/stores/auth';
import { tokenStorage } from '$lib/utils/token-storage';

// Types
import type { Quote } from '$lib/api/types/market-metrics';
import type { Watchlist } from '$lib/api/types/instruments';
```

### Avoid These Patterns

```typescript
// ❌ Direct file imports (breaks encapsulation)
import WatchlistManager from '$lib/components/Watchlist/WatchlistManager.svelte';

// ❌ Relative imports outside same directory
import { auth } from '../../../stores/auth';

// ✅ Use index exports and $lib alias instead
import { WatchlistManager } from '$lib/components/Watchlist';
import { authStore } from '$lib/stores/auth';
```

## 🔧 Configuration Files

| File                   | Purpose                        |
| ---------------------- | ------------------------------ |
| `svelte.config.js`     | SvelteKit configuration        |
| `vite.config.ts`       | Vite build configuration       |
| `vitest.config.ts`     | Unit test configuration        |
| `playwright.config.ts` | Integration test configuration |
| `tailwind.config.js`   | Tailwind CSS configuration     |
| `eslint.config.js`     | Linting rules                  |
| `tsconfig.json`        | TypeScript configuration       |

## 🚀 Development Workflow

1. **Components**: Develop in isolation with tests
2. **Integration**: Connect via routes and stores
3. **API**: Mock first, integrate later
4. **Testing**: Unit tests first, integration tests second
5. **Documentation**: Update docs with new features

This structure supports scalable development with clear separation of concerns and comprehensive testing.
