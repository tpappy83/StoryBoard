import React, { useState } from 'react';
import { Character, PlotThread, SceneProposal } from '../types';
import { Sparkles, X, Bot, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Play } from 'lucide-react';

interface AiCommandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  plotThreads: PlotThread[];
  onGenerateProposal: (data: {
    location: string;
    participantIds: string[];
    purpose: string;
    threadId: string;
    promptInstructions: string;
    adapter: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const AiCommandDrawer: React.FC<AiCommandDrawerProps> = ({
  isOpen,
  onClose,
  characters,
  plotThreads,
  onGenerateProposal,
  isLoading
}) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([characters[0]?.id, characters[1]?.id].filter(Boolean));
  const [location, setLocation] = useState('Abandoned Observatory Vault');
  const [purpose, setPurpose] = useState('Ava and Liam reveal the decryption key while Council patrols surround the perimeter.');
  const [threadId, setThreadId] = useState(plotThreads[0]?.id || '');
  const [promptInstructions, setPromptInstructions] = useState('Ensure Ava maintains high suspicion towards Liam, while Liam attempts to prove his loyalty.');
  const [adapter, setAdapter] = useState('gemini-3.6-flash');

  if (!isOpen) return null;

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateProposal({
      location,
      participantIds: selectedParticipants,
      purpose,
      threadId,
      promptInstructions,
      adapter
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-[#141B2D] border-l border-[#1A2338] h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-[#1A2338] pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  AI NARRATIVE COMMAND CENTER
                </h2>
                <p className="text-xs text-slate-400">
                  Propose new scenes validated against canonical story memory.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
            {/* Model Adapter Selector */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> MODEL / INFERENCE ADAPTER
              </label>
              <select
                value={adapter}
                onChange={e => setAdapter(e.target.value)}
                className="w-full bg-[#0B1020] text-slate-200 p-2.5 rounded-lg border border-[#1A2338] focus:outline-none focus:border-indigo-500 font-mono text-xs"
              >
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Server SDK)</option>
                <option value="gpt-oss-20b">Local gpt-oss-20b Adapter (Ollama)</option>
                <option value="mock-adapter">Deterministic Test Mock Adapter</option>
              </select>
            </div>

            {/* Participating Characters */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">
                PARTICIPATING CHARACTERS ({selectedParticipants.length})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {characters.map(char => {
                  const isSelected = selectedParticipants.includes(char.id);
                  return (
                    <div
                      key={char.id}
                      onClick={() => toggleParticipant(char.id)}
                      className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 font-bold'
                          : 'bg-[#0B1020] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{char.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scene Location */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">SCENE LOCATION</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-[#0B1020] text-slate-200 p-2.5 rounded-lg border border-[#1A2338] focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Scene Purpose */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">SCENE PURPOSE & DRAMATIC CONFLICT</label>
              <textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                rows={3}
                className="w-full bg-[#0B1020] text-slate-200 p-2.5 rounded-lg border border-[#1A2338] focus:outline-none focus:border-indigo-500 text-xs leading-relaxed"
              />
            </div>

            {/* Plot Thread */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">ASSOCIATED PLOT THREAD</label>
              <select
                value={threadId}
                onChange={e => setThreadId(e.target.value)}
                className="w-full bg-[#0B1020] text-slate-200 p-2.5 rounded-lg border border-[#1A2338] focus:outline-none focus:border-indigo-500 text-xs"
              >
                {plotThreads.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Specific Instructions */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">SPECIAL CONTINUITY CONSTRAINTS</label>
              <textarea
                value={promptInstructions}
                onChange={e => setPromptInstructions(e.target.value)}
                rows={2}
                className="w-full bg-[#0B1020] text-slate-200 p-2.5 rounded-lg border border-[#1A2338] focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-xl text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>ORCHESTRATING SCENE & AUDITING CANON...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE STRUCTURED SCENE PROPOSAL</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
