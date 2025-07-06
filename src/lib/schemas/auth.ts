import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9_]{4,32}$/;
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .refine((val) => usernameRegex.test(val) || z.string().email().safeParse(val).success, {
      message: 'Please enter a valid username',
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  data?: LoginFormData;
}
export function validateLoginForm(data: unknown): ValidationResult {
  const result = loginSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      errors: {},
      data: result.data,
    };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const field = error.path[0] as string;
    if (!errors[field]) {
      errors[field] = error.message;
    }
  });

  return {
    success: false,
    errors,
  };
}
export function getFieldError(errors: Record<string, string>, field: string): string | null {
  return errors[field] || null;
}
