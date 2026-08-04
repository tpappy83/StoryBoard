const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/import { db } from '\.\/lib\/firebase';/g, "import { db } from './firebase';");
fs.writeFileSync('src/App.tsx', appCode);

console.log("Consolidated firebase imports in App.tsx");
