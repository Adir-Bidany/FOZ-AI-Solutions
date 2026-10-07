const fs = require('fs');

// 1. Update MarketingContentHub.tsx
const uiPath = 'components/dashboard/MarketingContentHub.tsx';
let uiText = fs.readFileSync(uiPath, 'utf8');

// Add State
uiText = uiText.replace(
    'const [includeImage, setIncludeImage] = useState(true);',
    'const [includeImage, setIncludeImage] = useState(true);\n    const [maxWords, setMaxWords] = useState(100);\n    const [includeEmojis, setIncludeEmojis] = useState(true);'
);

// Update Payload
uiText = uiText.replace(
    'prompt: promptText,\r\n                    includeImage,\r\n                }),',
    'prompt: promptText,\n                    includeImage,\n                    maxWords,\n                    includeEmojis,\n                }),'
);
uiText = uiText.replace(
    'prompt: promptText,\n                    includeImage,\n                }),',
    'prompt: promptText,\n                    includeImage,\n                    maxWords,\n                    includeEmojis,\n                }),'
);


// Update UI Elements
const originalToggle = `{/* Include AI Image Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <FeatureGate
                            currentTier={effectiveTier}
                            requiredFeature="AI_IMAGE_GENERATOR"
                            fallback={
                                <div className="flex items-center gap-3 opacity-70">
                                    <Switch
                                        id="include-image-locked"
                                        checked={false}
                                        disabled={true}
                                    />
                                    <Label htmlFor="include-image-locked" className="text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                        כלול תמונת AI מותאמת אישית
                                        <Lock className="ml-2 text-muted-foreground" size={14} />
                                    </Label>
                                </div>
                            }
                        >
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="include-image"
                                    checked={includeImage}
                                    onCheckedChange={(checked: boolean) => setIncludeImage(checked)}
                                    disabled={isGenerating}
                                />
                                <Label htmlFor="include-image" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                    כלול תמונת AI מותאמת אישית
                                </Label>
                            </div>
                        </FeatureGate>
                    </div>`;

const newControls = `{/* Generator Controls */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center gap-6">
                                <FeatureGate
                                    currentTier={effectiveTier}
                                    requiredFeature="AI_IMAGE_GENERATOR"
                                    fallback={
                                        <div className="flex items-center gap-3 opacity-70">
                                            <Switch
                                                id="include-image-locked"
                                                checked={false}
                                                disabled={true}
                                            />
                                            <Label htmlFor="include-image-locked" className="text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                כלול תמונת AI מותאמת אישית
                                                <Lock className="ml-2 text-muted-foreground" size={14} />
                                            </Label>
                                        </div>
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="include-image"
                                            checked={includeImage}
                                            onCheckedChange={(checked: boolean) => setIncludeImage(checked)}
                                            disabled={isGenerating}
                                        />
                                        <Label htmlFor="include-image" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                            <ImageIcon className="w-4 h-4 text-primary" />
                                            כלול תמונת AI מותאמת אישית
                                        </Label>
                                    </div>
                                </FeatureGate>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="include-emojis"
                                        checked={includeEmojis}
                                        onCheckedChange={(checked: boolean) => setIncludeEmojis(checked)}
                                        disabled={isGenerating}
                                    />
                                    <Label htmlFor="include-emojis" className="text-sm font-medium cursor-pointer">
                                        כלול אימוג'ים
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Label htmlFor="max-words" className="text-sm font-medium">
                                    מקסימום מילים:
                                </Label>
                                <Input
                                    id="max-words"
                                    type="number"
                                    min={10}
                                    max={500}
                                    className="w-24 text-center bg-background"
                                    value={maxWords}
                                    onChange={(e) => setMaxWords(parseInt(e.target.value) || 100)}
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>
                    </div>`;

// Normalize endings for replacement
uiText = uiText.replace(/\r\n/g, '\n');
const fixedOriginal = originalToggle.replace(/\r\n/g, '\n');

if (uiText.includes(fixedOriginal)) {
    uiText = uiText.replace(fixedOriginal, newControls);
} else {
    console.log("Could not find the exact original toggle block to replace!");
}

fs.writeFileSync(uiPath, uiText);

// 2. Update app/api/marketing/generate/route.ts
const apiPath = 'app/api/marketing/generate/route.ts';
let apiText = fs.readFileSync(apiPath, 'utf8');

apiText = apiText.replace(/\r\n/g, '\n');

apiText = apiText.replace(
    'const { prompt = "", includeImage = false } = body;',
    'const { prompt = "", includeImage = false, maxWords = 100, includeEmojis = true } = body;'
);

const oldPrompt = `CRITICAL RULE: The value of "imageVisualPrompt" field must ALWAYS be written in English, regardless of what language the user wrote in.\`;`;

const newPrompt = `CRITICAL RULE: The value of "imageVisualPrompt" field must ALWAYS be written in English, regardless of what language the user wrote in.

Strictly limit the post content to a maximum of \${maxWords} words. Do not exceed this limit under any circumstances.
\${includeEmojis ? "You may use emojis naturally to make the post engaging." : "CRITICAL RULE: Do NOT use any emojis anywhere in the title or content. The text must be 100% emoji-free."}\`;`;

apiText = apiText.replace(oldPrompt, newPrompt);

fs.writeFileSync(apiPath, apiText);
console.log("Marketing generator updated successfully!");
