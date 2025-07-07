# Tastytrade Watchlist App Documentation

AI-first TDD-ready SvelteKit app with Skeleton UI and Tailwind CSS.

## 📚 Documentation Index

### Getting Started

- [Local Development Setup](LOCAL_DEV.md) - Environment setup and development workflow
- [Project Structure](STRUCTURE.md) - Codebase organization and architecture

### Development Guidelines

- [Form Handling](FORM_HANDLING.md) - Form validation and submission patterns
- [API Integration](API_INTEGRATION.md) - Client setup and API communication
- [TDD Workflow](TDD_WORKFLOW.md) - Test-driven development process

### Testing & Quality

- [Testing Guide](TESTING.md) - Unit tests, integration tests, and visual testing

### Feature Development

- [**Feature Plans**](features/README.md) - **Use `@plan` in Cursor to generate comprehensive feature plans (DOCUMENTATION ONLY)**
- [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md) - Project progress and milestones

## 🎯 Quick Start

1. **Setup**: [Local Development](LOCAL_DEV.md) - Get your environment running
2. **Understand**: [Project Structure](STRUCTURE.md) - Learn the codebase organization
3. **Plan Features**: Use `@plan [description]` in Cursor for structured feature planning (creates docs only)
4. **Test**: [Testing Guide](TESTING.md) - Run tests and understand the testing strategy

## 🏗️ Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5
- **UI Library**: Skeleton UI 3.x
- **Styling**: Tailwind CSS 3.x
- **Testing**: Vitest (unit) + Playwright (integration)
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📋 Key Principles

1. **Follow Framework Conventions**: Always use Skeleton, Svelte, and Tailwind best practices
2. **Test-Driven Development**: Write tests before implementation
3. **Component Isolation**: Each component should be self-contained and testable
4. **Accessibility First**: All UI components must be keyboard and screen reader accessible
5. **Mobile-First**: Responsive design starting from mobile viewports
6. **Type Safety**: Comprehensive TypeScript coverage
7. **Planned Development**: Use `@plan` for systematic feature planning

## 🚀 AI-Assisted Development

### Feature Planning (Documentation Only)

Use Cursor's AI to generate comprehensive feature plans:

```
@plan add symbol search with autocomplete functionality
```

**Creates ONLY documentation** including:

- Technical architecture planning
- UI/UX implementation strategy
- Testing strategy outline
- Implementation phases breakdown
- Quality checklist template

### Development Flow

1. **📋 Plan**: Use `@plan` to create feature documentation (NO CODE)
2. **👀 Review**: Team reviews the planning document
3. **🔨 Implement**: Follow TDD in separate development session
4. **✅ Quality**: Run `pnpm run quality:check` before commits
5. **📦 Complete**: Mark feature as done and archive plan

## ✅ Current Implementation Status

### ✅ **Completed Features**

- **Authentication System**: Login/logout with session management
- **Route Protection**: Server-side route guards
- **Component Organization**: Organized into feature-based folders
- **Watchlist Management**: CRUD operations for watchlists
- **Symbol Management**: Add/remove symbols with search
- **Real-time Quotes**: Quote polling and display
- **Responsive Design**: Mobile-first UI with Skeleton components
- **Comprehensive Testing**: Unit and integration test coverage

### 🔄 **Current Architecture**

```
Components:
├── Watchlist/              # ✅ Complete watchlist management
│   ├── WatchlistManager    # Main watchlist interface
│   ├── WatchlistCard       # Individual watchlist display
│   └── WatchlistTable      # Symbol quotes table
├── SymbolLookup/           # ✅ Symbol search & add functionality
│   ├── AddSymbolForm       # Form to add new symbols
│   ├── SymbolSearch        # Search interface
│   └── SymbolSearchInput   # Search input component
├── LoginForm/              # ✅ Authentication interface
└── Navbar/                 # ✅ Navigation with theme toggle

API Clients:
├── oauth.ts                # ✅ Authentication API
├── watchlists.ts           # ✅ Watchlist CRUD
├── quotes.ts               # ✅ Real-time quotes
├── symbol-search.ts        # ✅ Symbol search
└── market-metrics.ts       # ✅ Market data

Business Logic:
├── auth.ts                 # ✅ Authentication store
├── watchlist-actions.ts    # ✅ Watchlist business logic
├── token-storage.ts        # ✅ Secure token management
└── auth-validation.ts      # ✅ Auth helpers
```

## 🧪 Testing Strategy

### ✅ **Test Coverage Status**

- **Unit Tests**: 108+ passing tests across all components
- **Integration Tests**: Temporarily disabled (API endpoint issues)
- **Visual Tests**: Screenshot-based regression testing
- **Component Tests**: Every component has accompanying `.spec.ts`

### Test Commands

```bash
# Unit tests
npm run test:unit           # Run all Vitest unit tests

# Integration tests - TEMPORARILY DISABLED
# npm run test:integration   # Disabled due to API issues
# npm run test:headed        # Disabled due to API issues
# npm run test:debug         # Disabled due to API issues

# Visual tests
npm run test:visual         # Visual debugging tests
npm run test:screenshots    # Update visual snapshots
```

## 🚨 Important Notes

- **Theme Management**: Always use Skeleton's `data-mode` pattern, never custom implementations
- **Component Architecture**: Keep presentation separate from business logic
- **Testing**: Every component must have accompanying `.spec.ts` tests
- **Documentation**: Update this index when adding new documentation files
- **Feature Planning**: Always create a plan document before implementing new features (use `@plan`)

## 🔧 Development Commands

```bash
# Development
npm run dev                 # Start development server

# Testing
npm run test               # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only

# Building
npm run build              # Production build
npm run preview            # Preview build

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
```

## 📱 Mobile Support

The application is fully responsive and optimized for:

- **Desktop**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari, Chrome Mobile (latest 2 versions)
- **Tablet**: iPad Safari, Android Chrome

## 🔒 Security Features

- **httpOnly Cookies**: Secure token storage (planned)
- **Route Protection**: Server-side authentication guards
- **CSRF Protection**: SameSite cookies + validation
- **Type Safety**: Full TypeScript coverage prevents runtime errors

---

For questions or contributions, refer to the specific documentation files above.
