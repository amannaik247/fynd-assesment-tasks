import { z } from 'zod';

export const FeedbackRequestSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating cannot exceed 5' }),
  review_text: z
    .string()
    .trim()
    .max(2000, { message: 'Review is too long (max 2000 chars)' })
    .optional()
    .or(z.literal('')),
});

export const FeedbackResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      ai_response: z.string(),
      id: z.string(),
    })
    .optional(),
  error: z.string().optional(),
});