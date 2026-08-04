const fs = require('fs');
const path = './src/components/HeaderTransport.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove workstations array
content = content.replace(
  /\/\/ Workstation button definitions matching prompt specifications[\s\S]*?\}\s*\];/g,
  ``
);

fs.writeFileSync(path, content);
