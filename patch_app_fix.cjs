const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Undo the bad replaces
code = code.replace(
  '    return (\n    <>\n      <LiveVoiceChat />) => unsubscribe();',
  '    return () => unsubscribe();'
);

code = code.replace(
  '  return (\n    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans select-none">',
  '  return (\n    <>\n      <LiveVoiceChat />\n    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans select-none">'
);

if (!code.endsWith('</>\n  );\n}')) {
  // Let's find the last </div>  );  }
  code = code.replace(/    <\/div>\n  \);\n}$/, '    </div>\n    </>\n  );\n}');
}

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App.tsx");
