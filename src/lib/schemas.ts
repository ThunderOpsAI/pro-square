import { z } from 'zod';

export const QuoteInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid phone number').max(30),
  projectType: z.enum([
    'bathroom',
    'kitchen',
    'floor',
    'outdoor',
    'commercial',
    'other',
  ], {
    error: 'Please select a project type',
  }),
  message: z.string().min(10, 'Please describe your project (at least 10 characters)').max(3000),
  turnstileToken: z.string().optional(),
  source: z.string().optional(),
});

export type QuoteInput = z.infer<typeof QuoteInputSchema>;

export const CallClickSchema = z.object({
  intent: z.string().default('call_button'),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
});

export type CallClickInput = z.infer<typeof CallClickSchema>;

export const AdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid admin email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
