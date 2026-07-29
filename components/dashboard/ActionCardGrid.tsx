"use client";

import React, { useState, useTransition } from "react";
import { approveActionCard, dismissActionCard } from "@/actions/dashboard";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActionCardProps {
    cards: any[]; // Using any for now to match the serialized JSON
}

export default function ActionCardGrid({ cards = [] }: ActionCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = async (cardId: string) => {
        startTransition(async () => {
            const result = await approveActionCard(cardId);
            if (result.success) {
                console.log("Approved");
            } else {
                console.error("Failed");
            }
        });
    };

    const handleDismiss = async (cardId: string) => {
        startTransition(async () => {
            const result = await dismissActionCard(cardId);
            if (result.success) {
                console.log("Dismissed");
            }
        });
    };

    if (cards.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 tracking-tight text-foreground">
                הצעות לפעולה
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <Card key={card._id} className="border-s-4 border-s-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2 capitalize text-xs font-semibold">
                                    {card.source_agent}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(card.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg font-bold">
                                {card.display_content.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {card.display_content.description}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismiss(card._id)}
                                disabled={isPending}
                                className="text-muted-foreground hover:text-destructive text-xs font-medium"
                            >
                                התעלם
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleApprove(card._id)}
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                            >
                                אישור
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
