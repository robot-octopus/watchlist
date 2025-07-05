<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { validateLoginForm } from '$lib/schemas/auth';

  let credentials = {
    username: '',
    password: '',
  };

  let showPassword = false;
  let formErrors = {};
  let touched = {
    username: false,
    password: false,
  };

  // Redirect if already authenticated
  onMount(() => {
    if (browser) {
      const unsubscribe = authStore.subscribe((state) => {
        if (state.isAuthenticated) {
          goto('/');
        }
      });
      return unsubscribe;
    }
  });

  // Real-time validation on blur
  function handleFieldBlur(field) {
    touched[field] = true;
    validateField();
  }

  // Validate individual fields or entire form
  function validateField() {
    const validation = validateLoginForm(credentials);
    formErrors = validation.errors;
    return validation.success;
  }

  async function handleSubmit() {
    // Mark all fields as touched and validate
    touched.username = true;
    touched.password = true;

    const isValid = validateField();

    // Force reactive update to show errors
    touched = { ...touched };
    formErrors = { ...formErrors };

    if (!isValid) return;

    try {
      await authStore.login(credentials);
      // Redirect handled by onMount subscription
    } catch (error) {
      console.error('Login failed:', error);
      // Error state is handled by the auth store
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  // Subscribe to auth store for reactive updates
  $: authState = $authStore;

  // Reactive validation when credentials change
  $: if (touched.username || touched.password) {
    validateField();
  }
</script>

<svelte:head>
  <title>Login - Tastytrade Watchlist</title>
  <meta name="description" content="Sign in to your Tastytrade account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-surface-50-900-token p-4">
  <div class="card w-full max-w-md p-8 space-y-6 shadow-xl">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Welcome Back</h1>
      <p class="text-surface-600 dark:text-surface-400">Sign in to your Tastytrade account</p>
    </div>

    <!-- Login Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <!-- Username Field -->
      <label class="label">
        <span>Username or Email</span>
        <input
          id="username"
          type="text"
          bind:value={credentials.username}
          on:blur={() => handleFieldBlur('username')}
          placeholder="Enter your username or email"
          class="input"
          class:!border-error-500={formErrors.username && touched.username}
          disabled={authState.isLoading}
          autocomplete="username"
        />
        {#if formErrors.username && touched.username}
          <div class="text-error-500 text-sm">{formErrors.username}</div>
        {/if}
      </label>

      <!-- Password Field -->
      <label class="label">
        <span>Password</span>
        <div class="input-group input-group-divider grid-cols-[1fr_auto]">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={credentials.password}
            on:blur={() => handleFieldBlur('password')}
            placeholder="Enter your password"
            class="input"
            class:!border-error-500={formErrors.password && touched.password}
            disabled={authState.isLoading}
            autocomplete="current-password"
          />
          <button
            type="button"
            class="btn btn-sm variant-ghost-surface"
            on:click={togglePasswordVisibility}
            disabled={authState.isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {#if formErrors.password && touched.password}
          <div class="text-error-500 text-sm">{formErrors.password}</div>
        {/if}
      </label>

      <!-- Error Message -->
      {#if authState.error}
        <aside class="alert variant-filled-error">
          <div class="alert-message">
            <h3 class="h4">Authentication Failed</h3>
            <p>{authState.error}</p>
          </div>
        </aside>
      {/if}

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn variant-filled-primary w-full"
        disabled={authState.isLoading}
      >
        {#if authState.isLoading}
          <span class="animate-pulse">⏳</span>
          <span>Signing in...</span>
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <!-- Footer -->
    <div class="text-center space-y-2">
      <p class="text-sm text-surface-600 dark:text-surface-400">
        This is a demo application using Tastytrade's sandbox environment.
      </p>
      <p class="text-xs text-surface-500 dark:text-surface-500">
        Your credentials are used only for authentication and are not stored.
      </p>
    </div>
  </div>
</div>
