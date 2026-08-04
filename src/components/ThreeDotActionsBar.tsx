import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical, Sliders, X, Clapperboard, CheckCircle, FileText, Download,
  Zap, Sparkles, ShieldCheck, Info, MapPin, User, Activity, BookOpen, GitCommit, Clock
} from 'lucide-react';
import { Scene, Character, PlotThread, CanonFact, SetupPayoffEvent, SelectedNarrativeObject } from '../types';

interface ThreeDotActionsBarProps {
  label?: string;
  onSaveScene?: () => void;
  onOpenWritingStudio?: () => void;
  onExportScene?: () => void;
  onOpenGoogleDocs?: () => void;
  onRunMultiPassRevision?: () => void;
  onOpenAiDrawer?: () => void;
  onRunAudit?: () => void;
  
  // New Inspector Props
  scene?: Scene;
  characters?: Character[];
  plotThreads?: PlotThread[];
  canonFacts?: CanonFact[];
  setups?: SetupPayoffEvent[];
  payoffs?: any[];
  selectedObject?: SelectedNarrativeObject | null;
  onClearSelection?: () => void;
  onSelectCharacter?: (id: string) => void;
}

export const ThreeDotActionsBar: React.FC<ThreeDotActionsBarProps> = ({
  label,
  onSaveScene,
  onOpenWritingStudio,
  onExportScene,
  onOpenGoogleDocs,
  onRunMultiPassRevision,
  onOpenAiDrawer,
  onRunAudit,
  scene,
  characters = [],
  plotThreads = [],
  canonFacts = [],
  setups = [],
  payoffs = [],
  selectedObject,
  onClearSelection,
  onSelectCharacter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'CONTEXT' | 'CAST' | 'LORE'>('ACTIONS');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const participatingChars = characters.filter((c) =>
    scene?.characters?.includes(c.id)
  );

  const activeSetups = setups.filter(
    (s) => !s.payoffSceneId || s.payoffSceneId === scene?.id
  );

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
          isOpen
            ? 'bg-[#000000] border-[#F2C94C] text-[#F2C94C] shadow-[0_0_12px_rgba(242,201,76,0.3)] scale-105'
            : 'bg-[#0A2A43] hover:bg-[#0E3859] border-[#153B5C] text-[#C4C4C4] hover:text-[#F2C94C]'
        }`}
        title="Open Actions & Context Menu"
        aria-label="Actions Menu"
      >
        <MoreVertical className="w-4 h-4 transition-transform duration-150" />
        {label && <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{label}</span>}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl bg-[#000000] border border-[#153B5C] shadow-2xl z-50 flex flex-col overflow-hidden transform origin-top-right transition-all duration-150 animate-in fade-in zoom-in-95"
          style={{ transitionDuration: '150ms', maxHeight: '85vh' }}
        >
          <div className="bg-[#0A2A43] border-b border-[#153B5C]">
            <div className="px-3.5 py-2 flex items-center justify-between border-b border-[#153B5C]/50">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-[#F2C94C]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Menu & Context
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#C4C4C4] hover:text-white p-0.5 rounded hover:bg-[#0E3859]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex px-1 space-x-1 pt-1 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('ACTIONS')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === 'ACTIONS' ? 'bg-[#000000] text-[#F2C94C]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Actions
              </button>
              <button
                onClick={() => setActiveTab('CONTEXT')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === 'CONTEXT' ? 'bg-[#000000] text-[#F2C94C]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Context
              </button>
              <button
                onClick={() => setActiveTab('CAST')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === 'CAST' ? 'bg-[#000000] text-[#F2C94C]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cast
              </button>
              <button
                onClick={() => setActiveTab('LORE')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === 'LORE' ? 'bg-[#000000] text-[#F2C94C]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lore
              </button>
            </div>
          </div>

          <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
            {activeTab === 'ACTIONS' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider px-1">
                    Scene & Manuscript
                  </div>
                  {onSaveScene && (
                    <button
                      onClick={() => { onSaveScene(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-[#F2C94C]" />
                      <span>Save Changes to Canon</span>
                    </button>
                  )}
                  {onOpenWritingStudio && (
                    <button
                      onClick={() => { onOpenWritingStudio(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <Clapperboard className="w-3.5 h-3.5 text-indigo-400 group-hover:text-[#F2C94C]" />
                      <span>Open in Writing Studio</span>
                    </button>
                  )}
                  {onExportScene && (
                    <button
                      onClick={() => { onExportScene(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400 group-hover:text-[#F2C94C]" />
                      <span>Export Final Draft Format</span>
                    </button>
                  )}
                  {onOpenGoogleDocs && (
                    <button
                      onClick={() => { onOpenGoogleDocs(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:text-[#F2C94C]" />
                      <span>Sync with Google Docs</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1 border-t border-[#153B5C] pt-3">
                  <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider px-1">
                    AI Revision Engine
                  </div>
                  {onRunMultiPassRevision && (
                    <button
                      onClick={() => { onRunMultiPassRevision(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#F2C94C] group-hover:scale-110 transition-transform" />
                      <span>Multi-Pass AI Revision</span>
                    </button>
                  )}
                  {onOpenAiDrawer && (
                    <button
                      onClick={() => { onOpenAiDrawer(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-[#F2C94C]" />
                      <span>Advisory Council Feedback</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1 border-t border-[#153B5C] pt-3">
                  <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider px-1">
                    Continuity & Quality Flags
                  </div>
                  {onRunAudit && (
                    <button
                      onClick={() => { onRunAudit(); setIsOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#0A2A43] flex items-center space-x-2.5 transition-colors group"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:text-[#F2C94C]" />
                      <span>Audit Universe Continuity</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'CONTEXT' && (
              <div className="space-y-4">
                {scene ? (
                  <>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider">
                        Active Scene Context
                      </div>
                      <div className="text-sm font-bold text-white">{scene.title || 'Untitled Scene'}</div>
                    </div>
                    
                    <div className="bg-[#0A2A43]/50 border border-[#153B5C] rounded-xl p-3 space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-[#F2C94C] shrink-0" />
                        <span>{scene.location || 'Unspecified Location'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{scene.timing || 'Unspecified Time'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#0A2A43]/50 border border-[#153B5C] rounded-xl p-2.5">
                        <div className="text-[10px] text-[#C4C4C4] uppercase">Word Count</div>
                        <div className="font-bold text-white mt-0.5">
                          {scene.wordCount || 0} / <span className="text-[#F2C94C]">{scene.targetWordCount || 1000}</span>
                        </div>
                      </div>
                      <div className="bg-[#0A2A43]/50 border border-[#153B5C] rounded-xl p-2.5">
                        <div className="text-[10px] text-[#C4C4C4] uppercase">Emotional Tone</div>
                        <div className="font-bold text-[#F2C94C] mt-0.5">
                          {scene.emotionalTone || 'Tense / Escalating'}
                        </div>
                      </div>
                    </div>

                    {activeSetups.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#153B5C]">
                        <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider flex items-center justify-between">
                          <span>Active Setups & Obligations</span>
                          <span className="text-[#F2C94C]">{activeSetups.length}</span>
                        </div>
                        {activeSetups.map((setup) => (
                          <div key={setup.id} className="bg-[#0A2A43]/30 border border-[#153B5C] rounded-lg p-2.5 text-xs text-slate-200">
                            <div className="font-bold text-[#F2C94C]">{setup.title}</div>
                            <div className="text-[10px] text-[#C4C4C4] mt-0.5 line-clamp-2">{setup.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-[#0A2A43]/40 border border-[#153B5C] rounded-xl p-4 text-center text-xs text-[#C4C4C4]">
                    No active scene selected.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'CAST' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider">
                  Participating Cast ({participatingChars.length})
                </div>
                {participatingChars.length > 0 ? (
                  participatingChars.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => onSelectCharacter && onSelectCharacter(char.id)}
                      className="bg-[#0A2A43] hover:bg-[#0E3859] border border-[#153B5C] rounded-xl p-3 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white group-hover:text-[#F2C94C]">
                          {char.name}
                        </span>
                        <span className="text-[10px] bg-[#000000] text-[#C4C4C4] px-1.5 py-0.5 rounded border border-[#153B5C]">
                          {char.role}
                        </span>
                      </div>
                      {char.emotionalState?.mood && (
                        <div className="text-[10px] text-[#C4C4C4]">
                          Mood: <span className="text-slate-200">{char.emotionalState.mood}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-[#0A2A43]/30 border border-[#153B5C] rounded-xl p-4 text-center text-xs text-[#C4C4C4]">
                    No characters assigned to this scene.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'LORE' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider">
                  Canon Principles ({canonFacts.length})
                </div>
                {canonFacts.length > 0 ? (
                  canonFacts.map((fact) => (
                    <div key={fact.id} className="bg-[#0A2A43]/40 border border-[#153B5C] rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#F2C94C] font-bold">
                        <span>{fact.category || 'Canon Rule'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-slate-200">{fact.fact}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#0A2A43]/30 border border-[#153B5C] rounded-xl p-4 text-center text-xs text-[#C4C4C4]">
                    No canon facts recorded.
                  </div>
                )}
                
                {plotThreads.length > 0 && (
                  <>
                    <div className="text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider pt-2 border-t border-[#153B5C]">
                      Active Plot Threads ({plotThreads.length})
                    </div>
                    {plotThreads.map((thread) => (
                      <div key={thread.id} className="bg-[#0A2A43]/40 border border-[#153B5C] rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{thread.name}</span>
                          <span className="text-[10px] bg-[#000000] text-[#F2C94C] px-1.5 py-0.5 rounded border border-[#153B5C]">
                            {thread.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C4C4C4]">{thread.purpose}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
