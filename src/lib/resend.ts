import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName: string
): Promise<void> {
  await resend.emails.send({
    from: 'Fluent <onboarding@resend.dev>',
    to: email,
    subject: 'Восстановление пароля — Fluent',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1A1825;">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #7C6FCD;">Fluent</h2>
        <p>Привет${userName ? ', ' + userName : ''}!</p>
        <p style="color: #534AB7; margin-bottom: 24px; font-size: 14px;">
          Мы получили запрос на сброс пароля для вашего аккаунта.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; background: #7C6FCD; color: #fff; text-decoration: none;
                 padding: 12px 24px; border-radius: 5px; font-weight: 600; font-size: 14px;"
        >
          Сбросить пароль
        </a>
        <p style="margin-top: 24px; font-size: 13px; color: #8884AA;">
          Ссылка действительна в течение <strong>1 часа</strong>.<br/>
          Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.
        </p>
        <p style="font-size: 12px; color: #8884AA;">
          Если кнопка не работает, скопируйте ссылку: ${resetUrl}
        </p>
        <hr style="border: none; border-top: 1px solid #DDDAF0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #8884AA;">Fluent — Your AI language tutor</p>
      </div>
    `,
  })
}
