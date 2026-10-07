const fs = require('fs');
let t = fs.readFileSync('components/dashboard/Sidebar.tsx', 'utf8');

t = t.replace('> שלי', '> המשרד שלי');
t = t.replace('> עם גולדה', '> צ\'אט עם גולדה');
t = t.replace('> תורים', '> יומן תורים');
t = t.replace('> ותוכן', '> שיווק ותוכן');
t = t.replace('> נחיתה', '> עמוד נחיתה');
t = t.replace('> ללקוח', '> מסע ללקוח');
t = t.replace('> העסק', '> הגדרות העסק');
t = t.replace('> חבילה', '> שדרוג חבילה');

// Fix Customers (Empty)
t = t.replace(
    'className={getNavItemClass("/dashboard/customers")}\n                    >\n                    </Button>',
    'className={getNavItemClass("/dashboard/customers")}\n                    > לקוחות\n                    </Button>'
);

// Fix Logout (Empty)
t = t.replace(
    'dark:border-red-900 bg-card h-10 rounded-xl"\n                >\n                </Button>',
    'dark:border-red-900 bg-card h-10 rounded-xl"\n                > התנתקות\n                </Button>'
);

fs.writeFileSync('components/dashboard/Sidebar.tsx', t);
console.log("Restoration Complete!");
