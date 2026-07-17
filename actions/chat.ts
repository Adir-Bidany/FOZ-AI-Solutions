"use server";

import { AGENT_REGISTRY } from "@/lib/agents/registry";

export async function getInitialGreeting(agentId: string) {
    const config = AGENT_REGISTRY[agentId];
    if (!config) return null;
    
    if (Array.isArray(config.initialGreeting)) {
        const randomIndex = Math.floor(Math.random() * config.initialGreeting.length);
        return config.initialGreeting[randomIndex];
    }
    return config.initialGreeting;
}
