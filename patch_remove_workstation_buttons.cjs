const fs = require('fs');
const path = './src/components/HeaderTransport.tsx';
let content = fs.readFileSync(path, 'utf8');

// The workstation buttons start with: {/* WORKSTATION BUTTON BAR
// and end before: {/* AI & Sync Indicators */}

content = content.replace(
  /\{\/\* WORKSTATION BUTTON BAR \(RESCALED & ANIMATED\) \*\/\}\s*<div className="flex flex-wrap items-center bg-\[#000000\] p-1 rounded-md border border-\[#153B5C\] gap-1">[\s\S]*?<\/div>\s*\{\/\* AI & Sync Indicators \*\/\}/,
  `{/* AI & Sync Indicators */}`
);

fs.writeFileSync(path, content);
