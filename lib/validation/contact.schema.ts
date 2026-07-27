import { z } from 'zod'

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email address').max(200),
  topic: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1, 'Message is required').max(5000),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
