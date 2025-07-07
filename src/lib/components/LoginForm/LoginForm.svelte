<script lang="ts">
  import { validateLoginForm } from '$lib/schemas/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

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

  let isLoading = false;
  let errorMessage = '';

  onMount(() => {
    const handleBeforeUnload = () => {};

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  function handleFieldBlur(field) {
    touched[field] = true;
    validateField();
  }

  function validateField() {
    const validation = validateLoginForm(credentials);
    formErrors = validation.errors;
    return validation.success;
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  $: if (touched.username || touched.password) {
    validateField();
  }

  async function handleSignIn() {
    if (isLoading) {
      return;
    }

    isLoading = true;
    errorMessage = '';

    touched.username = true;
    touched.password = true;

    const isValid = validateField();

    touched = { ...touched };
    formErrors = { ...formErrors };

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const result = await response.json();

      if (result.success && result.redirectTo) {
        errorMessage = '';

        setTimeout(async () => {
          try {
            window.location.href = result.redirectTo;
          } catch (error) {
            errorMessage = 'Login successful! Please navigate to /watchlist manually.';
          }
        }, 200);
      } else {
        errorMessage = result.error || 'Login failed';
      }
    } catch (error) {
      errorMessage = 'Network error - please try again';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="w-full max-w-md mx-auto">
  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
  >
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
      <p class="text-gray-600 dark:text-gray-300">Sign in to your Tastytrade account</p>
    </div>

    <div class="space-y-6">
      <div class="space-y-2">
        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Username or Email
        </label>
        <div class="relative">
          <input
            id="username"
            name="username"
            type="text"
            bind:value={credentials.username}
            on:blur={() => handleFieldBlur('username')}
            placeholder="Enter your username or email"
            class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            class:!border-red-500={formErrors.username && touched.username}
            class:!ring-red-500={formErrors.username && touched.username}
            class:!focus:ring-red-500={formErrors.username && touched.username}
            disabled={isLoading}
            autocomplete="username"
          />
          {#if formErrors.username && touched.username}
            <div class="absolute -bottom-5 left-0 text-red-500 text-sm">
              {formErrors.username}
            </div>
          {/if}
        </div>
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={credentials.password}
            on:blur={() => handleFieldBlur('password')}
            placeholder="Enter your password"
            class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
            class:!border-red-500={formErrors.password && touched.password}
            class:!ring-red-500={formErrors.password && touched.password}
            class:!focus:ring-red-500={formErrors.password && touched.password}
            disabled={isLoading}
            autocomplete="current-password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            on:click={togglePasswordVisibility}
            disabled={isLoading}
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
            <div class="absolute -bottom-5 left-0 text-red-500 text-sm">
              {formErrors.password}
            </div>
          {/if}
        </div>
      </div>

      {#if errorMessage}
        <div
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg p-4"
        >
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <div>
              <h3 class="text-red-600 dark:text-red-400 font-semibold">Authentication Failed</h3>
              <p class="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      {/if}

      <button
        type="button"
        on:click={handleSignIn}
        class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {#if isLoading}
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
    </div>
  </div>
</div>
