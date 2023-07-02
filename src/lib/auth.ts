import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        CredentialsProvider({
            credentials:{
                username:{type:'text', placeholder:'test@test.com'},
                password:{type:'password', placeholder:'password'}
            },
            async authorize(credentials, req){
                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials?.username,
                    },
                  });
                if(!user) return null

                const isPasswordValid = await bcrypt.compare(credentials!.password, user.password)

                if(!isPasswordValid) return null


                return user
            }
        })
    ],

   callbacks:{
    session: ({ session, token }) => {
        console.log("Session Callback", { session, token });
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            randomKey: token.randomKey,
          },
        };
      },
        
      jwt: ({ token, user }) => {
        console.log("JWT Callback", { token, user });
        if (user) {
          const u = user as unknown as any;
          return {
            ...token,
            id: u.id,
            randomKey: u.randomKey,
          };
        }
        return token;
      },
    },

    // pages:{
    //     signIn:'/login'
    // },
    session: {
        strategy: "jwt",
    },
    // secret:process.env:JWT_SECRET
};
