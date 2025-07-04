# Tastytrade Watchlist App Documentation

AI-first TDD-ready SvelteKit app with Skeleton UI and Tailwind CSS.

## 📚 Documentation Index

### Getting Started

- [Local Development Setup](LOCAL_DEV.md) - Environment setup and development workflow
- [Project Structure](STRUCTURE.md) - Codebase organization and architecture

### Development Guidelines

- [**Best Practices**](BEST_PRACTICES.md) - **Essential coding standards for Skeleton, Svelte, and Tailwind**
- [State Management](STATE_MANAGEMENT.md) - Store patterns and reactive state
- [Form Handling](FORM_HANDLING.md) - Form validation and submission patterns
- [API Integration](API_INTEGRATION.md) - Client setup and API communication

### Testing & Quality

- [Testing Guide](TESTING.md) - Unit tests, integration tests, and visual testing
- [TDD Workflow](TDD_WORKFLOW.md) - Test-driven development process

### Feature Development

- [**Feature Plans**](features/README.md) - **Use `@plan` in Cursor to generate comprehensive feature plans (DOCUMENTATION ONLY)**

## 🎯 Quick Start

1. **Read First**: [Best Practices Guide](BEST_PRACTICES.md) - Critical for maintaining code quality
2. **Setup**: [Local Development](LOCAL_DEV.md) - Get your environment running
3. **Understand**: [Project Structure](STRUCTURE.md) - Learn the codebase organization
4. **Plan Features**: Use `@plan [description]` in Cursor for structured feature planning (creates docs only)
5. **Test**: [Testing Guide](TESTING.md) - Run tests and understand the testing strategy

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

## 🚨 Important Notes

- **Theme Management**: Always use Skeleton's `data-mode` pattern, never custom implementations
- **Component Architecture**: Keep presentation separate from business logic
- **Testing**: Every component must have accompanying `.spec.ts` tests
- **Documentation**: Update this index when adding new documentation files
- **Feature Planning**: Always create a plan document before implementing new features (use `@plan`)

---

For questions or contributions, refer to the specific documentation files above.
