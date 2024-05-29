import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Entra from "next-auth/providers/microsoft-entra-id"

import prisma from "./lib/prisma";


export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Entra({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!,
      authorization: { params: { scope: "User.Read.All openid offline_access" } },
    }),
  ],
});
