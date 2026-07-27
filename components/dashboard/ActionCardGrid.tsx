"use client";

import React, { useState, useTransition } from "react";
import { approveActionCard, dismissActionCard } from "@/actions/dashboard";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, or I'll use standard alert if not

interface ActionCardProps {
    cards: any[]; // Using any for now to match the serialized JSON
}

export default function ActionCardGrid({ cards = [] }: ActionCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = async (cardId: string) => {
        startTransition(async () => {
            const result = await approveActionCard(cardId);
            if (result.success) {
                // toast.success("Action approved and executed!");
                console.log("Approved");
            } else {
                // toast.error("Failed to approve action.");
                console.error("Failed");
            }
        });
    };

    const handleDismiss = async (cardId: string) => {
        startTransition(async () => {
            const result = await dismissActionCard(cardId);
            if (result.success) {
                // toast.success("Action dismissed.");
                console.log("Dismissed");
            }
        });
    };

    if (cards.length === 0) {
        return null; // Don't show anything if no cards
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Suggested Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <Card key={card._id} className="border-s-4 border-s-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2 capitalize">
                                    {card.source_agent}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                    {new Date(card.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                {getIcon(card.display_content.icon)}
                                {card.display_content.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {card.display_content.description}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismiss(card._id)}
                                disabled={isPending}
                                className="text-gray-500 hover:text-red-500"
                            >
                                <X className="w-4 h-4 me-1" />
                                Dismiss
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleApprove(card._id)}
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Check className="w-4 h-4 me-1" />
                                Approve
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function getIcon(iconName?: string) {
    switch (iconName) {
        case "Sparkles": return <Sparkles className="w-4 h-4 text-yellow-500" />;
        case "MessageSquare": return <MessageSquare className="w-4 h-4 text-blue-500" />;
        case "TrendingUp": return <TrendingUp className="w-4 h-4 text-green-500" />;
        default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
}
