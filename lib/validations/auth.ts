import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Минимум 8 символов')
  .regex(/[A-Z]/, 'Нужна заглавная буква')
  .regex(/[0-9]/, 'Нужна цифра')

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z
    .string()
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Введите номер телефона'),
  password: passwordSchema,
  terms: z.boolean().refine((v) => v === true, 'Необходимо согласие с условиями'),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const forgotSchema = z.object({
  email: z.string().email('Введите корректный email'),
})
export type ForgotInput = z.infer<typeof forgotSchema>

export const resetSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  })
export type ResetInput = z.infer<typeof resetSchema>

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Код состоит из 6 цифр')
    .regex(/^\d+$/, 'Только цифры'),
})
export type OtpInput = z.infer<typeof otpSchema>
