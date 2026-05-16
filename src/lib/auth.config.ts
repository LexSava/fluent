import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isOnboarded = (user as { isOnboarded?: boolean }).isOnboarded ?? false
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id ?? token.sub) as string
        ;(session.user as { isOnboarded?: boolean }).isOnboarded =
          (token.isOnboarded as boolean) ?? false
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
