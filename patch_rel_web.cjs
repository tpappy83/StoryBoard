const fs = require('fs');
let code = fs.readFileSync('src/components/RelationshipWeb.tsx', 'utf8');

// Update Props
code = code.replace("onAddRelationship: () => void;", "onAddRelationship: (rel: Omit<Relationship, 'id'>) => void;");

// Add state
code = code.replace(
  "const [selectedRelId, setSelectedRelId] = useState<string | null>(relationships[0]?.id || null);",
  "const [selectedRelId, setSelectedRelId] = useState<string | null>(relationships[0]?.id || null);\n  const [isAddingMode, setIsAddingMode] = useState<boolean>(false);\n  const [newRelData, setNewRelData] = useState<Partial<Relationship>>({ type: 'Alliance', intensity: 5, trustScore: 0, history: '' });"
);

const inspectorPanel = `
          <div>
            <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isAddingMode ? 'NEW EDGE CONSTRUCTOR' : 'RELATIONSHIP INSPECTOR'}</span>
              {!isAddingMode && selectedRel && (
                <span className="bg-purple-950 text-purple-200 text-[10px] px-2 py-0.5 rounded border border-purple-800 font-bold">
                  INTENSITY {selectedRel.intensity}/10
                </span>
              )}
            </div>

            {isAddingMode ? (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase font-mono">Source Character</label>
                  <select 
                    value={newRelData.sourceCharId || ''} 
                    onChange={e => setNewRelData({...newRelData, sourceCharId: e.target.value})}
                    className="w-full bg-[#141B2D] border border-slate-700 rounded p-1.5 text-white"
                  >
                    <option value="" disabled>Select Source</option>
                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase font-mono">Target Character</label>
                  <select 
                    value={newRelData.targetCharId || ''} 
                    onChange={e => setNewRelData({...newRelData, targetCharId: e.target.value})}
                    className="w-full bg-[#141B2D] border border-slate-700 rounded p-1.5 text-white"
                  >
                    <option value="" disabled>Select Target</option>
                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase font-mono">Relationship Type</label>
                  <select 
                    value={newRelData.type} 
                    onChange={e => setNewRelData({...newRelData, type: e.target.value as RelationshipType})}
                    className="w-full bg-[#141B2D] border border-slate-700 rounded p-1.5 text-white"
                  >
                    {['Alliance', 'Conflict', 'Hidden', 'Family', 'Mentor', 'Tension', 'Rivalry'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase font-mono">Intensity (1-10)</label>
                    <input 
                      type="number" min="1" max="10" 
                      value={newRelData.intensity} 
                      onChange={e => setNewRelData({...newRelData, intensity: Number(e.target.value)})}
                      className="w-full bg-[#141B2D] border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase font-mono">Trust (-100 to 100)</label>
                    <input 
                      type="number" min="-100" max="100" 
                      value={newRelData.trustScore} 
                      onChange={e => setNewRelData({...newRelData, trustScore: Number(e.target.value)})}
                      className="w-full bg-[#141B2D] border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase font-mono">History</label>
                  <textarea 
                    value={newRelData.history} 
                    onChange={e => setNewRelData({...newRelData, history: e.target.value})}
                    className="w-full bg-[#141B2D] border border-slate-700 rounded p-1.5 text-white h-16 resize-none"
                    placeholder="Describe their history..."
                  />
                </div>
              </div>
            ) : selectedRel && sourceChar && targetChar ? (
              <div className="space-y-3 text-xs">
                {/* Character Pair */}
`;

code = code.replace(/<div>\s*<div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">[\s\S]*?\{\/\* Character Pair \*\//m, inspectorPanel);

const buttonReplace = `
          {isAddingMode ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingMode(false)}
                className="w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  if (newRelData.sourceCharId && newRelData.targetCharId) {
                    onAddRelationship(newRelData as Omit<Relationship, 'id'>);
                    setIsAddingMode(false);
                  }
                }}
                disabled={!newRelData.sourceCharId || !newRelData.targetCharId}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50"
              >
                SAVE EDGE
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingMode(true)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <GitCommit className="w-4 h-4" />
              <span>+ ADD NEW RELATIONSHIP EDGE</span>
            </button>
          )}
        </div>
      </div>
    </div>
`;

code = code.replace(/<button\s*onClick=\{onAddRelationship\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/m, buttonReplace);

fs.writeFileSync('src/components/RelationshipWeb.tsx', code);
console.log("Patched RelationshipWeb.tsx");
