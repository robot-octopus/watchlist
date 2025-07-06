// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        email: string;
        username: string;
        name: string;
        nickname: string;
        'external-id': string;
        'is-confirmed': boolean;
        'is-two-factor-sessions-enforced': boolean;
      } | null;
      session: {
        token: string;
        isDemo: boolean;
        expiresAt: Date;
      } | null;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
