# Local Development

## 🚀 **Quick Start**

```bash
# Clone and setup
git clone <repository-url>
cd watchlist

# Install dependencies
pnpm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

## 📋 **Prerequisites**

### **Required Software**

- **Node.js**: v18+ (recommended: v20+)
- **pnpm**: v8+ (package manager)
- **Git**: Latest version
- **VS Code**: Recommended editor with extensions

### **Recommended VS Code Extensions**

- **Svelte for VS Code**: Syntax highlighting and IntelliSense
- **Tailwind CSS IntelliSense**: Class name completion
- **TypeScript Importer**: Auto-import management
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🔧 **Development Environment Setup**

### **1. Repository Setup**

```bash
# Clone repository
git clone <repository-url>
cd watchlist

# Verify Node.js version
node --version  # Should be v18+

# Install pnpm if needed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### **2. Environment Configuration**

```bash
# Copy environment template (if exists)
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your settings
```

### **3. Verify Installation**

```bash
# Run development server
npm run dev

# Verify in browser at http://localhost:5173
# Should see login page
```

## 🛠️ **Available Scripts**

### **Development**

```bash
npm run dev          # Start development server (port 5173)
npm run dev -- --port 3000  # Start on custom port
npm run dev -- --host       # Expose to network
```

### **Building**

```bash
npm run build        # Production build
npm run preview      # Preview production build
```

### **Testing**

```bash
npm run test         # Run unit tests only (integration tests disabled)
npm run test:unit    # Run unit tests only
# npm run test:integration  # DISABLED: API endpoint issues
npm run test:watch   # Watch mode for unit tests
npm run test:ui      # Vitest UI for unit tests
```

### **Code Quality**

```bash
npm run lint         # ESLint code linting
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier code formatting
npm run type-check   # TypeScript type checking
```

### **Testing Utilities**

```bash
# Integration tests - TEMPORARILY DISABLED due to API issues
# npm run test:headed     # Run Playwright with browser UI
# npm run test:debug      # Debug Playwright tests
# npm run test:report     # Open Playwright HTML report

# Visual tests - WORKING
npm run test:screenshots # Update visual snapshots
```

## 🏗️ **Project Structure Overview**

```
watchlist/
├── src/
│   ├── routes/             # SvelteKit pages and API routes
│   ├── lib/                # Shared components and logic
│   │   ├── components/     # UI components
│   │   ├── api/           # API clients
│   │   ├── stores/        # Svelte stores
│   │   ├── utils/         # Utility functions
│   │   └── schemas/       # Validation schemas
│   ├── app.html           # HTML shell
│   └── app.css            # Global styles
├── tests/                 # Playwright integration tests
├── docs/                  # Project documentation
└── static/                # Static assets
```

## 🔑 **Demo Credentials**

For development and testing:

```
Username: demo@tastytrade.com
Password: demo123
```

**Note**: These credentials work with the development environment and provide access to sample watchlist data.

## 🌐 **Development URLs**

- **App**: http://localhost:5173
- **Vitest UI**: http://localhost:51204 (when running `npm run test:ui`)
- **Build Preview**: http://localhost:4173 (when running `npm run preview`)

## 🧪 **Testing Workflow**

### **Running Tests During Development**

```bash
# Start development server in one terminal
npm run dev

# Run unit tests in watch mode in another terminal
npm run test:watch

# Note: Integration tests temporarily disabled due to API endpoint issues
# Visual tests still available for UI regression testing
```

### **Test Structure**

- **Unit Tests**: Co-located with components (`.spec.ts` files)
- **Integration Tests**: In `/tests/` directory using Playwright
- **Visual Tests**: Screenshot-based regression testing

### **Writing New Tests**

```bash
# Create new component test
touch src/lib/components/MyComponent.spec.ts

# Run specific test file
npm run test:unit -- MyComponent
```

## 🎨 **UI Development**

### **Design System**

- **Skeleton UI**: Component library for consistent UI
- **Tailwind CSS**: Utility-first styling
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach

### **Component Development**

```bash
# Component structure
src/lib/components/
├── MyFeature/
│   ├── MyComponent.svelte
│   ├── MyComponent.spec.ts
│   └── index.js          # Export file
```

### **Styling Guidelines**

- Use Skeleton UI components when possible
- Follow Tailwind CSS patterns
- Ensure mobile-responsive design
- Test both light and dark themes

## 🔧 **API Development**

### **API Client Structure**

```bash
src/lib/api/
├── base-client.ts         # Shared client logic
├── clients/               # API-specific clients
│   ├── oauth.ts          # Authentication
│   ├── watchlists.ts     # Watchlist CRUD
│   └── quotes.ts         # Market data
└── types/                # TypeScript types
```

### **Adding New API Endpoints**

1. Add client method in appropriate file
2. Add TypeScript types
3. Write unit tests
4. Update documentation

## 🐛 **Debugging**

### **Browser DevTools**

- **Console**: Check for errors and API calls
- **Network**: Monitor API requests/responses
- **Application**: Inspect localStorage and cookies
- **Sources**: Set breakpoints in TypeScript/Svelte code

### **VS Code Debugging**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug SvelteKit",
  "program": "${workspaceFolder}/node_modules/@sveltejs/kit/bin/vite",
  "args": ["dev"],
  "console": "integratedTerminal"
}
```

### **Common Issues & Solutions**

#### **Port Already in Use**

```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

#### **Node Modules Issues**

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### **Type Errors**

```bash
# Run type checking
npm run type-check

# Clear TypeScript cache
rm -rf .svelte-kit
```

## 📱 **Mobile Testing**

### **Browser DevTools**

- Use responsive design mode
- Test on various screen sizes
- Verify touch interactions

### **Device Testing**

```bash
# Expose dev server to network
npm run dev -- --host

# Access from mobile device using your IP
# http://192.168.1.x:5173
```

## 🚀 **Performance Monitoring**

### **Development Metrics**

- **Hot Reload**: Should be <1 second
- **Initial Load**: <3 seconds for first page
- **Bundle Size**: Monitor with `npm run build`

### **Optimization Tips**

- Use dynamic imports for large dependencies
- Optimize images and assets
- Monitor bundle analyzer output
- Test on slower devices/networks

## 🔄 **Git Workflow**

### **Branch Strategy**

```bash
# Feature development
git checkout -b feature/my-feature
git commit -am "Add feature description"
git push origin feature/my-feature

# Create pull request for review
```

### **Commit Guidelines**

- Use descriptive commit messages
- Include test changes with features
- Keep commits focused and atomic

## 📚 **Learning Resources**

### **Framework Documentation**

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Docs](https://svelte-5-preview.vercel.app/docs)
- [Skeleton UI Docs](https://www.skeleton.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **Testing Resources**

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)

## 🎯 **Development Checklist**

### **Before Starting Development**

- [ ] Node.js v18+ installed
- [ ] pnpm installed globally
- [ ] Repository cloned and dependencies installed
- [ ] Development server running
- [ ] Demo credentials tested

### **Before Committing**

- [ ] All tests passing (`npm test`)
- [ ] Code linted and formatted (`npm run lint && npm run format`)
- [ ] TypeScript checks passing (`npm run type-check`)
- [ ] Manual testing completed
- [ ] Documentation updated if needed

### **Ready for Production**

- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] Integration tests pass
- [ ] Performance acceptable
- [ ] Security review completed

---

## 🆘 **Getting Help**

### **Common Commands Reference**

```bash
# Quick development cycle
npm run dev         # Start development
npm run test:watch  # Run tests in watch mode
npm run lint:fix    # Fix code issues

# Full quality check
npm test           # All tests
npm run type-check # TypeScript
npm run lint       # Code quality
```

### **Project Documentation**

- [Project Structure](STRUCTURE.md)
- [Testing Guide](TESTING.md)
- [API Integration](API_INTEGRATION.md)
- [Form Handling](FORM_HANDLING.md)

**🚀 Happy developing!**
