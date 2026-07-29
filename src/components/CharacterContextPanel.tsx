import React, { useState } from 'react';
import { Character, Scene } from '../types';
import { User, Heart, Target, Key, Sparkles, Brain, ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface CharacterContextPanelProps {
  scene: Scene | null;
  characters: Character[];
  onSelectCharacter?: (charId: string) => void;
}

export const CharacterContextPanel: React.FC<CharacterContextPanelProps> = ({
  scene,
  characters,
  onSelectCharacter
}) => {
  const [synthesisMap, setSynthesisMap] = useState<Record<string, any>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const participantChars = scene 
    ? characters.filter(c => scene.participantIds.includes(c.id))
    : characters.slice(0, 2);

  const handleFetchSynthesis = async (charId: string) => {
    setLoadingMap(prev => ({ ...prev, [charId]: true }));
    try {
      const res = await fetch('/api/gemini/character-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charId })
      });
      const data = await res.json();
      if (data.success && data.synthesis) {
        setSynthesisMap(prev => ({ ...prev, [charId]: data.synthesis }));
      }
    } catch (e) {
      console.error('Failed to run character synthesis:', e);
    } finally {
      setLoadingMap(prev => ({ ...prev, [charId]: false }));
    }
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-3 shadow-2xl flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2338] pb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600/20 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/30">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1">
              CHARACTER CONTEXT
            </h3>
            <p className="text-[10px] text-slate-400">Participating scene dossier</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
          20% DRAWER
        </span>
      </div>

      {/* Roster of Scene Participants */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {participantChars.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">
            No participating characters assigned to this scene.
          </div>
        ) : (
          participantChars.map(char => {
            const synth = synthesisMap[char.id];
            const isLoading = loadingMap[char.id];

            return (
              <div 
                key={char.id}
                className="bg-[#0B1020] border border-[#1A2338] hover:border-indigo-500/40 rounded-xl p-3 space-y-2.5 transition-all"
              >
                {/* Character Name & Portrait Header */}
                <div className="flex items-center space-x-2.5">
                  <img
                    src={char.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={char.name}
                    className="w-9 h-9 rounded-lg object-cover border border-indigo-500/50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{char.name}</span>
                      <span className="text-[9px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800">
                        {char.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <span>Mood:</span>
                      <strong className="text-indigo-300 font-normal">{char.emotionalState.mood}</strong>
                    </div>
                  </div>
                </div>

                {/* Emotional Gauge */}
                <div className="space-y-1 bg-[#141B2D] p-2 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> EMOTIONAL METER
                    </span>
                    <span className="text-rose-400 font-bold">{char.emotionalState.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${char.emotionalState.score}%` }} />
                  </div>
                </div>

                {/* Active Goal */}
                <div className="text-[11px] text-slate-300 bg-[#141B2D] p-2 rounded-lg border border-slate-800/80 space-y-0.5">
                  <div className="text-[9px] font-mono text-emerald-400 uppercase flex items-center gap-1 font-bold">
                    <Target className="w-3 h-3" /> ACTIVE GOAL
                  </div>
                  <p className="line-clamp-2 text-[10px] text-slate-300 leading-snug">{char.goals}</p>
                </div>

                {/* Secrets Preview */}
                {char.secrets.length > 0 && (
                  <div className="text-[10px] bg-[#141B2D] p-2 rounded-lg border border-amber-950/60 text-amber-200/90 font-mono space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400 uppercase">
                      <Key className="w-3 h-3" /> SECRET ({char.secrets.length})
                    </div>
                    <p className="truncate text-[10px] italic">"{char.secrets[0]}"</p>
                  </div>
                )}

                {/* Gemini High Thinking Psychology Spark */}
                {synth ? (
                  <div className="bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border border-indigo-500/40 p-2.5 rounded-lg space-y-1 text-[10px]">
                    <div className="text-indigo-300 font-bold flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> HIGH THINKING AI SYNTHESIS
                    </div>
                    <div className="text-slate-200"><strong className="text-indigo-400">Conflict:</strong> {synth.internalConflict}</div>
                    <div className="text-slate-300"><strong className="text-purple-300">Milestone:</strong> {synth.arcTransformationMilestone}</div>
                    {synth.relationshipFlashpoints && (
                      <div className="text-amber-300"><strong className="text-amber-400">Flashpoint:</strong> {synth.relationshipFlashpoints[0]}</div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleFetchSynthesis(char.id)}
                    disabled={isLoading}
                    className="w-full py-1.5 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-800 text-indigo-300 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{isLoading ? 'ANALYZING...' : 'RUN HIGH THINKING PSYCHOLOGY'}</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
