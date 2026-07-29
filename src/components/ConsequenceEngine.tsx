import React, { useState } from 'react';
import { GitBranch, HeartHandshake, Zap, Brain, Shield, AlertTriangle, Layers, ArrowUpRight } from 'lucide-react';
import { Character, CharacterMemory } from '../types';

interface ConsequenceEngineProps {
  characters: Character[];
  onUpdateCharacterMemory?: (charId: string, memory: CharacterMemory) => void;
}

export const ConsequenceEngine: React.FC<ConsequenceEngineProps> = ({ characters }) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || 'char_ava');
  const activeChar = characters.find(c => c.id === selectedCharId) || characters[0];

  const emotionalVector = activeChar?.emotionalVector || {
    hope: 72,
    fear: 35,
    anger: 25,
    trust: 68,
    confidence: 80
  };

  const detailedGoals = activeChar?.detailedGoals || [
    { id: 'g1', title: 'Retrieve Helios Core Artifact', priority: 10, status: 'active', obstacle: 'Council Enforcer Patrols' },
    { id: 'g2', title: 'Shield Liam from Neurological Trigger', priority: 8, status: 'active', obstacle: 'Dormant poison signal' }
  ];

  const memories = activeChar?.memories || [
    { id: 'mem1', characterId: activeChar?.id || 'char_ava', title: 'Mother’s Encoded Transmission', importance: 10, emotionalImpact: 9, chapter: 1, category: 'trauma', description: 'Received Dr. Elena Ryder’s final message before the Observatory fell silent.' },
    { id: 'mem2', characterId: activeChar?.id || 'char_ava', title: 'Sector 4 Extraction Victory', importance: 8, emotionalImpact: 7, chapter: 1, category: 'positive', description: 'Guided miners through the falling rubble during the Council purge.' }
  ];

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <span>NARRATIVE CONSEQUENCE & MEMORY ENGINE</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-sans">Phase 2 & 3 NOS</span>
            </h2>
            <p className="text-xs text-slate-400">Scenes update persistent 5-axis emotional vectors, active goals, and episodic memory vaults</p>
          </div>
        </div>

        {/* Character Selector */}
        <div className="flex items-center space-x-1.5 bg-[#1E293B] p-1 rounded-xl border border-[#334155]">
          {characters.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCharId(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                selectedCharId === c.id
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 5-Axis Emotional Vector & Goal System */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#1E293B]/60 border border-[#334155] p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold font-mono text-emerald-400">
              <span className="flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>5-AXIS EMOTIONAL VECTOR ({activeChar?.name})</span>
              </span>
              <span className="text-slate-400 text-[11px] font-sans">Current Mood: {activeChar?.emotionalState?.mood}</span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'HOPE', val: emotionalVector.hope, color: 'bg-emerald-500' },
                { label: 'FEAR', val: emotionalVector.fear, color: 'bg-rose-500' },
                { label: 'ANGER', val: emotionalVector.anger, color: 'bg-amber-500' },
                { label: 'TRUST', val: emotionalVector.trust, color: 'bg-sky-500' },
                { label: 'CONFIDENCE', val: emotionalVector.confidence, color: 'bg-purple-500' }
              ].map(axis => (
                <div key={axis.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono text-slate-300">{axis.label}</span>
                    <span className="font-mono text-slate-200 font-bold">{axis.val}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${axis.color}`}
                      style={{ width: `${axis.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Goal System */}
          <div className="bg-[#1E293B]/60 border border-[#334155] p-4 rounded-xl space-y-3">
            <div className="text-xs font-bold font-mono text-emerald-400 flex items-center space-x-1.5">
              <GitBranch className="w-4 h-4" />
              <span>DYNAMIC GOAL SYSTEM</span>
            </div>

            <div className="space-y-2">
              {detailedGoals.map(g => (
                <div key={g.id} className="bg-[#0F172A] border border-[#334155] p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-100">{g.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      g.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      g.status === 'blocked' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      PRIORITY {g.priority} • {g.status.toUpperCase()}
                    </span>
                  </div>
                  {g.obstacle && (
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span>Obstacle: {g.obstacle}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Character Memory System Vault */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-[#1E293B]/60 border border-[#334155] p-4 rounded-xl space-y-3 h-full">
            <div className="flex items-center justify-between text-xs font-bold font-mono text-emerald-400">
              <span className="flex items-center space-x-1.5">
                <Brain className="w-4 h-4" />
                <span>EPISODIC CHARACTER MEMORY VAULT</span>
              </span>
              <span className="text-slate-400 text-[10px]">{memories.length} ENTRIES</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
              {memories.map(mem => (
                <div key={mem.id} className="bg-[#0F172A] border border-[#334155] hover:border-slate-500 p-3 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{mem.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      mem.category === 'trauma' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      mem.category === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {mem.category.toUpperCase()} • CH.{mem.chapter}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mem.description}
                  </p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono pt-1">
                    <span>IMPORTANCE: {mem.importance}/10</span>
                    <span>EMOTIONAL IMPACT: {mem.emotionalImpact}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
