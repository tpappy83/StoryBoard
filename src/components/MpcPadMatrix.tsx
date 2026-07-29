import React from 'react';
import { Scene, Character } from '../types';
import { Play, Volume2, Plus, Sparkles, AlertTriangle, CheckCircle2, Clock, GitMerge, FileEdit } from 'lucide-react';

interface MpcPadMatrixProps {
  scenes: Scene[];
  characters: Character[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onNewSceneOnPad: (padIndex: number) => void;
  soundEnabled: boolean;
}

export const MpcPadMatrix: React.FC<MpcPadMatrixProps> = ({
  scenes,
  characters,
  selectedSceneId,
  onSelectScene,
  onNewSceneOnPad,
  soundEnabled
}) => {
  // Web Audio API beep simulator for DAW pad feel
  const playPadSound = (freq = 220) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Build 16 MPC pads
  const padIndices = Array.from({ length: 16 }, (_, i) => i + 1);

  const getPadScene = (index: number) => {
    return scenes.find(s => s.padIndex === index);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 hover:border-emerald-400 glow-success';
      case 'Drafted':
        return 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200 hover:border-indigo-400 glow-primary';
      case 'Pending':
        return 'bg-amber-950/60 border-amber-500/80 text-amber-200 hover:border-amber-400 glow-warning';
      case 'Violation':
        return 'bg-rose-950/80 border-rose-500/80 text-rose-200 hover:border-rose-400 glow-warning';
      case 'Convergence':
        return 'bg-purple-950/80 border-purple-500/80 text-purple-200 hover:border-purple-400 glow-secondary';
      default:
        return 'bg-[#0B1020] border-[#1A2338] text-slate-500 hover:border-indigo-500/40 hover:text-slate-300';
    }
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl space-y-4">
      {/* DAW Matrix Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg border border-indigo-500/30">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              MPC SCENE PAD SEQUENCER
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                16 PADS ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Click pads to load scene prose, trigger audio feedback, or create new scene blocks.
            </p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Drafted
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Convergence
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Violation
          </span>
        </div>
      </div>

      {/* 4x4 Pad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-daw-grid p-3 rounded-lg bg-[#0B1020]/80 border border-[#1A2338]">
        {padIndices.map(padNum => {
          const scene = getPadScene(padNum);
          const isSelected = scene && selectedSceneId === scene.id;

          return (
            <div
              key={padNum}
              onClick={() => {
                playPadSound(150 + padNum * 15);
                if (scene) {
                  onSelectScene(scene.id);
                } else {
                  onNewSceneOnPad(padNum);
                }
              }}
              className={`relative h-28 p-3 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between group select-none active:scale-95 ${getStatusColor(
                scene?.status
              )} ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#0B1020] scale-[1.02]' : ''}`}
            >
              {/* Pad Number Badge */}
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                  PAD {padNum.toString().padStart(2, '0')}
                </span>

                {scene && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-black/40">
                    {scene.status}
                  </span>
                )}
              </div>

              {/* Pad Scene Title or Empty Trigger */}
              {scene ? (
                <div className="my-1">
                  <div className="text-xs font-bold truncate group-hover:text-white transition-colors">
                    {scene.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                    {scene.location}
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center flex flex-col items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-colors">
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">ASSIGN SCENE</span>
                </div>
              )}

              {/* Footer info: Word count & Character dots */}
              {scene && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10 font-mono">
                  <span>{scene.wordCount} words</span>

                  <div className="flex items-center -space-x-1">
                    {scene.participantIds.map(charId => {
                      const char = characters.find(c => c.id === charId);
                      return (
                        <div
                          key={charId}
                          className="w-3.5 h-3.5 rounded-full bg-slate-700 border border-slate-900 text-[8px] flex items-center justify-center font-bold text-white overflow-hidden"
                          title={char?.name || charId}
                        >
                          {char ? char.name[0] : '?'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
