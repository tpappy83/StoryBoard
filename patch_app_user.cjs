const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setMilestones\(data\.structureMilestones\);/g, 'setStructureMilestones(data.structureMilestones);');
code = code.replace(/const \[isAuditing, setIsAuditing\] = useState\(false\);/, 'const [isAuditing, setIsAuditing] = useState(false);\n  const { firebaseUser: user } = useAuthStore();');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx user");
