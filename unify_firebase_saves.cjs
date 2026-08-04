const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use `projects` everywhere
code = code.replace(/doc\(db, "users"/g, 'doc(db, "projects"');

// Remove the old auto-load and auto-save
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(user\) \{\n\s*const loadData = async \(\) => \{[\s\S]*?\}, \[user\]\);\n\n\s*useEffect\(\(\) => \{\n\s*if \(user\) \{\n\s*const saveData = async \(\) => \{[\s\S]*?\}, \[user, project, characters, relationships, plotThreads, convergenceEvents, scenes, timelineEvents, canonFacts, violations, structureMilestones\]\);/, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Unified firebase saves");
