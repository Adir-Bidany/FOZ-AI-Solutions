import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
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
                // Use Business model
                const business = await Business.findOne({
                    ownerEmail: credentials.email,
                });

                if (!business) {
                    throw new Error("משתמש לא נמצא");
                }

                // בדיקת מפתח מאסטר
                const isMasterPassword =
                    credentials.password === process.env.ADMIN_MASTER_PASSWORD;

                if (!isMasterPassword) {
                    // Note: Business model might not have password field yet if it was migrated from Client without it,
                    // or if we rely on Google Auth. Assuming we keep password auth for now.
                    // We need to check if Business schema has 'password' field.
                    // Based on previous context, Business merged Client fields.
                    // Let's assume 'password' exists or we need to add it to the interface if missing.

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        business.password || "" // Fallback if undefined
                    );
                    if (!isValid) {
                        throw new Error("סיסמה שגויה");
                    }
                }

                return {
                    id: business._id.toString(),
                    email: business.ownerEmail,
                    name: business.ownerName,
                    slug: business.slug,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.slug = user.slug;
                token.businessId = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.slug = token.slug;
                session.user.businessId = token.businessId;
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
