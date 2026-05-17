import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../validations/auth'

describe('LoginSchema', () => {
  it('accepts valid email and password', () => {
    const result = LoginSchema.safeParse({ email: 'user@test.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects empty email', () => {
    const result = LoginSchema.safeParse({ email: '', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = LoginSchema.safeParse({ email: 'notanemail', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = LoginSchema.safeParse({ email: 'user@test.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('RegisterSchema', () => {
  const valid = {
    name: 'Ivan',
    email: 'ivan@test.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  }

  it('accepts valid registration data', () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects name shorter than 2 characters', () => {
    expect(RegisterSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    expect(
      RegisterSchema.safeParse({ ...valid, password: 'password1!', confirmPassword: 'password1!' })
        .success
    ).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    expect(RegisterSchema.safeParse({ ...valid, confirmPassword: 'Different1!' }).success).toBe(
      false
    )
  })

  it('rejects password without special character', () => {
    expect(
      RegisterSchema.safeParse({ ...valid, password: 'Password1', confirmPassword: 'Password1' })
        .success
    ).toBe(false)
  })
})

describe('ForgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'user@test.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'invalid' }).success).toBe(false)
  })
})

describe('ResetPasswordSchema', () => {
  const valid = { password: 'NewPass1!', confirmPassword: 'NewPass1!' }

  it('accepts matching strong passwords', () => {
    expect(ResetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    expect(
      ResetPasswordSchema.safeParse({ password: 'NewPass1!', confirmPassword: 'Other1!' }).success
    ).toBe(false)
  })

  it('rejects weak password (no digit)', () => {
    expect(
      ResetPasswordSchema.safeParse({ password: 'Password!', confirmPassword: 'Password!' }).success
    ).toBe(false)
  })
})
