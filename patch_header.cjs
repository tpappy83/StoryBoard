const fs = require('fs');
const path = './src/components/HeaderTransport.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /    \{\s*id: 'PLANNING',\s*label: 'Navigator',[\s\S]*?\},/g,
  ``
);

fs.writeFileSync(path, content);
