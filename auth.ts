import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { toAuthUser } from "@/lib/auth/to-auth-user";
import type { AuthUser } from "@/types/auth";
import type { ApiResponse } from "@/lib/api/types";

/**
 * Server-only call to smarthub-api's real login endpoint. Deliberately
 * NOT the browser-facing `apiClient` singleton (lib/api/client.ts) —
 * that instance assumes a browser context (reads the Zustand auth
 * store via `getState()` for the Authorization header, calls `sonner`
 * toasts on error). `authorize()` runs server-side inside the NextAuth
 * route handler; a raw fetch straight to the API is the correct shape
 * here, same pattern NextAuth's own credentials-provider docs use.
 *
 * Hits the API directly (not the /api-proxy dev rewrite in
 * next.config.ts) — that rewrite exists so the *browser* can reach a
 * second port the preview sandbox won't route to; server-side code has
 * no such restriction and talking to the API directly avoids a
 * self-referential server -> same Next server -> API round trip.
 */
const AUTH_API_URL = process.env.AUTH_API_URL || "http://localhost:6001/api/v1";

async function loginWithCredentials(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: AuthUser } | null> {
  const res = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return null;

  const envelope: ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: Parameters<typeof toAuthUser>[0];
  }> = await res.json();

  if (!envelope.success || !envelope.data?.accessToken) return null;

  // toAuthUser is the same whitelist-mapping used everywhere else in
  // the app — it explicitly picks safe fields off the raw API user
  // document. Never store the raw document: smarthub-api's login
  // service does not `.select("-password")`, so the raw object may
  // carry the password hash. Only the mapped AuthUser goes into the
  // session token.
  return {
    accessToken: envelope.data.accessToken,
    user: toAuthUser(envelope.data.user),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const result = await loginWithCredentials(email, password);
        if (!result) return null;

        // NextAuth's User type wants an `id`; smarthub-api's users key
        // on `_id`. Carry the full AuthUser + accessToken through so
        // the jwt callback below can lift them onto the token.
        return {
          id: result.user._id,
          accessToken: result.accessToken,
          authUser: result.user,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in call.
      if (user) {
        token.accessToken = user.accessToken as string;
        token.authUser = user.authUser as AuthUser;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: token.authUser as AuthUser,
      } as typeof session;
    },
  },
});
