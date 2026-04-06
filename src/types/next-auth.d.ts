import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      role: string;
      phoneNumber?: string | null;
      profileImage: string | null;
      accessToken: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    phoneNumber?: string | null;
    profileImage: string | null;
    accessToken: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    phoneNumber?: string | null;
    profileImage: string | null;
    accessToken: string | null;
  }
}