import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().trim().min(2, 'Минимум 2 символа'),
  slug: z
    .string()
    .trim()
    .min(2, 'Минимум 2 символа')
    .regex(/^[a-z0-9-]+$/, 'Только латиница в нижнем регистре, цифры и дефис'),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  is_published: z.boolean().default(false),
})
export type CreateCourseInput = z.infer<typeof createCourseSchema>

export const updateCourseSchema = z.object({
  title: z.string().trim().min(2).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  cover_image_url: z.string().nullable().optional(),
  price_cents: z.number().int().min(0).optional(),
  old_price_cents: z.number().int().min(0).nullable().optional(),
  currency: z.string().optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  estimated_total_minutes: z.number().int().min(0).nullable().optional(),
  position: z.number().int().optional(),
})
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
