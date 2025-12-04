import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Plus, Search } from "lucide-react";

const clients = [
    {
        id: "1",
        name: "דנה לוי",
        phone: "050-1234567",
        avatar: "DL",
        status: "active",
        lastVisit: "2023-11-28",
        treatments: 12,
        ltv: "₪4,200",
    },
    {
        id: "2",
        name: "מיכל כהן",
        phone: "052-9876543",
        avatar: "MK",
        status: "active",
        lastVisit: "2023-11-15",
        treatments: 8,
        ltv: "₪2,800",
    },
    {
        id: "3",
        name: "רונית אברהם",
        phone: "054-5555555",
        avatar: "RA",
        status: "inactive",
        lastVisit: "2023-09-10",
        treatments: 3,
        ltv: "₪900",
    },
    {
        id: "4",
        name: "שירה גולן",
        phone: "053-3333333",
        avatar: "SG",
        status: "active",
        lastVisit: "2023-11-30",
        treatments: 20,
        ltv: "₪7,500",
    },
    {
        id: "5",
        name: "נועה שחר",
        phone: "050-9999999",
        avatar: "NS",
        status: "active",
        lastVisit: "2023-11-25",
        treatments: 5,
        ltv: "₪1,500",
    },
];

export default function ClientsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">לקוחות</h1>
                    <p className="text-gray-500 mt-1">ניהול מאגר הלקוחות שלך</p>
                </div>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md">
                    <Plus size={18} /> הוסף לקוחה חדשה
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="חיפוש לפי שם או טלפון..."
                                className="pr-10 h-10 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="text-right font-bold text-gray-600">שם מלא</TableHead>
                                <TableHead className="text-right font-bold text-gray-600">סטטוס</TableHead>
                                <TableHead className="text-right font-bold text-gray-600">ביקור אחרון</TableHead>
                                <TableHead className="text-right font-bold text-gray-600">סה״כ טיפולים</TableHead>
                                <TableHead className="text-right font-bold text-gray-600">שווי לקוח (LTV)</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 bg-purple-100 text-purple-600 border border-purple-200">
                                                <AvatarFallback>{client.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{client.name}</div>
                                                <div className="text-xs text-gray-500">{client.phone}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={client.status === "active" ? "default" : "secondary"}
                                            className={client.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 shadow-none"}
                                        >
                                            {client.status === "active" ? "פעילה" : "לא פעילה"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{client.lastVisit}</TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900">{client.treatments}</div>
                                    </TableCell>
                                    <TableCell className="font-bold text-purple-600">{client.ltv}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel>פעולות</DropdownMenuLabel>
                                                <DropdownMenuItem>עריכת פרטים</DropdownMenuItem>
                                                <DropdownMenuItem>היסטוריית טיפולים</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">מחיקת לקוח</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
