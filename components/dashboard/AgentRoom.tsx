"use client";

import React, { useState, useEffect } from "react";
import { fetchInternalChat } from "@/actions/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, DollarSign } from "lucide-react";

interface AgentRoomProps {
    businessId: string;
}

export default function AgentRoom({ businessId }: AgentRoomProps) {
    const [activeTab, setActiveTab] = useState("golda");
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadChat(activeTab);
    }, [activeTab]);

    const loadChat = async (persona: string) => {
        setIsLoading(true);
        const msgs = await fetchInternalChat(businessId, persona);
        setMessages(msgs);
        setIsLoading(false);
    };

    const agents = {
        golda: { name: "Golda", role: "Manager", color: "text-purple-600", bg: "bg-purple-100", icon: Sparkles },
        michal: { name: "Michal", role: "Marketing", color: "text-pink-600", bg: "bg-pink-100", icon: TrendingUp },
        roi: { name: "Roi", role: "Finance", color: "text-blue-600", bg: "bg-blue-100", icon: DollarSign },
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-50 bg-white">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Sparkles size={18} />
                    </div>
                    חדר המצב (Agent Room)
                </h2>

                <Tabs defaultValue="golda" onValueChange={setActiveTab} className="w-full" dir="rtl">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-xl">
                        {Object.entries(agents).map(([key, agent]) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <agent.icon size={16} className={agent.color} />
                                    <span className="font-medium">{agent.name}</span>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 bg-gray-50/50 p-4 overflow-hidden relative">
                <ScrollArea className="h-full pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Loading history...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Sparkles size={20} className="text-gray-300" />
                            </div>
                            <p>No active conversation with {agents[activeTab as keyof typeof agents].name} yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                                            }`}
                                    >
                                        {msg.parts[0].text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
