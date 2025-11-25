import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("יש להזין אימייל וסיסמה");
                }

                await connectDB();

                // מציאת הלקוח לפי המייל
                const client = await Client.findOne({
                    email: credentials.email,
                });

                if (!client) {
                    throw new Error("משתמש לא נמצא");
                }

                // בדיקת מפתח מאסטר
                const isMasterPassword =
                    credentials.password === process.env.ADMIN_MASTER_PASSWORD;

                if (!isMasterPassword) {
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        client.password
                    );
                    if (!isValid) {
                        throw new Error("סיסמה שגויה");
                    }
                }

                return {
                    id: client._id.toString(),
                    email: client.email,
                    name: client.ownerName,
                    slug: client.slug,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.slug = user.slug;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.slug = token.slug;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
