import React, { useState } from 'react';
import {
  KeyRound,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  X,
  Search,
  Filter,
  Trash2,
  Layers,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Users,
  Flame,
  Tag,
  ShieldAlert,
  Check
} from 'lucide-react';
import { PlotThread, Scene, Character, CanonFact } from '../types';
import {
  SetupEvent,
  PayoffEvent,
  SetupType,
  SetupStatus,
  getSetupAge,
  calculateNarrativeDebt,
  isChekhovWarning,
  getChekhovWarnings
} from '../types/setupPayoff';
import { useSetupPayoffStore } from '../stores/setupPayoffStore';
import { SetupDependencyGraph } from './SetupDependencyGraph';

interface SetupPayoffTrackerProps {
  plotThreads?: PlotThread[];
  scenes?: Scene[];
  characters?: Character[];
  canonFacts?: CanonFact[];
  currentChapter?: number;
}

export const SetupPayoffTracker: React.FC<SetupPayoffTrackerProps> = ({
  plotThreads = [],
  scenes = [],
  characters = [],
  canonFacts = [],
  currentChapter = 23
}) => {
  const {
    setups,
    payoffs,
    createSetup,
    createPayoffAndResolve,
    deleteSetup,
    deletePayoff,
    updateSetupStatus
  } = useSetupPayoffStore();

  const [activeTab, setActiveTab] = useState<'setups' | 'payoffs' | 'ai' | 'network'>('setups');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddSetupOpen, setIsAddSetupOpen] = useState(false);
  const [isAddPayoffOpen, setIsAddPayoffOpen] = useState(false);
  const [selectedSetupForPayoff, setSelectedSetupForPayoff] = useState<SetupEvent | null>(null);

  // New Setup Form State
  const [newSetup, setNewSetup] = useState<{
    title: string;
    description: string;
    setupType: SetupType;
    importance: number;
    introducedSceneId: string;
    introducedChapterId: string;
    introducedActId: string;
    introducedBy: string[];
    tagsStr: string;
    notes: string;
  }>({
    title: '',
    description: '',
    setupType: 'object',
    importance: 8,
    introducedSceneId: scenes[0]?.id || 'scene_001',
    introducedChapterId: 'chapter_4',
    introducedActId: 'act_1',
    introducedBy: [],
    tagsStr: 'mystery, key',
    notes: ''
  });

  // New Payoff Form State
  const [newPayoff, setNewPayoff] = useState<{
    title: string;
    description: string;
    payoffStrength: number;
    sceneId: string;
    chapterId: string;
    consequencesStr: string;
  }>({
    title: '',
    description: '',
    payoffStrength: 9,
    sceneId: scenes[0]?.id || 'scene_047',
    chapterId: 'chapter_23',
    consequencesStr: 'Brother discovered, New war begins'
  });

  // AI Detector State
  const [selectedSceneForAi, setSelectedSceneForAi] = useState<string>(scenes[0]?.id || '');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSetups, setDetectedSetups] = useState<any[]>([]);

  // AI Payoff State
  const [selectedSetupForAiPayoff, setSelectedSetupForAiPayoff] = useState<string>(
    setups.find(s => s.status === 'open')?.id || ''
  );
  const [isSuggestingPayoffs, setIsSuggestingPayoffs] = useState(false);
  const [suggestedPayoffs, setSuggestedPayoffs] = useState<any[]>([]);

  // Metrics & Automatic Analyzer
  const totalSetups = setups.length;
  const openSetups = setups.filter(s => s.status === 'open');
  const partialSetups = setups.filter(s => s.status === 'partial');
  const resolvedSetups = setups.filter(s => s.status === 'resolved');
  const narrativeDebt = calculateNarrativeDebt(setups);
  const chekhovWarnings = getChekhovWarnings(setups, currentChapter);

  // Oldest setup
  const oldestSetup = [...setups]
    .filter(s => s.status !== 'resolved')
    .sort((a, b) => getSetupAge(b, currentChapter) - getSetupAge(a, currentChapter))[0];

  const oldestAge = oldestSetup ? getSetupAge(oldestSetup, currentChapter) : 0;

  // Filtered Setups
  const filteredSetups = setups.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || s.setupType === typeFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'chekhov'
        ? isChekhovWarning(s, currentChapter)
        : s.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreateSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetup.title.trim()) return;

    const created: SetupEvent = {
      id: `sup_${Date.now()}`,
      title: newSetup.title.trim(),
      description: newSetup.description.trim(),
      setupType: newSetup.setupType,
      status: 'open',
      importance: Number(newSetup.importance) || 5,
      introducedSceneId: newSetup.introducedSceneId,
      introducedChapterId: newSetup.introducedChapterId,
      introducedActId: newSetup.introducedActId,
      introducedAt: new Date().toISOString(),
      introducedBy: newSetup.introducedBy,
      tags: newSetup.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
      linkedPayoffIds: [],
      notes: newSetup.notes.trim()
    };

    createSetup(created);
    setIsAddSetupOpen(false);
    setNewSetup({
      title: '',
      description: '',
      setupType: 'object',
      importance: 8,
      introducedSceneId: scenes[0]?.id || 'scene_001',
      introducedChapterId: 'chapter_4',
      introducedActId: 'act_1',
      introducedBy: [],
      tagsStr: 'mystery, key',
      notes: ''
    });
  };

  const handleCreatePayoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayoff.title.trim() || !selectedSetupForPayoff) return;

    const createdPayoff: PayoffEvent = {
      id: `pay_${Date.now()}`,
      title: newPayoff.title.trim(),
      description: newPayoff.description.trim(),
      payoffStrength: Number(newPayoff.payoffStrength) || 8,
      sceneId: newPayoff.sceneId,
      chapterId: newPayoff.chapterId,
      createdAt: new Date().toISOString(),
      setupIds: [selectedSetupForPayoff.id],
      consequences: newPayoff.consequencesStr.split(',').map(c => c.trim()).filter(Boolean)
    };

    createPayoffAndResolve(selectedSetupForPayoff.id, createdPayoff);
    setIsAddPayoffOpen(false);
    setSelectedSetupForPayoff(null);
  };

  const handleRunAiDetectSetups = async () => {
    const sc = scenes.find(s => s.id === selectedSceneForAi) || scenes[0];
    if (!sc) return;

    setIsDetecting(true);
    try {
      const res = await fetch('/api/gemini/detect-setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: sc.id,
          title: sc.title,
          prose: sc.prose,
          purpose: sc.purpose,
          chapter: sc.chapter
        })
      });
      const data = await res.json();
      if (data.success && data.detectedSetups) {
        setDetectedSetups(data.detectedSetups);
      }
    } catch (err) {
      console.error('Error detecting setups:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAcceptDetectedSetup = (detected: any) => {
    const created: SetupEvent = {
      id: `sup_ai_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: detected.title,
      description: detected.description,
      setupType: (detected.setupType as SetupType) || 'mystery',
      status: 'open',
      importance: detected.importance || 8,
      introducedSceneId: selectedSceneForAi || scenes[0]?.id || 'scene_001',
      introducedChapterId: `chapter_${scenes.find(s => s.id === selectedSceneForAi)?.chapter || 1}`,
      introducedAt: new Date().toISOString(),
      introducedBy: detected.introducedBy || [],
      tags: detected.tags || ['ai-detected'],
      linkedPayoffIds: [],
      notes: `AI Detected (Confidence: ${Math.round((detected.confidence || 0.9) * 100)}%)`
    };
    createSetup(created);
    setDetectedSetups(prev => prev.filter(d => d.title !== detected.title));
  };

  const handleRunAiSuggestPayoffs = async () => {
    const targetSetup = setups.find(s => s.id === selectedSetupForAiPayoff);
    if (!targetSetup) return;

    setIsSuggestingPayoffs(true);
    try {
      const res = await fetch('/api/gemini/suggest-payoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupId: targetSetup.id,
          title: targetSetup.title,
          description: targetSetup.description,
          setupType: targetSetup.setupType,
          importance: targetSetup.importance,
          openSetups: openSetups,
          canonFacts: canonFacts.map(f => f.fact)
        })
      });
      const data = await res.json();
      if (data.success && data.suggestedPayoffs) {
        setSuggestedPayoffs(data.suggestedPayoffs);
      }
    } catch (err) {
      console.error('Error suggesting payoffs:', err);
    } finally {
      setIsSuggestingPayoffs(false);
    }
  };

  const handleExecuteSuggestedPayoff = (suggested: any) => {
    if (!selectedSetupForAiPayoff) return;
    const createdPayoff: PayoffEvent = {
      id: `pay_ai_${Date.now()}`,
      title: suggested.title,
      description: suggested.description,
      payoffStrength: suggested.payoffStrength || 9,
      sceneId: scenes[0]?.id || 'scene_payoff',
      chapterId: `chapter_${currentChapter}`,
      createdAt: new Date().toISOString(),
      setupIds: [selectedSetupForAiPayoff],
      consequences: suggested.consequences || []
    };
    createPayoffAndResolve(selectedSetupForAiPayoff, createdPayoff);
    setSuggestedPayoffs(prev => prev.filter(p => p.title !== suggested.title));
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-2xl relative text-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1E293B] pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>SETUP & PAYOFF NARRATIVE EVENT ENGINE</span>
              <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-sans">
                Zustand Event Network
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Guarantees foreshadowed objects, promises, and secrets resolve with maximum narrative payoff
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddSetupOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>+ LOG SETUP EVENT</span>
          </button>
        </div>
      </div>

      {/* CHEKHOV'S GUN WARNING BANNER */}
      {chekhovWarnings.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/80 via-amber-950/70 to-red-950/80 border-2 border-red-500/60 rounded-2xl p-4 space-y-3 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-red-500/30 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-black font-mono text-red-200 flex items-center gap-2">
                  <span>CHEKHOV'S GUN AUTOMATIC ANALYZER</span>
                  <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 rounded-full font-bold">
                    {chekhovWarnings.length} Flagged Setup{chekhovWarnings.length > 1 ? 's' : ''} (20+ Chs Unresolved)
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  High-importance narrative setup(s) (Importance ≥ 7) introduced over 20 chapters ago with no linked payoffs flagged for unresolved tension.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('setups');
                setStatusFilter('chekhov');
              }}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center space-x-1.5 self-start md:self-auto"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>FILTER CHEKHOV LEDGER ({chekhovWarnings.length})</span>
            </button>
          </div>

          {/* Flagged Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {chekhovWarnings.map(cw => {
              const age = getSetupAge(cw, currentChapter);
              return (
                <div
                  key={cw.id}
                  className="p-3 bg-[#0B1020]/90 border border-red-500/50 rounded-xl space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-300 font-mono flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>{cw.title}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-red-950 text-red-300 border border-red-500/40 rounded-full font-bold">
                        Age: {age} Chs | Imp: {cw.importance}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {cw.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-red-900/40 text-[10px] font-mono">
                    <span className="text-slate-400">
                      Introduced in {cw.introducedChapterId || 'Ch.1'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSetupForAiPayoff(cw.id);
                          setActiveTab('ai');
                        }}
                        className="px-2 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded font-bold transition-all flex items-center space-x-1 shadow"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Suggest Payoff</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSetupForPayoff(cw);
                          setIsAddPayoffOpen(true);
                        }}
                        className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded font-bold transition-all flex items-center space-x-1 shadow"
                      >
                        <Check className="w-3 h-3" />
                        <span>Log Payoff</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-3 flex flex-col justify-between space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Total Setups</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </span>
          <span className="text-xl font-black font-mono text-slate-100">{totalSetups}</span>
          <span className="text-[10px] text-slate-500">
            {resolvedSetups.length} Resolved ({Math.round((resolvedSetups.length / (totalSetups || 1)) * 100)}%)
          </span>
        </div>

        <div className="bg-[#141B2D] border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between space-y-1 bg-amber-500/5">
          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Open Setups</span>
            <Circle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </span>
          <span className="text-xl font-black font-mono text-amber-300">{openSetups.length}</span>
          <span className="text-[10px] text-amber-400/70">Awaiting Payoff Events</span>
        </div>

        <div className="bg-[#141B2D] border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between space-y-1 bg-emerald-500/5">
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Resolved Payoffs</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <span className="text-xl font-black font-mono text-emerald-300">{payoffs.length}</span>
          <span className="text-[10px] text-emerald-400/70">Payoff Events Triggered</span>
        </div>

        <div className="bg-[#141B2D] border border-red-500/40 rounded-xl p-3 flex flex-col justify-between space-y-1 bg-red-500/5">
          <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Narrative Debt</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </span>
          <span className="text-xl font-black font-mono text-red-400">{narrativeDebt}</span>
          <span className="text-[10px] text-red-400/70">Open Importance Load</span>
        </div>

        <div className="bg-[#141B2D] border border-purple-500/30 rounded-xl p-3 flex flex-col justify-between space-y-1 bg-purple-500/5">
          <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Oldest Open Setup</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </span>
          <span className="text-xs font-bold font-mono text-purple-200 truncate" title={oldestSetup?.title}>
            {oldestSetup ? oldestSetup.title : 'None'}
          </span>
          <span className="text-[10px] text-purple-400/80 font-mono">
            {oldestSetup ? `Age: ${oldestAge} Chapters (Ch.${oldestSetup.introducedChapterId || 1})` : '0 Chapters'}
          </span>
        </div>

        {/* CHEKHOV WARNINGS CARD */}
        <div
          onClick={() => {
            setActiveTab('setups');
            setStatusFilter('chekhov');
          }}
          className={`cursor-pointer rounded-xl p-3 flex flex-col justify-between space-y-1 transition-all border ${
            chekhovWarnings.length > 0
              ? 'bg-red-950/20 border-red-500/60 hover:border-red-400 shadow-lg shadow-red-950/50'
              : 'bg-[#141B2D] border-[#1A2338]'
          }`}
        >
          <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center justify-between font-bold">
            <span>Chekhov Warnings</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${chekhovWarnings.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
          </span>
          <span className={`text-xl font-black font-mono ${chekhovWarnings.length > 0 ? 'text-red-300' : 'text-slate-400'}`}>
            {chekhovWarnings.length}
          </span>
          <span className="text-[10px] text-red-400/80 font-mono">
            {chekhovWarnings.length > 0 ? 'Imp ≥ 7 & 20+ Chs Unresolved' : 'Zero High-Age Debt'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-[#1E293B] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('setups')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'setups'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2338]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>SETUPS LEDGER ({setups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payoffs')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'payoffs'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2338]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PAYOFFS LEDGER ({payoffs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'ai'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2338]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI DETECTOR & PAYOFF ARCHITECT</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'network'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2338]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>NARRATIVE EVENT NETWORK</span>
        </button>
      </div>

      {/* TAB 1: SETUPS LEDGER */}
      {activeTab === 'setups' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141B2D] p-2.5 rounded-xl border border-[#1A2338] text-xs font-mono">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search setups, tags, descriptions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-[#0B1020] border border-[#1A2338] text-slate-300 rounded px-2 py-1 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="object">Object / Prop</option>
                <option value="character">Character</option>
                <option value="relationship">Relationship</option>
                <option value="mystery">Mystery</option>
                <option value="theme">Theme</option>
                <option value="foreshadowing">Foreshadowing</option>
                <option value="worldbuilding">Worldbuilding</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#0B1020] border border-[#1A2338] text-slate-300 rounded px-2 py-1 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="partial">Partial</option>
                <option value="resolved">Resolved</option>
                <option value="chekhov">⚠️ Chekhov Warnings ({chekhovWarnings.length})</option>
              </select>
            </div>
          </div>

          {/* Setup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSetups.map(setup => {
              const age = getSetupAge(setup, currentChapter);
              const isResolved = setup.status === 'resolved';
              const isChekhov = isChekhovWarning(setup, currentChapter);

              return (
                <div
                  key={setup.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 relative group ${
                    isResolved
                      ? 'bg-[#1E293B]/30 border-slate-700/50 opacity-80'
                      : isChekhov
                      ? 'bg-red-950/20 border-red-500/80 hover:border-red-400 shadow-xl shadow-red-950/40'
                      : setup.status === 'partial'
                      ? 'bg-[#1E293B]/60 border-indigo-500/40 shadow-lg'
                      : 'bg-[#1E293B]/80 border-amber-500/40 hover:border-amber-500/70 shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <button
                        onClick={() =>
                          updateSetupStatus(
                            setup.id,
                            isResolved ? 'open' : 'resolved'
                          )
                        }
                        title="Click to toggle status"
                        className="mt-0.5"
                      >
                        {isResolved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : setup.status === 'partial' ? (
                          <Circle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        ) : isChekhov ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 animate-bounce" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                        )}
                      </button>

                      <div>
                        <h3 className={`text-xs font-bold font-mono flex items-center gap-2 ${isResolved ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          <span>{setup.title}</span>
                          {isChekhov && (
                            <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 rounded font-bold uppercase animate-pulse">
                              ⚠️ CHEKHOV WARNING
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {setup.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase font-bold ${
                        setup.setupType === 'object' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                        setup.setupType === 'mystery' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        setup.setupType === 'foreshadowing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {setup.setupType}
                      </span>

                      {!isResolved && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isChekhov
                            ? 'bg-red-950 text-red-300 border border-red-500/50'
                            : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                        }`}>
                          Age: {age} Chs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Character Tags & Metadata */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    {setup.introducedBy.map((charName, idx) => (
                      <span key={idx} className="flex items-center space-x-1 px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        <Users className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{charName}</span>
                      </span>
                    ))}

                    {setup.tags.map((tag, idx) => (
                      <span key={idx} className="flex items-center space-x-1 px-1.5 py-0.5 bg-[#0B1020] text-slate-400 rounded">
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-700/40 text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        Introduced {setup.introducedChapterId || 'Ch.1'} ({scenes.find(s => s.id === setup.introducedSceneId)?.title || 'Scene'})
                      </span>
                    </span>

                    <div className="flex items-center space-x-2">
                      {isChekhov && !isResolved && (
                        <button
                          onClick={() => {
                            setSelectedSetupForAiPayoff(setup.id);
                            setActiveTab('ai');
                          }}
                          className="flex items-center space-x-1 px-2 py-0.5 bg-purple-600/80 hover:bg-purple-500 text-white rounded font-bold transition-all shadow"
                          title="Generate AI Payoffs for this Chekhov Gun"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>AI PAYOFF</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          onClick={() => {
                            setSelectedSetupForPayoff(setup);
                            setIsAddPayoffOpen(true);
                          }}
                          className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded font-bold transition-all shadow"
                        >
                          <Check className="w-3 h-3" />
                          <span>RESOLVE WITH PAYOFF</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteSetup(setup.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                        title="Delete Setup"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PAYOFFS LEDGER */}
      {activeTab === 'payoffs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {payoffs.map(payoff => {
              const linkedSetups = setups.filter(s => (payoff.setupIds || []).includes(s.id));

              return (
                <div key={payoff.id} className="p-4 rounded-xl border border-emerald-500/30 bg-[#1E293B]/70 space-y-3 relative group shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs font-bold font-mono text-emerald-300">{payoff.title}</h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{payoff.description}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                      Strength: {payoff.payoffStrength}/10
                    </span>
                  </div>

                  {/* Linked Setups */}
                  {linkedSetups.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400">RESOLVED SETUPS:</span>
                      <div className="flex flex-wrap gap-1">
                        {linkedSetups.map(ls => (
                          <span key={ls.id} className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded flex items-center space-x-1">
                            <KeyRound className="w-2.5 h-2.5 text-amber-400" />
                            <span>{ls.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consequences */}
                  {payoff.consequences && payoff.consequences.length > 0 && (
                    <div className="space-y-1 bg-[#0B1020] p-2 rounded border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-indigo-400 flex items-center space-x-1">
                        <ArrowRight className="w-3 h-3" />
                        <span>NARRATIVE CONSEQUENCES:</span>
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                        {payoff.consequences.map((cq, idx) => (
                          <li key={idx}>{cq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-700/40 text-slate-400">
                    <span>Created: {new Date(payoff.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => deletePayoff(payoff.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI DETECTOR & PAYOFF ARCHITECT */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* AI Setup Detector Panel */}
          <div className="bg-[#141B2D] border border-purple-500/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-100 font-mono">1. AI SCENE SETUP DETECTOR</h3>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                Gemini Narrative Analysis
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Select a scene from the manuscript. Gemini will scan prose for implicit promises, foreshadowed objects, secrets, or foreshadowing.
            </p>

            <div className="flex items-center space-x-2">
              <select
                value={selectedSceneForAi}
                onChange={e => setSelectedSceneForAi(e.target.value)}
                className="bg-[#0B1020] border border-[#1A2338] text-slate-200 text-xs rounded-lg p-2 flex-1 focus:outline-none focus:border-purple-500 font-mono"
              >
                {scenes.map(s => (
                  <option key={s.id} value={s.id}>
                    Ch.{s.chapter}: {s.title} ({s.location})
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunAiDetectSetups}
                disabled={isDetecting}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs px-3.5 py-2 rounded-lg font-bold transition-all shadow flex items-center space-x-1"
              >
                {isDetecting ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isDetecting ? 'SCANNING...' : 'SCAN SCENE'}</span>
              </button>
            </div>

            {/* Detected Setups Results */}
            <div className="space-y-2 pt-2">
              {detectedSetups.map((det, idx) => (
                <div key={idx} className="p-3 bg-[#0B1020] border border-purple-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-purple-300">{det.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                      Confidence: {Math.round((det.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{det.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">Type: {det.setupType}</span>
                    <button
                      onClick={() => handleAcceptDetectedSetup(det)}
                      className="text-[11px] font-mono bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded font-bold transition-colors"
                    >
                      + ADD TO SETUPS LEDGER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Payoff Generator Panel */}
          <div className="bg-[#141B2D] border border-emerald-500/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100 font-mono">2. AI PAYOFF ARCHITECT</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Canon Payoff Generator
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Select an open setup. Gemini will evaluate current story canon and generate 3 dramatic payoff events.
            </p>

            <div className="flex items-center space-x-2">
              <select
                value={selectedSetupForAiPayoff}
                onChange={e => setSelectedSetupForAiPayoff(e.target.value)}
                className="bg-[#0B1020] border border-[#1A2338] text-slate-200 text-xs rounded-lg p-2 flex-1 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {openSetups.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.setupType.toUpperCase()}] {s.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunAiSuggestPayoffs}
                disabled={isSuggestingPayoffs || !selectedSetupForAiPayoff}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs px-3.5 py-2 rounded-lg font-bold transition-all shadow flex items-center space-x-1"
              >
                {isSuggestingPayoffs ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5" />
                )}
                <span>{isSuggestingPayoffs ? 'GENERATING...' : 'SUGGEST PAYOFFS'}</span>
              </button>
            </div>

            {/* Suggested Payoffs Results */}
            <div className="space-y-2 pt-2">
              {suggestedPayoffs.map((sug, idx) => (
                <div key={idx} className="p-3 bg-[#0B1020] border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-emerald-300">{sug.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                      Payoff Strength: {sug.payoffStrength}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{sug.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">Target: {sug.suggestedSceneTitle}</span>
                    <button
                      onClick={() => handleExecuteSuggestedPayoff(sug)}
                      className="text-[11px] font-mono bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-bold transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>EXECUTE PAYOFF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NARRATIVE DEPENDENCY GRAPH NETWORK */}
      {activeTab === 'network' && (
        <SetupDependencyGraph
          setups={setups}
          payoffs={payoffs}
          characters={characters}
          plotThreads={plotThreads}
          scenes={scenes}
          canonFacts={canonFacts}
          currentChapter={currentChapter}
          onSelectSetupForAiPayoff={(setupId) => {
            setSelectedSetupForAiPayoff(setupId);
            setActiveTab('ai');
          }}
          onLogPayoffForSetup={(setup) => {
            setSelectedSetupForPayoff(setup);
            setIsAddPayoffOpen(true);
          }}
        />
      )}

      {/* MODAL 1: ADD SETUP EVENT */}
      {isAddSetupOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                CREATE FORESHADOWED SETUP EVENT
              </h3>
              <button onClick={() => setIsAddSetupOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSetupSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Setup Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ancient Silver Key / Secret Passcode"
                  value={newSetup.title}
                  onChange={e => setNewSetup({ ...newSetup, title: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Description & Narrative Promise</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the setup and what future resolution is promised..."
                  value={newSetup.description}
                  onChange={e => setNewSetup({ ...newSetup, description: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Setup Type</label>
                  <select
                    value={newSetup.setupType}
                    onChange={e => setNewSetup({ ...newSetup, setupType: e.target.value as SetupType })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="object">Object / Prop</option>
                    <option value="character">Character</option>
                    <option value="relationship">Relationship</option>
                    <option value="mystery">Mystery</option>
                    <option value="theme">Theme</option>
                    <option value="foreshadowing">Foreshadowing</option>
                    <option value="worldbuilding">Worldbuilding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Importance (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSetup.importance}
                    onChange={e => setNewSetup({ ...newSetup, importance: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Introduced Chapter</label>
                  <input
                    type="text"
                    placeholder="chapter_4"
                    value={newSetup.introducedChapterId}
                    onChange={e => setNewSetup({ ...newSetup, introducedChapterId: e.target.value })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="key, vault, mystery"
                    value={newSetup.tagsStr}
                    onChange={e => setNewSetup({ ...newSetup, tagsStr: e.target.value })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A2338]">
                <button
                  type="button"
                  onClick={() => setIsAddSetupOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold transition-colors"
                >
                  Save Setup Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYOFF EVENT */}
      {isAddPayoffOpen && selectedSetupForPayoff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-emerald-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-200 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                EXECUTE PAYOFF EVENT FOR: {selectedSetupForPayoff.title}
              </h3>
              <button onClick={() => setIsAddPayoffOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayoffSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Payoff Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silver Key Unlocks Royal Vault"
                  value={newPayoff.title}
                  onChange={e => setNewPayoff({ ...newPayoff, title: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Payoff Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe how the setup was triggered and resolved..."
                  value={newPayoff.description}
                  onChange={e => setNewPayoff({ ...newPayoff, description: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Payoff Strength (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newPayoff.payoffStrength}
                    onChange={e => setNewPayoff({ ...newPayoff, payoffStrength: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Chapter ID</label>
                  <input
                    type="text"
                    value={newPayoff.chapterId}
                    onChange={e => setNewPayoff({ ...newPayoff, chapterId: e.target.value })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Story Consequences (comma separated)</label>
                <input
                  type="text"
                  placeholder="Brother discovered, New war begins"
                  value={newPayoff.consequencesStr}
                  onChange={e => setNewPayoff({ ...newPayoff, consequencesStr: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A2338]">
                <button
                  type="button"
                  onClick={() => setIsAddPayoffOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold transition-colors"
                >
                  Execute & Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
