import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, { message: 'Пароль должен содержать не менее 8 символов' })
  .max(100, { message: 'Пароль не должен превышать 100 символов' })
  .regex(/[A-Z]/, { message: 'Пароль должен содержать хотя бы одну заглавную букву' })
  .regex(/[a-z]/, { message: 'Пароль должен содержать хотя бы одну строчную букву' })
  .regex(/[0-9]/, { message: 'Пароль должен содержать хотя бы одну цифру' })
  .regex(/[!@#$%^&*]/, {
    message: 'Пароль должен содержать хотя бы один специальный символ (!@#$%^&*)',
  })

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Введите email' })
    .pipe(z.email({ message: 'Некорректный email адрес' })),
  password: z.string().min(1, { message: 'Введите пароль' }),
})

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Имя должно содержать не менее 2 символов' })
      .max(50, { message: 'Имя не должно превышать 50 символов' }),
    email: z.email({ message: 'Введите корректный email' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Подтвердите пароль' }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
      })
    }
  })

// Серверные схемы без confirmPassword (client-side only поле)
export const RegisterApiSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Имя должно содержать не менее 2 символов' })
    .max(50, { message: 'Имя не должно превышать 50 символов' }),
  email: z.email({ message: 'Введите корректный email' }),
  password: passwordSchema,
})

export const ResetPasswordApiSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: 'Введите корректный email' }),
})

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Подтвердите пароль' }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
      })
    }
  })

export type LoginFormData = z.infer<typeof LoginSchema>
export type RegisterFormData = z.infer<typeof RegisterSchema>
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>
