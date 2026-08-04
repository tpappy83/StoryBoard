const fs = require('fs');
const path = './src/components/NarrativeNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

// The arrays for these are not passed via props, we can mock them for the preview or render placeholders
const mockLocations = `                  {cat.name === 'Locations' && 
                    <div className="text-xs text-slate-500 italic px-2 py-1">Locations module coming soon</div>
                  }`

const mockProjects = `                  {cat.name === 'Projects' && 
                    <div className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-[#1E293B]/80 text-slate-300">
                      <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-bold">Current Project</span>
                    </div>
                  }`

const mockRelationships = `                  {cat.name === 'Relationships' && 
                    <div className="text-xs text-slate-500 italic px-2 py-1">Relationships map coming soon</div>
                  }`

content = content.replace(
  /\{cat\.name === 'Canon' &&([\s\S]*?)\}\)/,
  `{cat.name === 'Canon' &&$1})
                  ${mockProjects}
                  ${mockLocations}
                  ${mockRelationships}`
);

fs.writeFileSync(path, content);
