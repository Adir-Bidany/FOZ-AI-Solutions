"use client";

import { CheckCircle2 } from "lucide-react";

interface BusinessPoliciesProps {
    policies: string[];
}

export default function BusinessPolicies({ policies }: BusinessPoliciesProps) {
    if (!policies || policies.length === 0) return null;

    return (
        <section className="w-full max-w-xl mx-auto mt-8 mb-12 px-2" dir="rtl">
            <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    תנאי שירות ומדיניות
                </h3>
                <ul className="space-y-2.5">
                    {policies.map((policy, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 size={16} className="text-primary/70 shrink-0 mt-0.5" />
                            <span>{policy}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
