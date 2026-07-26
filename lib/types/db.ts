import { Types, Document } from "mongoose";

// --- Business / Client Interface ---
export interface IBusiness extends Document {
    _id: Types.ObjectId;
    slug: string;
    businessName: string;
    ownerName: string;
    email: string;
    password?: string; // Hashed
    phone?: string;
    logo?: string;
    niche: string;

    // Operational Settings
    operational_settings: {
        opening_hours: Record<string, string>; // e.g., "sunday": "09:00-18:00"
        services: string[]; // List of services provided
        timezone: string;
    };

    // Agent Personalities
    agent_personalities: {
        receptionist: {
            name: string;
            isActive: boolean;
            tone: string;
            traits: string[];
        };
        marketing: {
            name: string;
            isActive: boolean;
            tone: string;
            traits: string[];
        };
        management: {
            name: string;
            isActive: boolean;
            tone: string;
            gender: "male" | "female";
        };
    };

    integrations?: {
        simplybook?: {
            companyLogin: string;
            apiKey: string;
            userLogin?: string;
            userPassword?: string;
            isConnected: boolean;
        };
    };

    createdAt: Date;
    updatedAt: Date;
}

// --- Customer Interface ---
export interface ICustomer extends Document {
    _id: Types.ObjectId;
    business_id: Types.ObjectId;
    phone: string;
    name?: string;
    email?: string;

    // AI Memory
    ai_memory: {
        summary: string; // Long-term summary of the customer
        preferences: string[];
        last_interaction_summary?: string;
    };

    // Financial Metrics
    financial_metrics: {
        total_revenue: number;
        ltv_prediction?: number;
        churn_risk?: "low" | "medium" | "high";
        last_purchase_date?: Date;
    };

    marketing_tags: string[];

    createdAt: Date;
    updatedAt: Date;
}

// --- Action Card Interface ---
export interface IActionCard extends Document {
    _id: Types.ObjectId;
    business_id: Types.ObjectId;
    source_agent: "receptionist" | "marketing" | "management" | "system";
    status: "pending" | "approved" | "dismissed" | "completed";

    display_content: {
        title: string;
        description: string;
        priority: "low" | "medium" | "high";
        icon?: string;
    };

    suggested_action: {
        action_type: "send_message" | "update_db" | "schedule_event" | "create_campaign";
        payload: Record<string, any>;
    };

    created_at: Date;
}

// --- Interaction / Conversation Interface ---
export interface IInteraction extends Document {
    _id: Types.ObjectId;
    business_id: Types.ObjectId;
    customer_id?: Types.ObjectId;
    channel: "whatsapp" | "web" | "sms";
    agent_id: string; // Which agent handled this

    messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
        timestamp: Date;
    }>;

    post_chat_analysis?: {
        summary: string;
        sentiment: "positive" | "neutral" | "negative";
        action_items_extracted?: string[];
        topics?: string[];
    };

    created_at: Date;
    updatedAt: Date;
}
