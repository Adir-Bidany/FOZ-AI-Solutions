import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The business's unique ID (MongoDB _id) */
            businessId: string
            /** The business's slug */
            slug: string
        } & DefaultSession["user"]
    }

    interface User {
        slug: string
        // id is already in User
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        businessId: string
        slug: string
    }
}
