import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, Sparkles } from "lucide-react";
import AgentRoom from "@/components/dashboard/AgentRoom";

interface ChatDrawerProps {
    client: any; // Using any for now to match existing usage, ideally strictly typed
}

export default function ChatDrawer({ client }: ChatDrawerProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center"
                >
                    <MessageSquare size={28} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[400px] sm:w-[500px] border-r-0">
                <div className="h-full flex flex-col">
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">הצוות הדיגיטלי</h2>
                            <p className="text-xs text-purple-100 opacity-90">זמינים עבורך 24/7</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative bg-gray-50">
                        <AgentRoom businessId={client._id} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
