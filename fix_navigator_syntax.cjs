const fs = require('fs');
const path = './src/components/NarrativeNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /onDragStart=\{e => \{ e\.dataTransfer\.setData\("text\/plain", "canon_fact"\); startDrag\(\{ type: "canon_fact", id: cf\.id, data: cf \}\)([\s\S]*?)Relationships map coming soon<\/div>\n                  \}; \}\}/;

content = content.replace(regex, `onDragStart={e => { e.dataTransfer.setData("text/plain", "canon_fact"); startDrag({ type: "canon_fact", id: cf.id, data: cf }); }}`);

const correctInjection = `                      canonFacts
                        .filter(cf => cf.fact.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(cf => (
                          <div
                            key={cf.id}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("text/plain", "canon_fact"); startDrag({ type: "canon_fact", id: cf.id, data: cf }); }}
                            onClick={() => onSelectObject && onSelectObject('canon_fact', cf.id, cf)}
                            className={\`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#1E293B]/80 text-slate-300 transition-colors \${
                              selectedObjectId === cf.id ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-500/40 font-bold' : ''
                            }\`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate text-[11px]">{cf.fact}</span>
                            </div>
                            <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-800 shrink-0 ml-2">
                              {cf.category}
                            </span>
                          </div>
                        ))}
                    {cat.name === 'Projects' && 
                      <div className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-[#1E293B]/80 text-slate-300">
                        <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px] font-bold">Current Project</span>
                      </div>
                    }
                    {cat.name === 'Locations' && 
                      <div className="text-xs text-slate-500 italic px-2 py-1">Locations module coming soon</div>
                    }
                    {cat.name === 'Relationships' && 
                      <div className="text-xs text-slate-500 italic px-2 py-1">Relationships map coming soon</div>
                    }`;

content = content.replace(/                      canonFacts[\s\S]*?\{cf\.category\}\n                            <\/span>\n                          <\/div>\n                        \)\)\}/, correctInjection);

fs.writeFileSync(path, content);
