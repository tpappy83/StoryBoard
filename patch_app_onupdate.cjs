const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "onAddRelationship={(newRel) => setRelationships(prev => [...prev, { ...newRel, id: 'rel_' + Date.now() }])}",
  "onAddRelationship={(newRel) => setRelationships(prev => [...prev, { ...newRel, id: 'rel_' + Date.now() }])}\n                      onUpdateRelationship={(updatedRel) => setRelationships(prev => prev.map(r => r.id === updatedRel.id ? updatedRel : r))}"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with onUpdateRelationship");
