import { connectToDatabase } from "@/lib/db";
import AgentPromptBlock from "@/models/AgentPromptBlock";
import { AGENT_REGISTRY } from "./registry";
import { seedInitialPromptBlocks } from "./seed";

/**
 * Replaces context placeholders in prompt text with actual runtime business variables.
 */
function interpolateVariables(template: string, context: any): string {
    if (!template) return "";

    const businessName = context?.businessName || context?.business_name || "העסק";
    const ownerName = context?.ownerName || context?.owner_name || "בעל העסק";
    const phone = context?.phone || "לא צוין";
    const address = context?.address || "לא צוינה";
    const tone = context?.ai_settings?.tone || context?.managerPersona?.tone || "חם, אמפתי ומקצועי";
    const authStatus = context?.customer_auth_status || "אורח לא מחובר";
    const clientHistory = context?.client_history_summary || "אין היסטוריה קודמת.";
    const publicInstructions = typeof context?.publicInstructions === "string" 
        ? context.publicInstructions 
        : JSON.stringify(context?.publicInstructions || "");
    const internalNotes = typeof context?.internalNotes === "string" 
        ? context.internalNotes 
        : JSON.stringify(context?.internalNotes || "");
    const openingHours = JSON.stringify(context?.operational_settings?.opening_hours || {});
    const services = JSON.stringify(context?.operational_settings?.services || []);

    return template
        .replace(/\$\{context\.businessName\}/g, businessName)
        .replace(/\{businessName\}/g, businessName)
        .replace(/\$\{context\.ownerName\}/g, ownerName)
        .replace(/\{ownerName\}/g, ownerName)
        .replace(/\$\{context\.phone\}/g, phone)
        .replace(/\{phone\}/g, phone)
        .replace(/\$\{context\.address\}/g, address)
        .replace(/\{address\}/g, address)
        .replace(/\$\{context\?\.ai_settings\?\.tone\}/g, tone)
        .replace(/\{tone\}/g, tone)
        .replace(/\$\{context\?\.customer_auth_status\}/g, authStatus)
        .replace(/\{authStatus\}/g, authStatus)
        .replace(/\$\{context\?\.client_history_summary\}/g, clientHistory)
        .replace(/\{clientHistory\}/g, clientHistory)
        .replace(/\$\{JSON\.stringify\(context\?\.publicInstructions\)\}/g, publicInstructions)
        .replace(/\$\{JSON\.stringify\(context\?\.internalNotes\)\}/g, internalNotes)
        .replace(/\$\{JSON\.stringify\(context\?\.operational_settings\?\.opening_hours\)\}/g, openingHours)
        .replace(/\$\{JSON\.stringify\(context\?\.operational_settings\?\.services\)\}/g, services);
}

/**
 * Assembles a dynamic, modular system prompt for a specific agent persona
 * by fetching active GLOBAL + persona-specific blocks from MongoDB.
 */
export async function assembleDynamicSystemPrompt(
    agentPersona: "paz" | "foz" | "daniela" | "golda" | string,
    businessContext: any
): Promise<string> {
    await connectToDatabase();

    const rawPersona = (agentPersona || "daniela").toLowerCase();
    const normalizedPersona = rawPersona === "foz" ? "paz" : rawPersona;
    const scopeKey = normalizedPersona.toUpperCase(); // "PAZ", "DANIELA", "GOLDA"

    // Query active blocks matching GLOBAL + current scope (plus legacy FOZ if PAZ)
    const validScopes = ["GLOBAL", scopeKey];
    if (scopeKey === "PAZ") validScopes.push("FOZ");

    // 1. Fetch active blocks
    let blocks = await AgentPromptBlock.find({
        is_active: true,
        target_scope: { $in: validScopes },
    })
        .sort({ sort_order: 1 })
        .lean();

    // 2. If DB is empty, trigger initial seeding once and refetch
    if (!blocks || blocks.length === 0) {
        await seedInitialPromptBlocks();
        blocks = await AgentPromptBlock.find({
            is_active: true,
            target_scope: { $in: validScopes },
        })
            .sort({ sort_order: 1 })
            .lean();
    }

    // 3. Fallback to static registry prompt if still no blocks found
    if (!blocks || blocks.length === 0) {
        const fallbackFn = AGENT_REGISTRY[normalizedPersona]?.systemPrompt || AGENT_REGISTRY.daniela.systemPrompt;
        return fallbackFn(businessContext);
    }

    // 4. Concatenate prompt blocks
    let compiledPrompt = blocks
        .map((b: any) => `\n\n# ${b.topic_title}\n${b.content}`)
        .join("");

    // 5. Interpolate variables and append real-time business context
    compiledPrompt = interpolateVariables(compiledPrompt, businessContext);

    // Append live context block if not explicitly present in template
    if (normalizedPersona === "daniela" && !compiledPrompt.includes("הקשר עסקי ונתונים בזמן אמת")) {
        const publicInstructions = typeof businessContext?.publicInstructions === "string" 
            ? businessContext.publicInstructions 
            : JSON.stringify(businessContext?.publicInstructions || "");
        
        compiledPrompt += `\n\n# הקשר עסקי ונתונים בזמן אמת (Context)
- שם העסק: ${businessContext?.businessName || "העסק"}
- סטטוס אימות לקוח: ${businessContext?.customer_auth_status || "אורח לא מחובר"}
- הוראות ציבוריות ומידע עסקי (Knowledge Base): ${publicInstructions}
- שעות פעילות: ${JSON.stringify(businessContext?.operational_settings?.opening_hours || {})}
- שירותים מוצעים: ${JSON.stringify(businessContext?.operational_settings?.services || [])}
- היסטוריית לקוח: ${businessContext?.client_history_summary || "אין היסטוריה קודמת."}`;
    }

    return compiledPrompt.trim();
}
