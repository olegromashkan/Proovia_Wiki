/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const u = process.env.ADMIN_USER || "admin";
        const p = process.env.ADMIN_PASS || "changeme";
        if (credentials?.username === u && credentials?.password === p) {
          return { id: "admin", name: "Admin", email: "admin@local" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }: { token: Record<string, unknown>; account?: { provider?: string }; profile?: unknown }) {
      if (account?.provider === "credentials") token.role = "admin";
      const prof = profile as Record<string, unknown> | null | undefined;
      if (account?.provider === "google" && prof && typeof prof.email === 'string') {
        const email = String(prof.email);
        const domain = process.env.ALLOWED_EMAIL_DOMAIN;
        if (domain && !email.endsWith(`@${domain}`)) throw new Error("unauthorized domain");
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown> }) {
      session.role = (token as Record<string, unknown>).role || "user";
      return session as Record<string, unknown>;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
};

const handler = NextAuth(authOptions as unknown as Parameters<typeof NextAuth>[0]);
export { handler as GET, handler as POST };
