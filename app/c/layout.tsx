export default function ClientSiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // ה-div הזה עוטף את כל אתרי הלקוחות.
        // מכיוון שלא שמנו פה Header או Footer, הם יהיו נקיים לגמרי.
        <div className="min-h-screen bg-white">{children}</div>
    );
}
