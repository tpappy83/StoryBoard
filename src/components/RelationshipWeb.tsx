import React, { useState } from 'react';
import { Character, Relationship, RelationshipType } from '../types';
import { GitCommit, Heart, ShieldAlert, Key, Users, Eye, HelpCircle, RefreshCw } from 'lucide-react';

interface RelationshipWebProps {
  characters: Character[];
  relationships: Relationship[];
  selectedCharId: string | null;
  onSelectCharacter: (charId: string) => void;
  onAddRelationship: () => void;
}

export const RelationshipWeb: React.FC<RelationshipWebProps> = ({
  characters,
  relationships,
  selectedCharId,
  onSelectCharacter,
  onAddRelationship
}) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  const [selectedRelId, setSelectedRelId] = useState<string | null>(relationships[0]?.id || null);

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
        <div className="lg:col-span-2 bg-[#0B1020] rounded-xl border border-[#1A2338] p-2 relative h-96 flex items-center justify-center overflow-hidden bg-daw-grid">
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
        </div>

        {/* Relationship Inspector Panel */}
        <div className="bg-[#0B1020] rounded-xl border border-[#1A2338] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>RELATIONSHIP INSPECTOR</span>
              {selectedRel && (
                <span className="bg-purple-950 text-purple-200 text-[10px] px-2 py-0.5 rounded border border-purple-800 font-bold">
                  INTENSITY {selectedRel.intensity}/10
                </span>
              )}
            </div>

            {selectedRel && sourceChar && targetChar ? (
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
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-8 text-center">
                Click any line in the web graph to inspect detailed trust score and lore history.
              </div>
            )}
          </div>

          <button
            onClick={onAddRelationship}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <GitCommit className="w-4 h-4" />
            <span>+ ADD NEW RELATIONSHIP EDGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
