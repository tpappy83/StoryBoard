import React, { useState } from 'react';
import { Character, Relationship, RelationshipType } from '../types';
import { GitCommit, Heart, ShieldAlert, Key, Users, Eye, HelpCircle, RefreshCw } from 'lucide-react';
import { DropTarget } from './workspace/DropTarget';
import { DragPayload } from '../stores/workspaceStore';

interface RelationshipWebProps {
  characters: Character[];
  relationships: Relationship[];
  selectedCharId: string | null;
  onSelectCharacter: (charId: string) => void;
  onAddRelationship: (rel: Omit<Relationship, 'id'>) => void;
  onUpdateRelationship: (rel: Relationship) => void;
}

export const RelationshipWeb: React.FC<RelationshipWebProps> = ({
  characters,
  relationships,
  selectedCharId,
  onSelectCharacter,
  onAddRelationship,
  onUpdateRelationship
}) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  const [selectedRelId, setSelectedRelId] = useState<string | null>(relationships[0]?.id || null);
  const [isAddingMode, setIsAddingMode] = useState<boolean>(false);
  const [newRelData, setNewRelData] = useState<Partial<Relationship>>({ type: 'Alliance', intensity: 5, trustScore: 0, history: '' });
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogTrust, setNewLogTrust] = useState(0);

  // Layout node positions in a dynamic circular grid
  const nodePositions: Record<string, { x: number; y: number }> = {
    char_ava: { x: 180, y: 110 },
    char_liam: { x: 420, y: 110 },
    char_rowan: { x: 420, y: 290 },
    char_council: { x: 180, y: 290 },
  };

  // Assign fallback positions for additional characters
  characters.forEach((char, index) => {
    if (!nodePositions[char.id]) {
      const angle = (index * 2 * Math.PI) / characters.length;
      nodePositions[char.id] = {
        x: 300 + Math.cos(angle) * 140,
        y: 200 + Math.sin(angle) * 100,
      };
    }
  });

  const getEdgeColor = (type: RelationshipType) => {
    switch (type) {
      case 'Alliance': return '#22C55E';
      case 'Conflict': return '#EF4444';
      case 'Hidden': return '#8B5CF6';
      case 'Family': return '#F59E0B';
      case 'Tension': return '#06B6D4';
      case 'Mentor': return '#3B82F6';
      default: return '#94A3B8';
    }
  };

  const filteredRelationships = relationships.filter(
    r => activeTypeFilter === 'ALL' || r.type.toUpperCase() === activeTypeFilter.toUpperCase()
  );

  const selectedRel = relationships.find(r => r.id === selectedRelId);
  const sourceChar = selectedRel ? characters.find(c => c.id === selectedRel.sourceCharId) : null;
  const targetChar = selectedRel ? characters.find(c => c.id === selectedRel.targetCharId) : null;

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600/20 text-purple-400 p-2 rounded-lg border border-purple-500/30">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              CHARACTER RELATIONSHIP WEB
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                DYNAMIC GRAPH
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive social matrix showing alliance networks, covert betrayals, and trust levels.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1.5 text-xs">
          {['ALL', 'ALLIANCE', 'CONFLICT', 'HIDDEN', 'TENSION'].map(type => (
            <button
              key={type}
              onClick={() => setActiveTypeFilter(type)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                activeTypeFilter === type
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#0B1020] text-slate-400 border border-[#1A2338] hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Canvas */}
        <DropTarget
          accepts={['character']}
          label="to Select Character Node"
          onDrop={(payload: DragPayload) => {
            if (payload.type === 'character') {
              onSelectCharacter(payload.id);
            }
          }}
          className="lg:col-span-2 bg-[#0B1020] rounded-xl border border-[#1A2338] p-2 relative h-96 flex items-center justify-center overflow-hidden bg-daw-grid"
        >
          <svg className="w-full h-full">
            {/* Render Relationship Edges */}
            {filteredRelationships.map(rel => {
              const srcPos = nodePositions[rel.sourceCharId] || { x: 200, y: 200 };
              const tgtPos = nodePositions[rel.targetCharId] || { x: 400, y: 200 };
              const isSelected = selectedRelId === rel.id;
              const color = getEdgeColor(rel.type);

              return (
                <g key={rel.id} className="cursor-pointer group" onClick={() => setSelectedRelId(rel.id)}>
                  {/* Outer glow line */}
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={color}
                    strokeWidth={isSelected ? 6 : rel.intensity / 2}
                    strokeOpacity={isSelected ? 0.9 : 0.6}
                    className="transition-all duration-300 group-hover:stroke-width-6"
                  />

                  {/* Midpoint Label Badge */}
                  <g transform={`translate(${(srcPos.x + tgtPos.x) / 2}, ${(srcPos.y + tgtPos.y) / 2})`}>
                    <rect
                      x="-35"
                      y="-12"
                      width="70"
                      height="24"
                      rx="6"
                      fill="#141B2D"
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3"
                      fill="#F8FAFC"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {rel.type.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Render Character Nodes */}
            {characters.map(char => {
              const pos = nodePositions[char.id] || { x: 200, y: 200 };
              const isSelected = selectedCharId === char.id;

              return (
                <g
                  key={char.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectCharacter(char.id)}
                >
                  <circle
                    r="28"
                    fill="#141B2D"
                    stroke={isSelected ? '#6D8CFF' : '#334155'}
                    strokeWidth={isSelected ? '4' : '2'}
                    className="transition-all duration-200 group-hover:scale-110 shadow-lg"
                  />
                  <circle
                    r="22"
                    fill={char.role === 'Protagonist' ? '#4F46E5' : char.role === 'Antagonist' ? '#DC2626' : '#2563EB'}
                    fillOpacity="0.8"
                  />
                  <text
                    x="0"
                    y="4"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {char.name.split(' ')[0]}
                  </text>
                  <text
                    x="0"
                    y="42"
                    fill="#94A3B8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-black/60 px-1 rounded"
                  >
                    {char.role}
                  </text>
                </g>
              );
            })}
          </svg>
        </DropTarget>

        {/* Relationship Inspector Panel */}
        <div className="bg-[#0B1020] rounded-xl border border-[#1A2338] p-4 flex flex-col justify-between space-y-3">
          
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
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141B2D] border border-slate-800">
                  <div className="text-center">
                    <div className="font-bold text-slate-100">{sourceChar.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sourceChar.role}</div>
                  </div>
                  <div className="text-purple-400 font-mono font-bold text-xs uppercase px-2 py-1 rounded bg-purple-950/60 border border-purple-800">
                    {selectedRel.type}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-100">{targetChar.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{targetChar.role}</div>
                  </div>
                </div>

                {/* Trust Score Dial */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                    <span>TRUST METRIC</span>
                    <span className={selectedRel.trustScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {selectedRel.trustScore > 0 ? `+${selectedRel.trustScore}` : selectedRel.trustScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedRel.trustScore >= 50 ? 'bg-emerald-500' :
                        selectedRel.trustScore >= 0 ? 'bg-indigo-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, (selectedRel.trustScore + 100) / 2)}%` }}
                    />
                  </div>
                </div>


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
                              {log.trustScore > 0 ? `+${log.trustScore}` : log.trustScore} Trust
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs">{log.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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


              </div>
            ) : (
              <div className="text-slate-500 text-xs py-8 text-center">
                Click any line in the web graph to inspect detailed trust score and lore history.
              </div>
            )}
          </div>

          
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

  );
};
