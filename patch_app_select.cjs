const fs = require('fs');
const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix desktop onSelectObject
content = content.replace(
  /onSelectObject=\{\(type, id, data\) => \{\n\s*setSelectedObject\(\{ type, id, data \}\);\n\s*if \(type === 'character'\) \{\n\s*setSelectedCharId\(id\);\n\s*setActiveWorkspace\('CHARACTER'\);\n\s*\}\n\s*if \(type === 'scene'\) \{\n\s*setSelectedSceneId\(id\);\n\s*setActiveWorkspace\('WRITING'\);\n\s*\}\n\s*if \(type === 'plot_thread'\) \{\n\s*setActiveWorkspace\('PLANNING'\);\n\s*\}\n\s*if \(type === 'canon_fact'\) \{\n\s*setActiveWorkspace\('WORLDBUILDING'\);\n\s*\}\n\s*\}\}/g,
  `onSelectObject={(type, id, data) => {
              setSelectedObject({ type, id, data });
              if (type === 'character') {
                setSelectedCharId(id);
                setActiveWorkspace('CHARACTER');
              }
              if (type === 'scene') {
                setSelectedSceneId(id);
                setActiveWorkspace('WRITING_STUDIO');
              }
              if (type === 'plot_thread') {
                setActiveWorkspace('PLANNING');
              }
              if (type === 'canon_fact') {
                setActiveWorkspace('WORLDBUILDING');
              }
            }}`
);

// Fix mobile onSelectObject
content = content.replace(
  /onSelectObject=\{\(type, id, data\) => \{\n\s*setSelectedObject\(\{ type, id, data \}\);\n\s*if \(type === 'character'\) setSelectedCharId\(id\);\n\s*if \(type === 'scene'\) setSelectedSceneId\(id\);\n\s*setIsMobileNavOpen\(false\);\n\s*\}\}/g,
  `onSelectObject={(type, id, data) => {
                setSelectedObject({ type, id, data });
                if (type === 'character') {
                  setSelectedCharId(id);
                  setActiveWorkspace('CHARACTER');
                }
                if (type === 'scene') {
                  setSelectedSceneId(id);
                  setActiveWorkspace('WRITING_STUDIO');
                }
                if (type === 'plot_thread') setActiveWorkspace('PLANNING');
                if (type === 'canon_fact') setActiveWorkspace('WORLDBUILDING');
                setIsMobileNavOpen(false);
              }}`
);

fs.writeFileSync(path, content);
