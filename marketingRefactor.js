const fs = require('fs');

const path = 'components/dashboard/MarketingContentHub.tsx';
let t = fs.readFileSync(path, 'utf8');

// 1. Pass props to IntegrationsHealth
t = t.replace(
    '<IntegrationsHealth />',
    '<IntegrationsHealth metaConfig={metaConfig} setMetaConfig={setMetaConfig} />'
);

// 2. Remove URL parameter listener
const useEffectRegex = /\s*\/\/\s*Check URL parameters for OAuth status[\s\S]*?\}, \[\]\);\s*/m;
t = t.replace(useEffectRegex, '\n');

// 3. Remove Meta handlers
const connectMetaRegex = /\s*const handleConnectMeta = \(\) => \{[\s\S]*?^\s*\};\s*/m;
t = t.replace(connectMetaRegex, '\n');

const disconnectMetaRegex = /\s*const handleDisconnectMeta = async \(\) => \{[\s\S]*?^\s*\};\s*/m;
t = t.replace(disconnectMetaRegex, '\n');

// 4. Remove the Guide Modal State
t = t.replace(/\s*\/\/ Guide Modal State[\s\S]*?const \[isDisconnecting, setIsDisconnecting\] = useState\(false\);\s*/m, '\n');

// 5. Remove the entire "META INTEGRATIONS BANNER" block
const bannerRegex = /\s*\{\/\*\s*---\s*META INTEGRATIONS BANNER\s*---\s*\*\/\}[\s\S]*?(?=\s*\{\/\*\s*INTEGRATIONS HEALTH\s*\*\/)/;
t = t.replace(bannerRegex, '\n');

// 6. Remove the Dialog block
const dialogRegex = /\s*\{\/\*\s*---\s*HOW TO CONNECT GUIDE MODAL\s*---\s*\*\/\}[\s\S]*?<\/Dialog>\s*/m;
t = t.replace(dialogRegex, '\n');

fs.writeFileSync(path, t);
console.log("MarketingContentHub cleaned up!");
