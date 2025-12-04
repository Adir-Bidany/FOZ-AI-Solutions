import { connectToDatabase } from "../lib/db";
import Business from "../models/Business";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function fixOwnerName() {
    const slug = process.argv[2];
    const newName = process.argv[3];

    if (!slug || !newName) {
        console.error("Usage: npx tsx scripts/fix_owner_name.ts <slug> <new_name>");
        process.exit(1);
    }

    try {
        await connectToDatabase();
        console.log("Connected to DB");

        const business = await Business.findOne({ slug });
        if (!business) {
            console.error(`Business with slug '${slug}' not found.`);
            process.exit(1);
        }

        console.log(`Found business: ${business.businessName}`);
        console.log(`Current Owner Name: ${business.ownerName}`);

        business.ownerName = newName;
        await business.save();

        console.log(`✅ Successfully updated owner name to: ${newName}`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating owner name:", error);
        process.exit(1);
    }
}

fixOwnerName();
