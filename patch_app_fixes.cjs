const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/milestones/g, 'structureMilestones');
code = code.replace(/setStructureMilestones\(data\.structureMilestones\);/g, 'if (data.structureMilestones) setStructureMilestones(data.structureMilestones);');

// Remove the old user useState and onAuthStateChanged
const oldUserCode = `
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);
`;
code = code.replace(oldUserCode, '');
code = code.replace(/const \[user, setUser\] = useState<User \| null>\(null\);/, '');

// Find any leftover onAuthStateChanged
code = code.replace(/useEffect\(\(\) => \{\n\s*const unsubscribe = onAuthStateChanged.*?return \(\) => unsubscribe\(\);\n\s*\}, \[\]\);/s, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx fixes");
