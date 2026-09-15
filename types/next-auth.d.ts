import type { AuthUser } from "@/types/auth";

/**
 * Module augmentation for next-auth's Session/User/JWT — carries
 * smarthub-api's access token and the mapped AuthUser shape through
 * NextAuth's own types instead of casting `as` everywhere they're read.
 */
declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: AuthUser;
  }

  interface User {
    accessToken?: string;
    authUser?: AuthUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    authUser?: AuthUser;
  }
}
