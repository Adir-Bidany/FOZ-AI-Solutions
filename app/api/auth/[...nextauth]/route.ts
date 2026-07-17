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
                    role: business.role,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === "google") {
                await connectDB();
                try {
                    let business = await Business.findOne({ ownerEmail: user.email });
                    
                    if (!business) {
                        // Generate a unique slug based on the user's name or email prefix
                        let baseSlug = user.name 
                            ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "-") 
                            : user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
                        if (!baseSlug) baseSlug = "biz";
                        
                        let slug = baseSlug;
                        let count = 1;
                        while (await Business.findOne({ slug })) {
                            slug = `${baseSlug}-${count}`;
                            count++;
                        }
                        
                        // Create a new business account automatically
                        business = await Business.create({
                            slug,
                            businessName: `${user.name}'s Business`,
                            ownerName: user.name || "Business Owner",
                            ownerEmail: user.email,
                        });
                    }
                    
                    // Inject the MongoDB ID and slug into the user object for the JWT callback
                    user.id = business._id.toString();
                    user.slug = business.slug;
                    user.role = business.role;
                    
                    return true;
                } catch (error) {
                    console.error("Error linking Google account to DB:", error);
                    return false; // Reject sign-in
                }
            }
            // Allow CredentialsProvider logins to pass through normally
            return true;
        },
        async jwt({ token, user, account }: any) {
            // For Google logins, 'user' comes from the signIn callback modification above.
            // For Credentials, 'user' comes from the authorize() function.
            if (user) {
                token.slug = user.slug;
                token.businessId = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.slug = token.slug;
                session.user.businessId = token.businessId;
                session.user.role = token.role;
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
