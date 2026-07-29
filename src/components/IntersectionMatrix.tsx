import React, { useState } from 'react';
import { GitCommit, Sparkles, Users, Shuffle, Compass, ShieldAlert, Zap } from 'lucide-react';
import { Character, IntersectionCollision } from '../types';

interface IntersectionMatrixProps {
  characters: Character[];
  onSelectCharactersForCollision?: (charIds: string[]) => void;
}

export const IntersectionMatrix: React.FC<IntersectionMatrixProps> = ({ characters }) => {
  const [collisions, setCollisions] = useState<IntersectionCollision[]>([
    {
      id: 'coll_1',
      charIds: ['char_ava', 'char_rowan'],
      convergenceScore: 94,
      sharedThemes: ['Bloodline Duty', 'Helios Genesis Secret', 'Loss of Dr. Elena Ryder'],
      sharedLocations: ['Earth Abandoned Observatory', 'Subterranean Vault'],
      sharedCharacters: ['Liam Cross', 'High Minister Vane'],
      conflictingGoals: ['Ava wants to restore Earth restoration matrix', 'Rowan wants to force total Citadel reboot'],
      recommendedCollisionTitle: 'The Siblings Observatory Confrontation',
      recommendedPrompt: 'Stage a direct standoff between Ava and Rowan inside the glass dome where secret lineage is forced into the open.'
    },
    {
      id: 'coll_2',
      charIds: ['char_liam', 'char_rowan'],
      convergenceScore: 88,
      sharedThemes: ['Siege of Sector 2 Trauma', 'Betrayal', 'Neurological Poison'],
      sharedLocations: ['Lower Deck Armory', 'Citadel Communications Spire'],
      sharedCharacters: ['Ava Ryder'],
      conflictingGoals: ['Liam seeks justice for his fallen unit', 'Rowan views the soldiers as necessary sacrifices'],
      recommendedCollisionTitle: 'The Spire Armory Retribution',
      recommendedPrompt: 'Liam corners Rowan in the Spire as the Council enforcers breach the door.'
    },
    {
      id: 'coll_3',
      charIds: ['char_ava', 'char_liam', 'char_rowan'],
      convergenceScore: 98,
      sharedThemes: ['Citadel Solstice Assembly', 'Helios Plasma Ignition'],
      sharedLocations: ['Observatory Sub-Basement'],
      sharedCharacters: ['High Minister Vane'],
      conflictingGoals: ['Survival against approaching Council airships vs activating the core'],
      recommendedCollisionTitle: 'Ensemble Convergence Summit',
      recommendedPrompt: 'All three protagonists locked in sub-basement with airships overhead; forced three-way pact.'
    }
  ]);

  const [isCalculating, setIsCalculating] = useState(false);

  const handleRunCollisionAnalysis = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/gemini/intersection-analysis', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.collisions) {
        setCollisions(data.collisions);
      }
    } catch (e) {
      console.error('Intersection analysis failed:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Shuffle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <span>INTERSECTION & ENSEMBLE CONVERGENCE ENGINE</span>
              <span className="px-2 py-0.5 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full font-sans">Phase 7 & 8 NOS</span>
            </h2>
            <p className="text-xs text-slate-400">Crash/Magnolia-style multi-character collision matrix calculating convergence scores & plot intersections</p>
          </div>
        </div>

        <button
          onClick={handleRunCollisionAnalysis}
          disabled={isCalculating}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-purple-950"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'CALCULATING CONVERGENCE...' : 'RE-CALCULATE INTERSECTIONS'}</span>
        </button>
      </div>

      {/* Collision Cards */}
      <div className="space-y-3">
        {collisions.map((col, i) => (
          <div key={i} className="bg-[#1E293B]/60 border border-[#334155] hover:border-purple-500/50 p-4 rounded-xl space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-100 font-mono">
                  {col.charIds.map(id => characters.find(c => c.id === id)?.name || id).join(' ⚡ ')}
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <span className="text-[10px] text-slate-400">CONVERGENCE SCORE</span>
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-bold text-xs">
                  {col.convergenceScore}%
                </span>
              </div>
            </div>

            <div className="bg-[#0F172A] border border-[#334155] p-3 rounded-lg space-y-2 text-xs">
              <div className="font-bold text-purple-300 font-mono text-[11px] flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>RECOMMENDED COLLISION: {col.recommendedCollisionTitle}</span>
              </div>
              <p className="text-slate-200 leading-relaxed italic">
                "{col.recommendedPrompt}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[#0F172A]/60 p-2 rounded border border-slate-700/50">
                <span className="text-slate-400 block mb-1">SHARED THEMES & LOCATIONS:</span>
                <div className="text-slate-300 flex flex-wrap gap-1">
                  {col.sharedThemes.concat(col.sharedLocations).map((t, idx) => (
                    <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F172A]/60 p-2 rounded border border-slate-700/50">
                <span className="text-rose-400 block mb-1">CONFLICTING GOALS:</span>
                <div className="text-slate-300 space-y-0.5">
                  {col.conflictingGoals.map((cg, idx) => (
                    <div key={idx} className="text-[10px]">• {cg}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
