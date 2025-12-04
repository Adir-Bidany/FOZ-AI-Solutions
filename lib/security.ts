import { z } from "zod";

// --- Rate Limiter ---
interface RateLimitRecord {
    count: number;
    startTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string): boolean {
    const windowMs = 60 * 1000; // דקה אחת
    const maxReq = 15; // כמות בקשות מותרת
    const now = Date.now();

    const record = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - record.startTime > windowMs) {
        record.count = 1;
        record.startTime = now;
    } else {
        record.count++;
    }

    rateLimitMap.set(ip, record);
    return record.count <= maxReq;
}

// --- Validation Schemas ---
export const publicChatSchema = z.object({
    userId: z.string().min(3),
    message: z.string().min(1).max(500),
    businessSlug: z.string().optional(),
});

// --- PII Masking ---
export function maskPII(text: string): string {
    // מסתיר טלפונים ות.ז ישראליים
    return text
        .replace(/\b05\d-?\d{7}\b/g, "[PHONE]")
        .replace(/\b\d{9}\b/g, "[ID]");
}

// --- Admin Verification ---
export function verifyAdmin(userId: string): boolean {
    return userId === process.env.ADMIN_USER_ID;
}
