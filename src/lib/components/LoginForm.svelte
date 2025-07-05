<script lang="ts">
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
      // Note: Post-login redirect is handled automatically by the layout component
      // based on the intendedDestination in the auth store
    } catch (error) {
      console.error('Login failed:', error);
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

<div class="w-full max-w-md mx-auto">
  <div
    class="bg-surface-100-800-token rounded-lg p-8 shadow-2xl border border-surface-200-700-token"
  >
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-surface-900-50-token mb-2">Welcome Back</h1>
      <p class="text-surface-600-300-token">Sign in to your Tastytrade account</p>

      <!-- Show intended destination if available -->
      {#if authState.intendedDestination}
        <div
          class="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-500/30 rounded-lg"
        >
          <p class="text-sm text-primary-700 dark:text-primary-300">
            You'll be redirected to <strong>{authState.intendedDestination}</strong> after signing in
          </p>
        </div>
      {/if}
    </div>

    <!-- Login Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <!-- Username Field -->
      <div class="space-y-2">
        <label for="username" class="block text-sm font-medium text-surface-700-200-token">
          Username or Email
        </label>
        <div class="relative">
          <input
            id="username"
            type="text"
            bind:value={credentials.username}
            on:blur={() => handleFieldBlur('username')}
            placeholder="Enter your username or email"
            class="w-full px-4 py-3 bg-surface-50-900-token border border-surface-300-600-token rounded-lg text-surface-900-50-token placeholder-surface-500-400-token focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            class:!border-error-500={formErrors.username && touched.username}
            class:!ring-error-500={formErrors.username && touched.username}
            class:!focus:ring-error-500={formErrors.username && touched.username}
            disabled={authState.isLoading}
            autocomplete="username"
          />
          {#if formErrors.username && touched.username}
            <div class="absolute -bottom-5 left-0 text-error-500 text-sm">
              {formErrors.username}
            </div>
          {/if}
        </div>
      </div>

      <!-- Password Field -->
      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-surface-700-200-token">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={credentials.password}
            on:blur={() => handleFieldBlur('password')}
            placeholder="Enter your password"
            class="w-full px-4 py-3 bg-surface-50-900-token border border-surface-300-600-token rounded-lg text-surface-900-50-token placeholder-surface-500-400-token focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
            class:!border-error-500={formErrors.password && touched.password}
            class:!ring-error-500={formErrors.password && touched.password}
            class:!focus:ring-error-500={formErrors.password && touched.password}
            disabled={authState.isLoading}
            autocomplete="current-password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-500-400-token hover:text-surface-700-200-token transition-colors duration-200"
            on:click={togglePasswordVisibility}
            disabled={authState.isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                ></path>
              </svg>
            {/if}
          </button>
          {#if formErrors.password && touched.password}
            <div class="absolute -bottom-5 left-0 text-error-500 text-sm">
              {formErrors.password}
            </div>
          {/if}
        </div>
      </div>

      <!-- Error Message -->
      {#if authState.error}
        <div
          class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-500/50 rounded-lg p-4"
        >
          <div class="flex items-center">
            <svg class="w-5 h-5 text-error-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <div>
              <h3 class="text-error-600 dark:text-error-400 font-semibold">
                Authentication Failed
              </h3>
              <p class="text-error-700 dark:text-error-300 text-sm">{authState.error}</p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full btn variant-filled-primary font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={authState.isLoading}
      >
        {#if authState.isLoading}
          <div class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing in...
          </div>
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <!-- Footer -->
    <div class="mt-8 text-center space-y-2">
      <p class="text-sm text-surface-600-300-token">
        This is a demo application using Tastytrade's sandbox environment.
      </p>
      <p class="text-xs text-surface-500-400-token">
        Your credentials are used only for authentication and are not stored.
      </p>
    </div>
  </div>
</div>
