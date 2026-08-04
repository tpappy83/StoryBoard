import React, { useState } from 'react';
import { Scene, Character, PlotThread, CanonFact, TimelineEvent } from '../types';
import { SetupEvent, PayoffEvent } from '../types/setupPayoff';
import { Sparkles, Layers, UserCheck, ShieldCheck, Feather, RefreshCw, CheckCircle2, ArrowRight, X, FileText, SplitSquareVertical } from 'lucide-react';

interface MultiPassRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene | null;
  characters: Character[];
  plotThreads: PlotThread[];
  canonFacts: CanonFact[];
  timelineEvents: TimelineEvent[];
  setups: SetupEvent[];
  payoffs: PayoffEvent[];
  onApplyRevisedProse: (newProse: string) => void;
}

export type PassType = 'STRUCTURE_PLOT' | 'CHARACTER_REL' | 'CANON_TIMELINE' | 'PROSE_POLISH';

export interface PassResult {
  passName: PassType;
  title: string;
  text: string;
}

export const MultiPassRevisionModal: React.FC<MultiPassRevisionModalProps> = ({
  isOpen,
  onClose,
  scene,
  characters,
  plotThreads,
  canonFacts,
  timelineEvents,
  setups,
  payoffs,
  onApplyRevisedProse
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'diff'>('pipeline');
  const [selectedPass, setSelectedPass] = useState<number>(3); // Default to Pass 4 (index 3)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStepName, setCurrentStepName] = useState<string>('');
  const [passResults, setPassResults] = useState<PassResult[]>([]);
  const [finalProse, setFinalProse] = useState<string>('');

  if (!isOpen || !scene) return null;

  const relevantSetups = setups.filter(s => s.status !== 'paid_off');
  const relevantPayoffs = payoffs.filter(p => p.status !== 'fulfilled');
  const activeThreads = plotThreads.filter(t => t.status === 'Active');
  const participatingChars = characters.filter(c => (scene?.participantIds || []).includes(c.id));

  const buildContextPayload = (customProse?: string) => {
    return {
      sceneText: customProse || scene.prose,
      sceneMetadata: {
        id: scene.id,
        title: scene.title,
        location: scene.location,
        timelinePhase: scene.timelinePhase
      },
      setups: relevantSetups.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status
      })),
      payoffs: relevantPayoffs.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        dueBySceneId: p.dueBySceneId
      })),
      plotThreads: activeThreads.map(t => ({
        id: t.id,
        name: t.name,
        phase: t.currentPhase,
        tensionLevel: t.tensionLevel > 7 ? 'high' : t.tensionLevel > 4 ? 'medium' : 'low'
      })),
      canonFacts: canonFacts.slice(0, 10).map(f => ({
        id: f.id,
        fact: f.fact
      })),
      timelineNotes: timelineEvents.slice(0, 5).map(e => ({
        id: e.id,
        timestampLabel: e.timestampLabel,
        summary: e.description
      })),
      characters: participatingChars.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role,
        emotionalState: c.emotionalState,
        goals: c.goals,
        knowledge: c.knowledge || []
      }))
    };
  };

  const handleRunPipeline = async () => {
    setIsLoading(true);
    setCurrentStepName('Executing 4-Pass Multi-Pass Revision Pipeline...');
    try {
      const res = await fetch('/api/multi-pass-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runFullPipeline: true,
          context: buildContextPayload()
        })
      });
      const data = await res.json();
      if (data.success && data.passes) {
        setPassResults(data.passes);
        setFinalProse(data.finalRevisedProse);
        setActiveTab('diff');
      }
    } catch (err) {
      console.error('Multi-pass revision failed:', err);
    } finally {
      setIsLoading(false);
      setCurrentStepName('');
    }
  };

  const handleRunSinglePass = async (passName: PassType) => {
    setIsLoading(true);
    setCurrentStepName(`Executing ${passName} Revision Pass...`);
    try {
      const currentText = passResults.length > 0 ? passResults[passResults.length - 1].text : scene.prose;
      const res = await fetch('/api/multi-pass-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passName,
          context: buildContextPayload(currentText)
        })
      });
      const data = await res.json();
      if (data.success && data.revisedText) {
        const passTitleMap: Record<PassType, string> = {
          STRUCTURE_PLOT: 'Pass 1: Structural & Plot Alignment',
          CHARACTER_REL: 'Pass 2: Character & Relationship Continuity',
          CANON_TIMELINE: 'Pass 3: Canon, Timeline, & World Consistency',
          PROSE_POLISH: 'Pass 4: Prose Polish & Thematic Reinforcement'
        };
        const newPassResult: PassResult = {
          passName,
          title: passTitleMap[passName],
          text: data.revisedText
        };
        const updatedPasses = [...passResults.filter(p => p.passName !== passName), newPassResult];
        setPassResults(updatedPasses);
        setFinalProse(data.revisedText);
        setActiveTab('diff');
      }
    } catch (err) {
      console.error('Single pass revision error:', err);
    } finally {
      setIsLoading(false);
      setCurrentStepName('');
    }
  };

  const handleCommit = () => {
    const textToApply = passResults[selectedPass]?.text || finalProse;
    if (textToApply) {
      onApplyRevisedProse(textToApply);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#090D16] border border-[#1E293B] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#0B101D] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">MULTI-PASS NARRATIVE REVISION ENGINE</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                  HIGH-REASONING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                4-Pass AI Editor: Structural Alignment → Character Continuity → Canon Guardian → Prose Polish
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#1E293B] bg-[#0B101D] px-5">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'pipeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4-Pass Revision Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            disabled={passResults.length === 0}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'diff'
                ? 'border-indigo-500 text-indigo-400'
                : passResults.length === 0
                ? 'border-transparent text-slate-600 cursor-not-allowed'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>Pass Output Comparison & Diff ({passResults.length}/4)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              
              {/* Context Footprint Summary */}
              <div className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    TARGET SCENE CONTEXT FOOTPRINT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Scene: <strong className="text-slate-200">{scene.title}</strong> ({scene.wordCount} words)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded-lg">
                    <span className="text-slate-400 block text-[10px] font-mono">UNRESOLVED SETUPS</span>
                    <strong className="text-indigo-300 font-bold">{relevantSetups.length} Open Seeds</strong>
                  </div>
                  <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded-lg">
                    <span className="text-slate-400 block text-[10px] font-mono">PAYOFF OBLIGATIONS</span>
                    <strong className="text-purple-300 font-bold">{relevantPayoffs.length} Scheduled</strong>
                  </div>
                  <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded-lg">
                    <span className="text-slate-400 block text-[10px] font-mono">ACTIVE PLOT THREADS</span>
                    <strong className="text-emerald-300 font-bold">{activeThreads.length} In Progress</strong>
                  </div>
                  <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded-lg">
                    <span className="text-slate-400 block text-[10px] font-mono">PARTICIPANTS</span>
                    <strong className="text-amber-300 font-bold">{participatingChars.length} Active Characters</strong>
                  </div>
                </div>
              </div>

              {/* 4 Pipeline Passes Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pass 1 Card */}
                <div className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-3 relative hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-100">Pass 1: Structural & Plot Alignment</span>
                    </div>
                    {passResults.some(p => p.passName === 'STRUCTURE_PLOT') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Restructures scene pacing, explicitly advances active setups/payoffs, and anchors scene purpose to plot threads.
                  </p>
                  <button
                    onClick={() => handleRunSinglePass('STRUCTURE_PLOT')}
                    disabled={isLoading}
                    className="w-full py-1.5 bg-[#141B2D] hover:bg-indigo-950/60 border border-[#232F48] text-indigo-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Run Pass 1 Only
                  </button>
                </div>

                {/* Pass 2 Card */}
                <div className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-3 relative hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-100">Pass 2: Character & Relationship Continuity</span>
                    </div>
                    {passResults.some(p => p.passName === 'CHARACTER_REL') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enforces character knowledge boundaries, aligns dialogue voice with emotional vectors, and heightens relationship tension.
                  </p>
                  <button
                    onClick={() => handleRunSinglePass('CHARACTER_REL')}
                    disabled={isLoading}
                    className="w-full py-1.5 bg-[#141B2D] hover:bg-purple-950/60 border border-[#232F48] text-purple-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Run Pass 2 Only
                  </button>
                </div>

                {/* Pass 3 Card */}
                <div className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-3 relative hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-100">Pass 3: Canon, Timeline, & World Consistency</span>
                    </div>
                    {passResults.some(p => p.passName === 'CANON_TIMELINE') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Audits lore against canon facts, verifies timeline event ordering, and flags or resolves world-rule contradictions.
                  </p>
                  <button
                    onClick={() => handleRunSinglePass('CANON_TIMELINE')}
                    disabled={isLoading}
                    className="w-full py-1.5 bg-[#141B2D] hover:bg-emerald-950/60 border border-[#232F48] text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Run Pass 3 Only
                  </button>
                </div>

                {/* Pass 4 Card */}
                <div className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-3 relative hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Feather className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-100">Pass 4: Prose Polish & Thematic Reinforcement</span>
                    </div>
                    {passResults.some(p => p.passName === 'PROSE_POLISH') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Line edits for rhythm, tone, sensory texture, and thematic resonance without altering underlying plot events.
                  </p>
                  <button
                    onClick={() => handleRunSinglePass('PROSE_POLISH')}
                    disabled={isLoading}
                    className="w-full py-1.5 bg-[#141B2D] hover:bg-amber-950/60 border border-[#232F48] text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Run Pass 4 Only
                  </button>
                </div>

              </div>

              {/* Master Run Pipeline Banner Button */}
              <button
                onClick={handleRunPipeline}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{currentStepName || 'Running Multi-Pass Revision...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>EXECUTE COMPLETE 4-PASS REVISION PIPELINE</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'diff' && (
            <div className="space-y-4">
              {/* Pass Step Selection Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#1E293B] pb-3">
                <button
                  onClick={() => setSelectedPass(-1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    selectedPass === -1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#0F172A] border border-[#1E293B] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Original Scene Draft
                </button>
                {passResults.map((pr, idx) => (
                  <button
                    key={pr.passName}
                    onClick={() => setSelectedPass(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      selectedPass === idx
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-[#0F172A] border border-[#1E293B] text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{pr.title}</span>
                  </button>
                ))}
              </div>

              {/* Prose Viewer Pane */}
              <div className="p-5 bg-[#0B1020] border border-[#1E293B] rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>
                    Viewing:{' '}
                    <strong className="text-indigo-400">
                      {selectedPass === -1 ? 'Original Scene Prose' : passResults[selectedPass]?.title || 'Final Prose'}
                    </strong>
                  </span>
                  <span>
                    Word Count:{' '}
                    {(selectedPass === -1 ? scene.prose : passResults[selectedPass]?.text || finalProse)
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length}{' '}
                    Words
                  </span>
                </div>

                <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded-lg text-sm text-slate-200 leading-relaxed font-serif whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedPass === -1 ? scene.prose : passResults[selectedPass]?.text || finalProse}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="px-4 py-2 bg-[#141B2D] hover:bg-[#1E293B] text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  ← Back to Pipeline Controls
                </button>

                <button
                  onClick={handleCommit}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPLY REVISED PROSE TO CANON MEMORY</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
