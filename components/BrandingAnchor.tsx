"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, CheckCircle, Clock, UserPlus, Building, LogIn, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

interface BrandingAnchorProps {
    context: "platform" | "consumer" | "dashboard";
    businessData?: any;
    children?: React.ReactNode;
}

export default function BrandingAnchor({ context, businessData, children }: BrandingAnchorProps) {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Platform Context State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [businessId, setBusinessId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Consumer Context State
    const [customer, setCustomer] = useState<any>(null);
    const [mode, setMode] = useState<"login" | "register">("login");

    // Dynamic Logo Fallback
    const logoSrc = businessData?.logoUrl || businessData?.logo || "/logo.png";
    const isFozLogo = logoSrc === "/logo.png";

    useEffect(() => {
        if (context === "platform" && showRegisterModal && businesses.length === 0) {
            fetch("/api/public/businesses")
                .then(r => r.json())
                .then(data => {
                    if (data.success) setBusinesses(data.businesses);
                });
        }
    }, [context, showRegisterModal, businesses.length]);

    useEffect(() => {
        if (context === "consumer") {
            const stored = localStorage.getItem("foz_consumer_data");
            if (stored) {
                try {
                    setCustomer(JSON.parse(stored));
                } catch (e) {}
            }

            const handleForceLogout = () => {
                console.log("[BrandingAnchor] Force logout intercepted!");
                handleLogout();
            };

            window.addEventListener("consumer-force-logout", handleForceLogout);
            return () => {
                window.removeEventListener("consumer-force-logout", handleForceLogout);
            };
        }
    }, [context]);

    // Dedicated listener for chat-triggered auth drawer open — registered immediately,
    // independently of consumer data loading to avoid any mount race condition.
    useEffect(() => {
        if (context !== "consumer") return;

        const handleOpenAuthDrawer = () => {
            console.log("[BrandingAnchor] open-auth-drawer event received → opening drawer");
            setIsOpen(true);
        };

        window.addEventListener("open-auth-drawer", handleOpenAuthDrawer);
        return () => {
            window.removeEventListener("open-auth-drawer", handleOpenAuthDrawer);
        };
    }, [context]);

    const handleRegisterPlatform = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/consumer/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, name, lastName, email, phone, password })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (e: any) {
            setError(e.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginConsumer = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/consumer/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: businessData?._id?.toString(), email, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("foz_consumer_token", data.token);
                localStorage.setItem("foz_consumer_data", JSON.stringify(data.customer));
                setCustomer(data.customer);
                setIsOpen(false);
            } else {
                setError(data.error || "Login failed");
            }
        } catch (e: any) {
            setError(e.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterConsumer = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/consumer/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: businessData?._id?.toString(), name, lastName, email, phone, password })
            });
            const data = await res.json();
            if (data.success) {
                setError("הרשמה בוצעה בהצלחה! ממתין לאישור מנהל.");
                setMode("login");
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (e: any) {
            setError(e.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("foz_consumer_token");
        localStorage.removeItem("foz_consumer_data");
        setCustomer(null);
        setIsOpen(false);
    };

    // --- Render Logic ---
    if (!mounted) return null;

    let ringClass = "border-transparent";
    if (context === "consumer") {
        ringClass = customer ? "border-green-500" : "border-red-500";
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end justify-start" dir="rtl">
            {/* The Floating Action Button (Anchor) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-16 h-16 rounded-full overflow-hidden shadow-2xl transition-transform hover:scale-105 border-4 ${ringClass} ring-4 ring-zinc-900/20 dark:ring-white/40 bg-zinc-950 dark:bg-white flex items-center justify-center cursor-pointer ${!isOpen ? "animate-pulse" : ""}`}
            >
                {isFozLogo ? (
                    <Image src="/logo.png" alt="FOZ AI" width={40} height={40} className="object-contain" />
                ) : (
                    <Image src={logoSrc} alt="Business Logo" fill className="object-cover" />
                )}
            </button>

            {/* Platform Context: Sliding Drawer */}
            {context === "platform" && isOpen && (
                <div className="absolute bottom-20 right-0 w-80 bg-card/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-border animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                    <h3 className="font-bold text-xl mb-4 text-foreground pt-2">ניווט מהיר</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={() => setShowRegisterModal(true)}>
                            <UserPlus className="w-4 h-4 text-blue-500" /> הרשמה כלקוח
                        </Button>
                        <Link href="/onboarding" className="block w-full">
                            <Button variant="outline" className="w-full justify-start gap-2 h-12">
                                <Building className="w-4 h-4 text-purple-500" /> הרשמה כבעל עסק
                            </Button>
                        </Link>
                        <Link href="/login" className="block w-full">
                            <Button variant="outline" className="w-full justify-start gap-2 h-12">
                                <LogIn className="w-4 h-4 text-green-500" /> כניסה למערכת
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Platform Registration Modal */}
            {context === "platform" && showRegisterModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-foreground mb-2">הרשמה לאזור אישי</h2>
                        <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-500" />
                            הפרטים שלך נשמרים בצורה מאובטחת.
                        </p>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="font-bold text-lg text-foreground mb-2">הרשמה בוצעה בהצלחה!</h3>
                                <p className="text-muted-foreground">בקשתך נשלחה למנהל העסק. תוכל להתחבר לאזור האישי מיד לאחר האישור.</p>
                                <Button className="mt-6 w-full" onClick={() => setShowRegisterModal(false)}>סגור</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">בחר עסק</label>
                                    <select 
                                        className="w-full h-10 px-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={businessId}
                                        onChange={(e) => setBusinessId(e.target.value)}
                                    >
                                        <option value="">-- בחר מרשימה --</option>
                                        {businesses.map(b => (
                                            <option key={b._id} value={b._id}>{b.businessName}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="שם פרטי" value={name} onChange={e => setName(e.target.value)} />
                                    <Input placeholder="שם משפחה" value={lastName} onChange={e => setLastName(e.target.value)} />
                                </div>
                                <Input placeholder="טלפון נייד" value={phone} onChange={e => setPhone(e.target.value)} />
                                <Input placeholder="דוא״ל" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                <PasswordInput placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} />

                                <Button 
                                    className="w-full bg-primary hover:bg-primary/90 h-12 text-lg rounded-xl mt-2 text-primary-foreground" 
                                    onClick={handleRegisterPlatform}
                                    disabled={loading || !businessId || !name || !email || !phone || !password}
                                >
                                    {loading ? "שולח..." : "סיים הרשמה"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Consumer Context: Login/CRM Drawer */}
            {context === "consumer" && isOpen && (
                <div className="absolute bottom-20 right-0 w-80 bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-border p-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                    {!customer ? (
                        <div className="space-y-4 pt-2">
                            <h3 className="font-bold text-lg text-foreground">
                                {mode === "login" ? "התחברות אזור אישי" : "הרשמה לאזור אישי"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                הנתונים שלך נשמרים בצורה מאובטחת.
                            </p>

                            {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

                            <div className="space-y-3">
                                {mode === "register" && (
                                    <>
                                        <div className="flex gap-2">
                                            <Input placeholder="שם פרטי" value={name} onChange={(e) => setName(e.target.value)} />
                                            <Input placeholder="שם משפחה" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </div>
                                        <Input placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </>
                                )}
                                <Input placeholder="דוא״ל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <PasswordInput placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} />
                                
                                <Button 
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                                    onClick={mode === "login" ? handleLoginConsumer : handleRegisterConsumer}
                                    disabled={loading}
                                >
                                    {loading ? "טוען..." : (mode === "login" ? "התחבר" : "הרשם")}
                                </Button>
                            </div>

                            <div className="text-center text-sm pt-2">
                                <button 
                                    className="text-primary hover:underline"
                                    onClick={() => {
                                        setMode(mode === "login" ? "register" : "login");
                                        setError("");
                                    }}
                                >
                                    {mode === "login" ? "אין לך משתמש? לחץ להרשמה" : "כבר רשום? לחץ להתחברות"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="bg-green-100 p-3 rounded-full shrink-0">
                                    <User className="text-green-600 w-6 h-6" />
                                </div>
                                <div className="truncate">
                                    <h3 className="font-bold text-foreground truncate">{customer.name} {customer.lastName}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{customer.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary" /> טיפולים שבוצעו</span>
                                    <span className="font-semibold">{customer.metrics?.totalAppointments || 0}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> היסטוריית טיפולים</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(customer.history?.lastTreatments || []).length > 0 ? (
                                            customer.history.lastTreatments.map((t: string, i: number) => (
                                                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{t}</span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground">אין היסטוריה</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleLogout} variant="destructive" className="w-full mt-4 flex gap-2">
                                <LogOut className="w-4 h-4" /> התנתק
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Dashboard Context: Floating Navigation Overlay originating from bottom-right button */}
            {context === "dashboard" && isOpen && (
                <div className="absolute bottom-20 right-0 w-80 max-h-[85vh] bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 z-50">
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground rounded-full z-10"
                        aria-label="סגור תפריט"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {React.isValidElement(children)
                            ? React.cloneElement(children as React.ReactElement<any>, {
                                  onNavClick: () => setIsOpen(false),
                              })
                            : children}
                    </div>
                </div>
            )}
        </div>
    );
}
