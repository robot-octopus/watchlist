# Tastytrade Watchlist App

**Private Repository** - SvelteKit financial watchlist application with Skeleton UI and Tailwind CSS.

## 🏗️ Tech Stack

- **SvelteKit 2.x** with Svelte 5 runes
- **Skeleton UI 3.x** for components and design system
- **Tailwind CSS 3.x** for styling
- **TypeScript** for type safety
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **pnpm** for package management

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run tests
pnpm run test

# Quality check (format, lint, type-check, test)
pnpm run quality:check
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Development Setup](./docs/LOCAL_DEV.md)** - Environment setup and workflow
- **[Best Practices](./docs/BEST_PRACTICES.md)** - Essential coding standards
- **[Testing Guide](./docs/TESTING.md)** - Testing strategies and commands
- **[Project Structure](./docs/STRUCTURE.md)** - Codebase organization

## 🧪 Testing

- **Unit Tests**: `pnpm run test:unit` (Vitest with Testing Library)
- **E2E Tests**: `pnpm run test:integration` (Playwright)
- **Visual Tests**: `pnpm run test:screenshots` (Visual regression)

## 🔧 Development Commands

```bash
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run preview          # Preview production build
pnpm run format           # Format code with Prettier
pnpm run lint             # Lint code with ESLint
pnpm run lint:fix         # Auto-fix linting issues
pnpm run check            # TypeScript type checking
pnpm run generate:types   # Generate API types from OpenAPI specs
```

## 📋 Quality Standards

This project enforces strict quality standards:

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Testing**: Comprehensive unit and E2E tests
- **TDD**: Test-driven development workflow

All code must pass quality checks before committing:

```bash
pnpm run quality:check
```

## 🎯 Development Principles

1. **Framework Best Practices**: Follow Skeleton UI, Svelte, and Tailwind conventions
2. **Test-Driven Development**: Write tests before implementation
3. **Component Isolation**: Self-contained, testable components
4. **Accessibility First**: WCAG compliant UI components
5. **Mobile-First**: Responsive design from smallest screens up
6. **Type Safety**: Comprehensive TypeScript coverage

## 🔒 Private Repository

This is a private repository. All development should follow internal coding standards and security practices.

---

For detailed development guidelines, see the [documentation](./docs/README.md).
