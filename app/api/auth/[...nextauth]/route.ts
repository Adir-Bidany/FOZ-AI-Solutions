import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";

const handler = NextAuth({
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

                // חיפוש הלקוח
                const client = await Client.findOne({
                    email: credentials.email,
                });

                if (!client) {
                    throw new Error("משתמש לא נמצא");
                }

                // בדיקה האם הסיסמה שהוזנה תואמת לסיסמה המוצפנת ב-DB
                const isValid = await bcrypt.compare(
                    credentials.password,
                    client.password
                );

                if (!isValid) {
                    throw new Error("סיסמה שגויה");
                }

                // אם הכל תקין - מחזירים את פרטי המשתמש לסשן
                return {
                    id: client._id.toString(),
                    email: client.email,
                    name: client.ownerName,
                    slug: client.slug, // נצטרך את זה כדי לדעת לאיזה דשבורד לשלוח אותו
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.slug = user.slug; // שומרים את ה-slug בתוך הטוקן
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.slug = token.slug; // מעבירים את ה-slug לצד לקוח
            }
            return session;
        },
    },
    pages: {
        signIn: "/login", // דף ההתחברות שלנו
    },
});

export { handler as GET, handler as POST };
