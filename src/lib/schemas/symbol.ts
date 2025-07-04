import { z } from 'zod';

export const addSymbolSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z]+$/, 'Symbol must contain only uppercase letters'),
});

export type AddSymbolData = z.infer<typeof addSymbolSchema>;
