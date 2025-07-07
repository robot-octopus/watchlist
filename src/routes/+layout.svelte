<script>
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import Navbar from '$lib/components/Navbar/Navbar.svelte';

  import { Modal, Toast, initializeStores } from '@skeletonlabs/skeleton';

  import '../app.css';

  initializeStores();

  export let data;

  $: if (data) {
    auth.initialize(data.user, data.session);

    if (data.intendedDestination) {
      auth.setIntendedDestination(data.intendedDestination);
    }
  }

  $: if (browser && data) {
    auth.updateFromServer(data.user, data.session);

    if (data.intendedDestination) {
      auth.setIntendedDestination(data.intendedDestination);
    }
  }

  $: if (browser && $page && $auth) {
    const currentPath = $page.url.pathname;
    const isAuthenticated = $auth.isAuthenticated;

    if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/') {
      // Redirect to login (server should have already done this, but backup)
      goto('/login', { replaceState: true });
    }

    // If authenticated and on login page, redirect to home
    if (isAuthenticated && currentPath === '/login') {
      goto('/', { replaceState: true });
    }
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Navbar />

  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>
</div>

<!-- Skeleton UI Components -->
<Modal />
<Toast />

<!-- Custom Modal Styles -->
<style>
  :global(.modal-backdrop) {
    background-color: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(4px);
  }

  /* Light Theme Modal */
  :global(.modal) {
    background-color: white !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    border: 1px solid #e5e7eb !important;
    max-width: 28rem !important;
  }

  :global(.modal-header) {
    padding: 1.5rem 1.5rem 1rem 1.5rem !important;
    border-bottom: 1px solid #e5e7eb !important;
  }

  :global(.modal-header h3) {
    color: #111827 !important;
    font-size: 1.125rem !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }

  :global(.modal-body) {
    padding: 1rem 1.5rem !important;
    color: #374151 !important;
    line-height: 1.5 !important;
  }

  :global(.modal-footer) {
    padding: 1rem 1.5rem 1.5rem 1.5rem !important;
    border-top: 1px solid #e5e7eb !important;
    display: flex !important;
    justify-content: flex-end !important;
    gap: 0.75rem !important;
  }

  /* Dark Theme Modal */
  :global(.dark .modal) {
    background-color: #1f2937 !important;
    border-color: #374151 !important;
  }

  :global(.dark .modal-header) {
    border-bottom-color: #374151 !important;
  }

  :global(.dark .modal-header h3) {
    color: white !important;
  }

  :global(.dark .modal-body) {
    color: #d1d5db !important;
  }

  /* Additional modal text elements for better dark mode support */
  :global(.modal-header *) {
    color: #111827 !important;
  }

  :global(.dark .modal-header *) {
    color: white !important;
  }

  :global(.modal-body *) {
    color: #374151 !important;
  }

  :global(.dark .modal-body *) {
    color: #d1d5db !important;
  }

  :global(.dark .modal-footer) {
    border-top-color: #374151 !important;
  }

  /* Modal Buttons */
  :global(.modal-footer .btn) {
    padding: 0.5rem 1rem !important;
    border-radius: 0.5rem !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
    transition: all 0.2s !important;
    border: 1px solid !important;
  }

  /* Cancel Button */
  :global(.modal-footer .btn:first-child) {
    background-color: #f3f4f6 !important;
    color: #374151 !important;
    border-color: #d1d5db !important;
  }

  :global(.modal-footer .btn:first-child:hover) {
    background-color: #e5e7eb !important;
    border-color: #9ca3af !important;
  }

  :global(.dark .modal-footer .btn:first-child) {
    background-color: #374151 !important;
    color: #d1d5db !important;
    border-color: #4b5563 !important;
  }

  :global(.dark .modal-footer .btn:first-child:hover) {
    background-color: #4b5563 !important;
    border-color: #6b7280 !important;
  }

  /* Confirm Button */
  :global(.modal-footer .btn:last-child) {
    background-color: #dc2626 !important;
    color: white !important;
    border-color: #dc2626 !important;
  }

  :global(.modal-footer .btn:last-child:hover) {
    background-color: #b91c1c !important;
    border-color: #b91c1c !important;
  }

  /* Toast Styling */
  :global(.toast) {
    background: white !important;
    color: #374151 !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 0.5rem !important;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }

  :global(.dark .toast) {
    background: #1f2937 !important;
    color: #d1d5db !important;
    border-color: #374151 !important;
  }

  /* Success Toast */
  :global(.toast.variant-filled-success) {
    background: #059669 !important;
    color: white !important;
    border-color: #047857 !important;
  }

  /* Error Toast */
  :global(.toast.variant-filled-error) {
    background: #dc2626 !important;
    color: white !important;
    border-color: #b91c1c !important;
  }

  /* Warning Toast */
  :global(.toast.variant-filled-warning) {
    background: #d97706 !important;
    color: white !important;
    border-color: #b45309 !important;
  }
</style>
