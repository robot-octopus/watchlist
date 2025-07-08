import '@testing-library/jest-dom';

// Ensure browser-like environment for Svelte 5 components
if (typeof global !== 'undefined') {
  // Ensure browser-like globals are available
  global.window = global.window || (globalThis as any);
  global.document = global.document || globalThis.document;
  global.navigator = global.navigator || { userAgent: 'test' };
  global.location = global.location || { href: 'http://localhost:3000' };

  // Ensure DOM is available for tests that need it
  if (typeof global.document === 'undefined' && typeof document !== 'undefined') {
    global.document = document;
  }
}

// Ensure document.body exists for component mounting
if (typeof document !== 'undefined' && document.createElement && !document.body) {
  try {
    document.body = document.createElement('body');
    if (document.documentElement) {
      document.documentElement.appendChild(document.body);
    }
  } catch {
    // Ignore DOM setup errors for tests that don't need DOM access
    console.debug('DOM setup not available for this test environment');
  }
}

// Ensure we're in browser mode for Svelte 5
Object.defineProperty(globalThis, 'window', {
  value: globalThis.window || global.window || {},
  writable: true,
});

// Set browser environment for Svelte
(globalThis as any).browser = true;
(globalThis as any).dev = false;

// Ensure process.browser is true for older checks
if (typeof process !== 'undefined') {
  (process as any).browser = true;
  (process as any).env = (process as any).env || {};
  (process as any).env.NODE_ENV = 'test';
}

// Mock browser APIs that might be missing in test environment
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver which is commonly used in Svelte components
global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

// Mock IntersectionObserver
global.IntersectionObserver =
  global.IntersectionObserver ||
  class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

// Ensure SvelteKit app environment
if (typeof globalThis !== 'undefined') {
  (globalThis as any).app = (globalThis as any).app || {};
  (globalThis as any).__sveltekit = (globalThis as any).__sveltekit || {};
}

// Mock implementations will be handled in individual test files as needed
