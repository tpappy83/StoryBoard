const fs = require('fs');
let code = fs.readFileSync('src/components/RelationshipWeb.tsx', 'utf8');

const historyHtml = `
                {/* Backstory / Narrative History */}
                <div className="space-y-1">
                  <div className="text-slate-400 text-[11px] font-mono uppercase">CANON HISTORY</div>
                  <p className="text-slate-300 bg-[#141B2D] p-2.5 rounded border border-slate-800 text-xs leading-relaxed">
                    {selectedRel.history}
                  </p>
                </div>

                {/* Timestamped History Log */}
                {selectedRel.historyLog && selectedRel.historyLog.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                    <div className="text-slate-400 text-[11px] font-mono uppercase flex items-center justify-between">
                      <span>EVOLUTION LOG</span>
                      <span className="text-indigo-400">{selectedRel.historyLog.length} ENTRIES</span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedRel.historyLog.map((log, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500">{new Date(log.date).toLocaleString()}</span>
                            <span className={log.trustScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {log.trustScore > 0 ? \`+\${log.trustScore}\` : log.trustScore} Trust
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs">{log.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
`;

code = code.replace(
  `                {/* Backstory / Narrative History */}
                <div className="space-y-1">
                  <div className="text-slate-400 text-[11px] font-mono uppercase">CANON HISTORY</div>
                  <p className="text-slate-300 bg-[#141B2D] p-2.5 rounded border border-slate-800 text-xs leading-relaxed">
                    {selectedRel.history}
                  </p>
                </div>`,
  historyHtml
);

fs.writeFileSync('src/components/RelationshipWeb.tsx', code);
console.log("Patched RelationshipWeb.tsx");
