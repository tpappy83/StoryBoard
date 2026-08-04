const fs = require('fs');
const path = './src/components/NarrativeNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/characters\.length/g, "characters?.length || 0");
content = content.replace(/scenes\.length/g, "scenes?.length || 0");
content = content.replace(/plotThreads\.length/g, "plotThreads?.length || 0");
content = content.replace(/canonFacts\.length/g, "canonFacts?.length || 0");
content = content.replace(/timelineEvents\.length/g, "timelineEvents?.length || 0");

fs.writeFileSync(path, content);
