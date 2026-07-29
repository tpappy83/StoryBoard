import React, { useState } from 'react';
import { PlotThread, Scene } from '../types';
import { ChevronUp, ChevronDown, Sliders, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface BottomTrackMixerProps {
  plotThreads: PlotThread[];
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
}

export const BottomTrackMixer: React.FC<BottomTrackMixerProps> = ({
  plotThreads,
  scenes,
  selectedSceneId,
  onSelectScene
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mutedThreads, setMutedThreads] = useState<Record<string, boolean>>({});
  const [soloThreads, setSoloThreads] = useState<Record<string, boolean>>({});

  const toggleMute = (id: string) => {
    setMutedThreads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSolo = (id: string) => {
    setSoloThreads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const phases = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="bg-[#141B2D] border-t border-[#1A2338] shadow-2xl sticky bottom-0 z-30">
      {/* Collapsible Bar Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2 bg-[#0B1020] border-b border-[#1A2338] flex items-center justify-between cursor-pointer hover:bg-[#141B2D] transition-colors"
      >
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>▲ STORY TRACK MIXER & SEQUENCER</span>
          <span className="text-[10px] text-slate-500 font-normal">({plotThreads.length} ACTIVE THREAD TRACKS)</span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="text-[10px] font-mono">{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Track Lanes */}
      {isExpanded && (
        <div className="p-3 bg-[#0B1020] overflow-x-auto space-y-2 text-xs bg-daw-grid max-h-48">
          <div className="min-w-[700px] space-y-2">
            {plotThreads.map(thread => {
              const isMuted = mutedThreads[thread.id];
              const isSolo = soloThreads[thread.id];
              const threadScenes = scenes.filter(s => s.threadId === thread.id);

              return (
                <div
                  key={thread.id}
                  className={`flex items-center space-x-3 p-1.5 rounded-lg border transition-all ${
                    isMuted ? 'opacity-40 bg-black/40 border-slate-900' : 'bg-[#141B2D] border-[#1A2338]'
                  }`}
                >
                  {/* Track Channel Controls */}
                  <div className="w-44 flex-shrink-0 flex items-center justify-between pr-2 border-r border-slate-800">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thread.color }} />
                      <span className="font-bold text-slate-200 text-xs truncate">{thread.name}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] font-mono font-bold">
                      <button
                        onClick={e => { e.stopPropagation(); toggleMute(thread.id); }}
                        className={`px-1.5 py-0.5 rounded ${
                          isMuted ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-400'
                        }`}
                        title="Mute Track"
                      >
                        M
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); toggleSolo(thread.id); }}
                        className={`px-1.5 py-0.5 rounded ${
                          isSolo ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-400'
                        }`}
                        title="Solo Track"
                      >
                        S
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Timeline Track Slots */}
                  <div className="flex-1 grid grid-cols-8 gap-2">
                    {phases.map(phase => {
                      const sc = threadScenes.find(s => s.timelinePhase === phase);
                      const isSelected = sc && selectedSceneId === sc.id;

                      return (
                        <div key={phase} className="h-8 flex items-center">
                          {sc ? (
                            <div
                              onClick={() => onSelectScene(sc.id)}
                              className={`w-full h-7 px-2 rounded border text-[10px] font-mono font-bold flex items-center justify-between truncate cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                  : 'bg-[#0B1020] text-slate-200 border-indigo-500/40 hover:border-indigo-400'
                              }`}
                            >
                              <span className="truncate">{sc.title}</span>
                              <span className="text-[8px] opacity-70 ml-1">P{sc.padIndex}</span>
                            </div>
                          ) : (
                            <div className="w-full h-5 border border-dashed border-slate-800 rounded bg-black/20" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
