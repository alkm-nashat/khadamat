import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma/Node.js imports).
 * Used by middleware for JWT session checking only.
 */
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are defined in auth.ts (Node.js only)

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token["id"]       = u.id;
        token["phone"]    = u.phone;
        token["username"] = u.username;
        token["role"]     = u.role;
        token["avatar"]   = u.avatar ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = token as any;
      session.user.id       = t["id"]       ?? "";
      session.user.phone    = t["phone"]    ?? "";
      session.user.username = t["username"] ?? "";
      session.user.role     = t["role"]     ?? "USER";
      session.user.avatar   = t["avatar"]   ?? null;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },
  // secret is auto-read from AUTH_SECRET / NEXTAUTH_SECRET env vars
};
