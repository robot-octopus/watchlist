import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Type inference from schema
export type LoginFormData = z.infer<typeof loginSchema>;

// Validation result types
export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  data?: LoginFormData;
}

// Helper function to validate and format errors
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

// Helper to get first error for a field
export function getFieldError(errors: Record<string, string>, field: string): string | null {
  return errors[field] || null;
}
