export const BACKGROUND_PRESETS = [
    {
        id: 'misty-rose',
        label: 'ערפל ורוד (Misty Rose)',
        previewColor: '#fff0f5', // Visual helper for the button
        // A soft, dreamy gradient moving from very pale pink to cream to misty rose
        cssValue: 'linear-gradient(135deg, #fff0f5 0%, #fff5e6 50%, #ffe4e1 100%)',
        backgroundSize: 'cover'
    },
    {
        id: 'midnight-glow',
        label: 'זוהר לילי (Midnight Glow)',
        previewColor: '#0f172a',
        // Dark slate background with a subtle central glow effect
        cssValue: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #020617 80%)',
        backgroundSize: 'cover'
    },
    {
        id: 'golden-marble',
        label: 'שיש וזהב (Golden Marble)',
        previewColor: '#fffbeb',
        // White luxury base with subtle gold accents in corners to mimic reflection
        cssValue: 'radial-gradient(circle at 0% 0%, #fef3c7 0%, transparent 40%), radial-gradient(circle at 100% 100%, #fef3c7 0%, transparent 40%), #ffffff',
        backgroundSize: 'cover'
    },
    {
        id: 'clean-tech',
        label: 'טכנולוגי נקי (Clean Tech)',
        previewColor: '#f8fafc',
        // A very subtle dot pattern for a sterile, high-tech look
        cssValue: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px' // Creates the pattern spacing
    }
];
