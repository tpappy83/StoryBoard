const fs = require('fs');
const path = './src/components/NarrativeNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /count: relationships\?\.nodes\.length \|\| 4/,
  "count: relationships?.length || 4"
);
content = content.replace(
  /count: relationships\?\.nodes\?\.length \|\| 4/,
  "count: relationships?.length || 4"
);

fs.writeFileSync(path, content);
