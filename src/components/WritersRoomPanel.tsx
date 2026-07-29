import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  ShieldAlert,
  GitPullRequest,
  Compass,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Send,
  Zap,
  Check,
  X,
  FileText,
  Sliders,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { AgentFeedback, Scene, Character, CanonFact, PlotThread, SceneProposal } from '../types';

interface WritersRoomPanelProps {
  scenes?: Scene[];
  characters?: Character[];
  canonFacts?: CanonFact[];
  plotThreads?: PlotThread[];
  selectedSceneId?: string;
  onSelectScene?: (sceneId: string) => void;
  onSaveScene?: (updatedScene: Scene) => void;
  onAddProposal?: (proposal: SceneProposal) => void;
}

export const WritersRoomPanel: React.FC<WritersRoomPanelProps> = ({
  scenes = [],
  characters = [],
  canonFacts = [],
  plotThreads = [],
  selectedSceneId,
  onSelectScene,
  onSaveScene,
  onAddProposal
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userConsultation, setUserConsultation] = useState('');
  const [selectedScene, setSelectedScene] = useState<string>(selectedSceneId || scenes[0]?.id || '');
  const [scope, setScope] = useState<'scene' | 'manuscript'>('scene');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'ATTENTION' | 'OPTIMAL'>('ALL');

  // Overall Board State
  const [overallHealthScore, setOverallHealthScore] = useState<number>(82);
  const [consensusSummary, setConsensusSummary] = useState<string>(
    'The Advisory Board agrees that Act 1 transition into Act 2 is structural and grounded in lore, but recommends re-engaging the dormant Ryder Family Legacy thread before Chapter 3 climax.'
  );

  // Active Directive Apply Modal
  const [applyingDirective, setApplyingDirective] = useState<{
    agentRole: string;
    directive: string;
  } | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{
    revisedProse: string;
    summaryOfChanges: string;
  } | null>(null);

  // Initial Multi-Agent Feedbacks
  const [feedbacks, setFeedbacks] = useState<AgentFeedback[]>([
    {
      agentRole: 'Story Architect',
      score: 88,
      statusFlag: 'OPTIMAL',
      assessment: 'Act 1 tension builds at a steady 1.33 ratio. Scene pacing correctly establishes high stakes without premature climax.',
      suggestions: [
        'Ensure the midpoint shift at Elevator Shaft 09 forces a point-of-no-return decision.',
        'Accelerate the transition into the Act 2 confrontation.'
      ]
    },
    {
      agentRole: 'Character Psychologist',
      score: 79,
      statusFlag: 'ATTENTION',
      assessment: 'Ava’s trust vector toward Liam (88%) is currently high, but her fear score (35%) creates a latent vulnerability.',
      suggestions: [
        'Incorporate subtle non-verbal hesitations when Ava hands over the Helios decryption key.',
        'Contrast Rowan’s cold utilitarian logic against Ava’s visceral loyalty.'
      ]
    },
    {
      agentRole: 'Lore Guardian',
      score: 95,
      statusFlag: 'OPTIMAL',
      assessment: 'Decryption key mechanics match Canon Fact #1. Plasma pulse signatures are consistent with Sector 4 lore.',
      suggestions: [
        'Verify atmospheric pressure limits when transition occurs in subterranean vaults.'
      ]
    },
    {
      agentRole: 'Plot Engineer',
      score: 72,
      statusFlag: 'ATTENTION',
      assessment: 'Plot thread "Ryder Family Legacy" has been dormant for 3 chapters. Stale threshold approaching.',
      suggestions: [
        'Trigger a setup item (Dr. Elena Ryder’s secret journal) in the next scene to re-engage the bloodline arc.',
        'Link the Helios core activation directly to the family resonance frequency.'
      ]
    },
    {
      agentRole: 'Continuity Inspector',
      score: 65,
      statusFlag: 'CRITICAL',
      assessment: 'Liam Cross transit paradox detected between Chapter 2 surface elevator and Chapter 3 Spire infiltration.',
      suggestions: [
        'Insert 8-hour transit interval or relocate Spire communications terminal to surface relay node.'
      ]
    }
  ]);

  const handleRunConsultation = async (customPrompt?: string) => {
    setIsLoading(true);
    const promptToUse = customPrompt !== undefined ? customPrompt : userConsultation;

    try {
      const res = await fetch('/api/gemini/writers-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scope === 'scene' ? selectedScene : undefined,
          userPrompt: promptToUse,
          scenes,
          characters,
          canonFacts,
          plotThreads
        })
      });
      const data = await res.json();
      if (data.success && data.feedbacks) {
        setFeedbacks(data.feedbacks);
        if (data.consensusSummary) setConsensusSummary(data.consensusSummary);
        if (data.overallHealthScore) setOverallHealthScore(data.overallHealthScore);
      }
    } catch (e) {
      console.error('Writers room AI failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDirective = async () => {
    if (!applyingDirective) return;
    const targetSc = scenes.find(s => s.id === selectedScene) || scenes[0];
    if (!targetSc) return;

    setIsApplying(true);
    try {
      const res = await fetch('/api/gemini/writers-room-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: targetSc.id,
          directive: applyingDirective.directive,
          agentRole: applyingDirective.agentRole
        })
      });
      const data = await res.json();
      if (data.success && data.revisedProse) {
        setApplyResult({
          revisedProse: data.revisedProse,
          summaryOfChanges: data.summaryOfChanges || 'Directive applied seamlessly.'
        });
      }
    } catch (err) {
      console.error('Failed to apply directive:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveAppliedProseToScene = () => {
    if (!applyResult || !onSaveScene) return;
    const targetSc = scenes.find(s => s.id === selectedScene) || scenes[0];
    if (!targetSc) return;

    const updated: Scene = {
      ...targetSc,
      prose: applyResult.revisedProse,
      wordCount: applyResult.revisedProse.trim().split(/\s+/).length
    };

    onSaveScene(updated);
    setApplyingDirective(null);
    setApplyResult(null);
  };

  const handleCreateProposalFromDirective = () => {
    if (!applyResult || !onAddProposal) return;
    const targetSc = scenes.find(s => s.id === selectedScene) || scenes[0];
    if (!targetSc) return;

    const proposal: SceneProposal = {
      id: `prop_${Date.now()}`,
      sceneId: targetSc.id,
      title: `Writers Room Directive: ${applyingDirective?.agentRole}`,
      location: targetSc.location,
      participants: targetSc.participantIds,
      purpose: `Incorporate directive: "${applyingDirective?.directive}"`,
      prose: applyResult.revisedProse,
      proposedStateChanges: [],
      proposedCanonFacts: [],
      validationChecks: [
        { check: 'Writers Room Directive Alignment', status: 'PASS', note: applyingDirective?.directive || '' },
        { check: 'Canon Fact Audit', status: 'PASS', note: 'Validated against active lore.' }
      ],
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    onAddProposal(proposal);
    setApplyingDirective(null);
    setApplyResult(null);
  };

  const getAgentIcon = (role: string) => {
    switch (role) {
      case 'Story Architect': return <Compass className="w-4 h-4 text-sky-400" />;
      case 'Character Psychologist': return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'Lore Guardian': return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case 'Plot Engineer': return <GitPullRequest className="w-4 h-4 text-amber-400" />;
      case 'Continuity Inspector': return <Brain className="w-4 h-4 text-rose-400" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBadge = (flag: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL') => {
    switch (flag) {
      case 'OPTIMAL':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>OPTIMAL</span>
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>ATTENTION</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        );
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (statusFilter === 'ALL') return true;
    return f.statusFlag === statusFilter;
  });

  const criticalCount = feedbacks.filter(f => f.statusFlag === 'CRITICAL').length;
  const attentionCount = feedbacks.filter(f => f.statusFlag === 'ATTENTION').length;
  const optimalCount = feedbacks.filter(f => f.statusFlag === 'OPTIMAL').length;

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-2xl relative text-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1E293B] pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>WRITER'S ROOM AI ADVISORY BOARD</span>
              <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full font-sans font-bold">
                5-Agent Consensus Workstation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive multi-agent council evaluating manuscript structure, character psychology, lore, plot, and continuity
            </p>
          </div>
        </div>

        {/* Scope & Scene Selection */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="bg-[#141B2D] border border-[#1A2338] p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setScope('scene')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scope === 'scene'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Target Scene
            </button>
            <button
              onClick={() => setScope('manuscript')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scope === 'manuscript'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Manuscript
            </button>
          </div>

          {scope === 'scene' && (
            <select
              value={selectedScene}
              onChange={e => {
                setSelectedScene(e.target.value);
                if (onSelectScene) onSelectScene(e.target.value);
              }}
              className="bg-[#141B2D] border border-[#1A2338] text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {scenes.map(s => (
                <option key={s.id} value={s.id}>
                  Ch.{s.chapter}: {s.title} ({s.location})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => handleRunConsultation()}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-indigo-950"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'CONSULTING...' : 'RUN CONSULTATION'}</span>
          </button>
        </div>
      </div>

      {/* Narrative Health & Consensus Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-3 flex flex-col justify-between space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Overall Narrative Health</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-100">{overallHealthScore}%</span>
            <span className="text-[10px] text-emerald-400 font-bold">+3.2 vs previous draft</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${overallHealthScore}%` }}
            />
          </div>
        </div>

        {/* Board Consensus Card */}
        <div className="lg:col-span-3 bg-[#141B2D] border border-indigo-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2 bg-indigo-500/5">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>BOARD CONSENSUS DIRECTIVE</span>
            </span>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="text-rose-400 font-bold">{criticalCount} Critical</span>
              <span className="text-amber-400 font-bold">{attentionCount} Attention</span>
              <span className="text-emerald-400 font-bold">{optimalCount} Optimal</span>
            </div>
          </div>

          <p className="text-xs font-sans text-slate-200 leading-relaxed">
            {consensusSummary}
          </p>
        </div>
      </div>

      {/* Interactive Consultation & Pitch Box */}
      <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-3.5 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>PITCH TO THE ADVISORY BOARD / ASK A QUESTION</span>
          </span>
          <span className="text-[10px] text-slate-500">
            e.g. "How do I make Ava's choice in Chapter 3 feel inevitable?"
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={userConsultation}
            onChange={e => setUserConsultation(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRunConsultation();
            }}
            placeholder="Type a scenario pitch, dialogue tweak, or structural dilemma..."
            className="flex-1 bg-[#0B1020] border border-[#1A2338] text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
          />

          <button
            onClick={() => handleRunConsultation()}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ASK COUNCIL</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="text-slate-500 mr-1">Quick Presets:</span>
          {[
            '🚀 Escalate Scene Tension',
            '🧠 Deepen Character Conflict',
            '🛡️ Verify Lore & Canon Rules',
            '📜 Solve Continuity Paradox'
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUserConsultation(preset);
                handleRunConsultation(preset);
              }}
              className="px-2.5 py-1 bg-[#0B1020] hover:bg-[#1A2338] text-slate-300 border border-[#1A2338] hover:border-purple-500/40 rounded-lg transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs font-mono">
        <div className="flex items-center space-x-1">
          {(['ALL', 'CRITICAL', 'ATTENTION', 'OPTIMAL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2338]'
              }`}
            >
              {tab} ({tab === 'ALL' ? feedbacks.length : feedbacks.filter(f => f.statusFlag === tab).length})
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-500">
          Showing {filteredFeedbacks.length} of {feedbacks.length} Agents
        </span>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFeedbacks.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border space-y-3 transition-all relative flex flex-col justify-between ${
              item.statusFlag === 'CRITICAL'
                ? 'bg-rose-950/10 border-rose-500/40 hover:border-rose-500/70'
                : item.statusFlag === 'ATTENTION'
                ? 'bg-amber-950/10 border-amber-500/40 hover:border-amber-500/70'
                : 'bg-[#1E293B]/70 border-[#334155] hover:border-slate-500'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getAgentIcon(item.agentRole)}
                  <span className="text-xs font-bold text-slate-200 font-mono">{item.agentRole}</span>
                </div>
                {getStatusBadge(item.statusFlag)}
              </div>

              {/* Score Bar */}
              <div className="space-y-1 font-mono">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Health Score</span>
                  <span className="text-slate-200 font-bold">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 85 ? 'bg-emerald-500' : item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>

              {/* Assessment */}
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A]/80 p-2.5 rounded-lg border border-[#334155]">
                {item.assessment}
              </p>

              {/* Directives / Suggestions */}
              {item.suggestions && item.suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Actionable Directives:
                  </div>
                  <div className="space-y-1.5">
                    {item.suggestions.map((sug, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start justify-between gap-2 p-1.5 bg-[#0B1020] rounded border border-[#1A2338] text-[11px] text-slate-200"
                      >
                        <span className="flex-1 leading-snug">
                          <span className="text-indigo-400 font-bold mr-1">•</span>
                          {sug}
                        </span>

                        <button
                          onClick={() => {
                            setApplyingDirective({
                              agentRole: item.agentRole,
                              directive: sug
                            });
                            setApplyResult(null);
                          }}
                          className="px-2 py-0.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded text-[10px] font-mono font-bold transition-all flex items-center space-x-1 flex-shrink-0"
                          title="Rewrite scene prose using this directive"
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>APPLY</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: APPLY DIRECTIVE TO SCENE */}
      {applyingDirective && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-indigo-500/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-slate-200 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  APPLY {applyingDirective.agentRole.toUpperCase()} DIRECTIVE TO SCENE
                </h3>
              </div>
              <button
                onClick={() => {
                  setApplyingDirective(null);
                  setApplyResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0B1020] p-3 rounded-xl border border-indigo-500/30 space-y-1">
              <span className="text-[10px] text-indigo-400 font-bold uppercase">Target Directive:</span>
              <p className="text-xs text-slate-200 font-sans">{applyingDirective.directive}</p>
            </div>

            {!applyResult ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <p className="text-xs text-slate-400 text-center max-w-md font-sans">
                  Gemini will rewrite the active scene's prose to seamlessly incorporate this directive while preserving literary style and character voices.
                </p>

                <button
                  onClick={handleApplyDirective}
                  disabled={isApplying}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isApplying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isApplying ? 'REWRITING PROSE...' : 'GENERATE REVISED PROSE'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-300 text-xs">
                  <span className="font-bold">✓ Summary of Changes: </span>
                  {applyResult.summaryOfChanges}
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                    Revised Scene Prose Draft
                  </label>
                  <textarea
                    rows={10}
                    value={applyResult.revisedProse}
                    onChange={e => setApplyResult({ ...applyResult, revisedProse: e.target.value })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-xl p-3 text-slate-200 font-serif text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A2338]">
                  <button
                    onClick={() => {
                      setApplyingDirective(null);
                      setApplyResult(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateProposalFromDirective}
                    className="px-3.5 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors"
                  >
                    Save as Scene Proposal
                  </button>

                  <button
                    onClick={handleSaveAppliedProseToScene}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>OVERWRITE ACTIVE SCENE PROSE</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
