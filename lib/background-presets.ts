export const BACKGROUND_PRESETS = [
    {
        id: 'misty-rose',
        label: 'ערפל ורוד (Misty Rose)',
        previewColor: '#fff0f5', // Used by the Editor UI
        cssValue: 'linear-gradient(135deg, #fff0f5 0%, #fff5e6 50%, #ffe4e1 100%)',
        backgroundSize: 'cover',
        // New Theme Properties
        themeTextColor: '#374151',    // Dark Gray (Readable on light)
        themeAccentColor: '#be185d'   // Pink-700 (For highlights)
    },
    {
        id: 'midnight-glow',
        label: 'זוהר לילי (Midnight Glow)',
        previewColor: '#0f172a',
        cssValue: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #020617 80%)',
        backgroundSize: 'cover',
        themeTextColor: '#ffffff',    // White (Readable on dark)
        themeAccentColor: '#fbbf24'   // Amber-400 (Goldish)
    },
    {
        id: 'golden-marble',
        label: 'שיש וזהב (Golden Marble)',
        previewColor: '#fffbeb',
        cssValue: 'radial-gradient(circle at 0% 0%, #fef3c7 0%, transparent 40%), radial-gradient(circle at 100% 100%, #fef3c7 0%, transparent 40%), #ffffff',
        backgroundSize: 'cover',
        themeTextColor: '#422006',    // Dark Brown
        themeAccentColor: '#d97706'   // Amber-600
    },
    {
        id: 'clean-tech',
        label: 'טכנולוגי נקי (Clean Tech)',
        previewColor: '#f8fafc',
        cssValue: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        themeTextColor: '#0f172a',    // Slate-900
        themeAccentColor: '#2563eb'   // Blue-600
    }
];
