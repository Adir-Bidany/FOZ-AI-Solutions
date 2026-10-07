const fs = require('fs');
let t = fs.readFileSync('components/dashboard/Sidebar.tsx', 'utf8');

t = t.replace(
    /className={getNavItemClass\("\/dashboard\/customers"\)}\r?\n                    >\r?\n                    <\/Button>/g,
    'className={getNavItemClass("/dashboard/customers")}\n                    > לקוחות\n                    </Button>'
);

t = t.replace(
    /dark:border-red-900 bg-card h-10 rounded-xl"\r?\n                >\r?\n                <\/Button>/g,
    'dark:border-red-900 bg-card h-10 rounded-xl"\n                > התנתקות\n                </Button>'
);

fs.writeFileSync('components/dashboard/Sidebar.tsx', t);
console.log("Restoration Complete Round 2!");
