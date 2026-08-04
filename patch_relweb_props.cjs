const fs = require('fs');
let code = fs.readFileSync('src/components/RelationshipWeb.tsx', 'utf8');

code = code.replace(
  "  onAddRelationship: (rel: Omit<Relationship, 'id'>) => void;",
  "  onAddRelationship: (rel: Omit<Relationship, 'id'>) => void;\n  onUpdateRelationship: (rel: Relationship) => void;"
);

code = code.replace(
  "  onSelectCharacter,\n  onAddRelationship\n}) => {",
  "  onSelectCharacter,\n  onAddRelationship,\n  onUpdateRelationship\n}) => {"
);

code = code.replace(
  "const [newRelData, setNewRelData] = useState<Partial<Relationship>>({ type: 'Alliance', intensity: 5, trustScore: 0, history: '' });",
  "const [newRelData, setNewRelData] = useState<Partial<Relationship>>({ type: 'Alliance', intensity: 5, trustScore: 0, history: '' });\n  const [newLogNote, setNewLogNote] = useState('');\n  const [newLogTrust, setNewLogTrust] = useState(0);"
);

// Add the add log entry form
const addLogHtml = `
                {/* Add Log Entry */}
                <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                  <div className="text-slate-400 text-[10px] uppercase font-mono mb-1">Add Evolution Log Entry</div>
                  <input
                    type="text"
                    value={newLogNote}
                    onChange={e => setNewLogNote(e.target.value)}
                    placeholder="Event or change in relationship..."
                    className="w-full bg-[#0B1020] border border-slate-700 rounded p-1.5 text-white text-xs"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={newLogTrust}
                      onChange={e => setNewLogTrust(Number(e.target.value))}
                      placeholder="Trust change"
                      className="w-24 bg-[#0B1020] border border-slate-700 rounded p-1.5 text-white text-xs"
                    />
                    <button
                      onClick={() => {
                        if (newLogNote.trim()) {
                          const updatedRel = { ...selectedRel };
                          if (!updatedRel.historyLog) updatedRel.historyLog = [];
                          updatedRel.historyLog.push({
                            date: new Date().toISOString(),
                            trustScore: newLogTrust,
                            note: newLogNote
                          });
                          updatedRel.trustScore = Math.max(-100, Math.min(100, updatedRel.trustScore + newLogTrust));
                          onUpdateRelationship(updatedRel);
                          setNewLogNote('');
                          setNewLogTrust(0);
                        }
                      }}
                      disabled={!newLogNote.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] uppercase disabled:opacity-50"
                    >
                      Log Event
                    </button>
                  </div>
                </div>
`;

code = code.replace(
  "                )}",
  "                )}\n" + addLogHtml
);

fs.writeFileSync('src/components/RelationshipWeb.tsx', code);
console.log("Patched RelationshipWebProps");
