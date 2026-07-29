import React, { useState, useEffect } from 'react';
import {
  Character,
  Scene,
  PlotThread,
  CanonFact,
  StateEngineSimulationResult,
  ThinkingStep
} from '../types';
import {
  Cpu,
  Sparkles,
  Zap,
  BookOpen,
  Users,
  GitBranch,
  ShieldAlert,
  Brain,
  Copy,
  Check,
  Sliders,
  Play,
  RotateCcw,
  Plus,
  RefreshCw,
  Layers,
  FileCode2,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface DynamicStateEnginePanelProps {
  characters: Character[];
  scenes: Scene[];
  plotThreads: PlotThread[];
  canonFacts: CanonFact[];
  activeSceneId?: string;
  onCommitSimulationState?: (simResult: StateEngineSimulationResult) => void;
}

export const DynamicStateEnginePanel: React.FC<DynamicStateEnginePanelProps> = ({
  characters,
  scenes,
  plotThreads,
  canonFacts,
  activeSceneId,
  onCommitSimulationState
}) => {
  const [promptText, setPromptText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'SYSTEM_PROMPT'>('SIMULATOR');
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    activeSceneId || scenes[0]?.id || ''
  );
  const [customDirective, setCustomDirective] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<StateEngineSimulationResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [committedSuccess, setCommittedSuccess] = useState<boolean>(false);
  const [activeRuleCategory, setActiveRuleCategory] = useState<string>('PHILOSOPHY');

  // Fetch standard system prompt text
  useEffect(() => {
    fetch('/api/state-engine/prompt')
      .then(res => res.json())
      .then(data => {
        if (data.promptText) setPromptText(data.promptText);
      })
      .catch(err => console.error("Error loading state engine prompt:", err));
  }, []);

  const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setCommittedSuccess(false);
    try {
      const res = await fetch('/api/gemini/simulate-state-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: selectedSceneId,
          userInstruction: customDirective
        })
      });
      const data = await res.json();
      if (data.success && data.simulation) {
        setSimulationResult(data.simulation);
      }
    } catch (err) {
      console.error("Simulation engine failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCommitState = () => {
    if (!simulationResult || !onCommitSimulationState) return;
    onCommitSimulationState(simulationResult);
    setCommittedSuccess(true);
    setTimeout(() => setCommittedSuccess(false), 3000);
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 md:p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2338] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white shadow-lg shadow-indigo-900/40">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold font-mono text-slate-100 tracking-wider uppercase">
                DYNAMIC NARRATIVE STATE ENGINE
              </h2>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
                SIMULATION & STATE EVOLUTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Moves Narrative Engine from static text generation into a living story universe simulation with consequence tracking, memory formation, and state evolution.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#0B1020] p-1 rounded-lg border border-[#1A2338] text-xs font-mono">
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'SIMULATOR'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>LIVE SIMULATOR</span>
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM_PROMPT')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'SYSTEM_PROMPT'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>SYSTEM PROMPT DIRECTIVE</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: SYSTEM PROMPT DIRECTIVE INSPECTOR & CUSTOMIZER */}
      {activeTab === 'SYSTEM_PROMPT' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B1020] p-3 rounded-xl border border-[#1A2338]">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold uppercase text-slate-200">
                DYNAMIC NARRATIVE STATE ENGINE SYSTEM PROMPT
              </span>
            </div>

            <button
              onClick={handleCopyPrompt}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1.5 border border-[#1A2338]"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied System Prompt!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Rule Category Selector */}
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {[
              { id: 'PHILOSOPHY', label: '1. Narrative Philosophy' },
              { id: 'CHARACTER', label: '2. Character Evolution' },
              { id: 'CONSEQUENCE', label: '3. Consequence Rules' },
              { id: 'MEMORY', label: '4. Story Memory' },
              { id: 'THREADS', label: '5. Plot Thread Rules' },
              { id: 'PAYOFFS', label: '6. Setups & Payoffs' },
              { id: 'INTERSECTION', label: '7. Intersection Engine' },
              { id: 'THEMES', label: '8. Theme Tracking' },
              { id: 'WRITERS_ROOM', label: '9. Writer’s Room' },
              { id: 'OUTPUT', label: '10. Output Requirements' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveRuleCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRuleCategory === cat.id
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 font-bold'
                    : 'bg-[#0B1020] text-slate-400 hover:bg-[#141B2D] hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Rule Detail View */}
          <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 text-xs font-mono leading-relaxed space-y-3">
            {activeRuleCategory === 'PHILOSOPHY' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">NARRATIVE PHILOSOPHY</div>
                <p>• Characters are not profiles — Characters are evolving entities.</p>
                <p>• Relationships are not labels — Relationships are dynamic systems.</p>
                <p>• Stories are not sequences of scenes — Stories are networks of consequences.</p>
                <p>• Every event must produce change. Every change must create consequences. Every consequence must influence future decisions.</p>
              </div>
            )}

            {activeRuleCategory === 'CHARACTER' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">CHARACTER EVOLUTION RULES</div>
                <p>Each character possesses: Goals, Fears, Beliefs, Knowledge, Secrets, Emotional State, Relationships, Memories, Arc Progression.</p>
                <div className="p-2 bg-[#141B2D] rounded border border-[#1A2338] text-slate-400 space-y-1">
                  <div>1. Determine if the character learned anything.</div>
                  <div>2. Determine if the character gained or lost trust.</div>
                  <div>3. Determine if emotional state changed.</div>
                  <div>4. Determine if goals changed.</div>
                  <div>5. Determine if beliefs changed.</div>
                  <div>6. Determine if relationships changed.</div>
                  <div>7. Determine if memories were created.</div>
                  <div>8. Store all changes in state.</div>
                </div>
              </div>
            )}

            {activeRuleCategory === 'CONSEQUENCE' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">NARRATIVE CONSEQUENCE RULES</div>
                <p>Every scene must answer: "What changed because this happened?"</p>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className="p-2 bg-[#141B2D] rounded">• Character Consequences</div>
                  <div className="p-2 bg-[#141B2D] rounded">• Relationship Consequences</div>
                  <div className="p-2 bg-[#141B2D] rounded">• World Consequences</div>
                  <div className="p-2 bg-[#141B2D] rounded">• Political Consequences</div>
                  <div className="p-2 bg-[#141B2D] rounded">• Emotional Consequences</div>
                  <div className="p-2 bg-[#141B2D] rounded">• Plot Consequences</div>
                </div>
              </div>
            )}

            {activeRuleCategory === 'MEMORY' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">STORY MEMORY RULES</div>
                <p>Maintain persistent memory at all times. Track scene events, trauma, victories, revelations, betrayals, promises, mysteries, decisions.</p>
                <p className="text-slate-400 italic">When generating future scenes: Retrieve relevant memories. Relevant memories must influence character behavior.</p>
              </div>
            )}

            {activeRuleCategory === 'THREADS' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">PLOT THREAD RULES</div>
                <p>Every active thread maintains: Status, Importance, Last Appearance, Current Progress.</p>
                <p>Classifications: <span className="text-emerald-400">Open</span> | <span className="text-sky-400">Active</span> | <span className="text-amber-400">Escalating</span> | <span className="text-rose-400">Stalled</span> | <span className="text-indigo-400">Resolved</span></p>
              </div>
            )}

            {activeRuleCategory === 'PAYOFFS' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">SETUP AND PAYOFF RULES</div>
                <p>Treat every setup as a narrative obligation. Track objects, secrets, prophecies, relationships, mysteries, foreshadowing.</p>
              </div>
            )}

            {activeRuleCategory === 'INTERSECTION' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">INTERSECTION ENGINE RULES</div>
                <p>Search for character collisions: shared goals, opposing goals, locations, themes, secrets, history. Calculate convergence opportunities.</p>
              </div>
            )}

            {activeRuleCategory === 'THEMES' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">THEME TRACKING RULES</div>
                <p>Track active themes (Redemption, Memory, Identity, Power, Sacrifice, Trust). Every scene must contribute to at least one theme.</p>
              </div>
            )}

            {activeRuleCategory === 'WRITERS_ROOM' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">WRITER'S ROOM REASONING</div>
                <p>Before writing: Story Architect (purpose) → Character Psychologist (growth) → Plot Engineer (threads) → Continuity Guardian (canon) → Theme Analyst (theme contribution).</p>
              </div>
            )}

            {activeRuleCategory === 'OUTPUT' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-indigo-400 font-bold uppercase">10-POINT OUTPUT REQUIREMENTS</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Scene Summary</li>
                  <li>Character Changes</li>
                  <li>Relationship Changes</li>
                  <li>Plot Thread Updates</li>
                  <li>New Memories Created</li>
                  <li>Setup/Payoff Events</li>
                  <li>Timeline Changes</li>
                  <li>Canon Updates</li>
                  <li>Narrative Consequences</li>
                  <li>Future Opportunities</li>
                </ol>
              </div>
            )}
          </div>

          {/* Full Code View Box */}
          <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 overflow-x-auto max-h-96">
            <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {promptText}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: LIVE SIMULATOR EXECUTION */}
      {activeTab === 'SIMULATOR' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Target Scene Beat for Simulation:
                </label>
                <select
                  value={selectedSceneId}
                  onChange={e => setSelectedSceneId(e.target.value)}
                  className="w-full bg-[#141B2D] border border-[#1A2338] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {scenes.map(s => (
                    <option key={s.id} value={s.id}>
                      [Ch. {s.chapter}] {s.title} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Custom Simulation Directive (Optional):
                </label>
                <input
                  type="text"
                  value={customDirective}
                  onChange={e => setCustomDirective(e.target.value)}
                  placeholder="e.g., Force high-stress confrontation over Dr. Elena Ryder's secret..."
                  className="w-full bg-[#141B2D] border border-[#1A2338] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#1A2338] pt-3">
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Simulating scene will evaluate all 10 Dynamic State rules and evolve world memory.</span>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className={`px-5 py-2.5 rounded-lg font-mono font-bold text-xs transition-all flex items-center space-x-2 shadow-lg ${
                  isSimulating
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/40'
                }`}
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Executing Narrative Simulation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>EXECUTE DYNAMIC NARRATIVE SIMULATION</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SIMULATION RESULTS DASHBOARD */}
          {simulationResult && (
            <div className="space-y-6 animate-fadeIn">
              {/* High Thinking Chain Reasoning Ledger */}
              {simulationResult.thinkingSteps && simulationResult.thinkingSteps.length > 0 && (
                <div className="bg-[#0B1020] border border-indigo-900/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 border-b border-[#1A2338] pb-2">
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-indigo-300 uppercase">
                      STATE ENGINE HIGH-THINKING REASONING STEPS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                    {simulationResult.thinkingSteps.map(step => (
                      <div key={step.step} className="bg-[#141B2D] p-2.5 rounded-lg border border-[#1A2338] text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px] text-indigo-400 mb-1">
                          <span>STEP 0{step.step}</span>
                          <span className="uppercase text-slate-500">{step.phase}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-snug">{step.thought}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commit Action Header */}
              <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 p-4 rounded-xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-mono font-bold text-indigo-200 uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    SIMULATION COMPLETE: 10-POINT STATE EVOLUTION GENERATED
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {simulationResult.sceneSummary}
                  </p>
                </div>

                <button
                  onClick={handleCommitState}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 shadow-lg ${
                    committedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  }`}
                >
                  {committedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>STATE COMMITTED TO UNIVERSE!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMMIT SIMULATION STATE TO WORKSPACE</span>
                    </>
                  )}
                </button>
              </div>

              {/* 10-Point Output Ledger Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* CARD 1: Character State Evolution */}
                <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[#1A2338] pb-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                      1. CHARACTER STATE EVOLUTION
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {simulationResult.characterChanges.map((change, idx) => (
                      <div key={idx} className="bg-[#141B2D] p-3 rounded-lg border border-[#1A2338] space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-100">
                          <span>{change.charName}</span>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                            {change.emotionalStateChange}
                          </span>
                        </div>

                        {change.learnedInfo && (
                          <div className="text-[11px] text-slate-300">
                            <strong className="text-amber-400 font-mono">Learned Info:</strong> {change.learnedInfo}
                          </div>
                        )}

                        {change.goalShift && (
                          <div className="text-[11px] text-slate-300">
                            <strong className="text-sky-400 font-mono">Goal Shift:</strong> {change.goalShift}
                          </div>
                        )}

                        {change.trustShift && (
                          <div className="text-[11px] text-slate-300">
                            <strong className="text-emerald-400 font-mono">Trust Shift:</strong> {change.trustShift}
                          </div>
                        )}

                        {change.memoryCreated && (
                          <div className="text-[11px] text-slate-300 bg-[#0B1020] p-2 rounded border border-[#1A2338]">
                            <strong className="text-purple-400 font-mono">New Memory:</strong> "{change.memoryCreated}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CARD 2: Narrative Consequences Matrix */}
                <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[#1A2338] pb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                      2. 6-DIMENSIONAL NARRATIVE CONSEQUENCES
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#141B2D] p-2.5 rounded-lg border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block mb-1">
                        CHARACTER CONSEQUENCES:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {simulationResult.narrativeConsequences.characterConsequences.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#141B2D] p-2.5 rounded-lg border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                        RELATIONSHIP CONSEQUENCES:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {simulationResult.narrativeConsequences.relationshipConsequences.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#141B2D] p-2.5 rounded-lg border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                        WORLD & PHYSICAL CONSEQUENCES:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {simulationResult.narrativeConsequences.worldConsequences.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#141B2D] p-2.5 rounded-lg border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-1">
                        POLITICAL & FACTION CONSEQUENCES:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {simulationResult.narrativeConsequences.politicalConsequences.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Plot Thread & Setup / Payoff Updates */}
                <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[#1A2338] pb-2">
                    <GitBranch className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                      3. PLOT THREAD & SETUP / PAYOFF UPDATES
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {simulationResult.plotThreadUpdates.map((thread, i) => (
                      <div key={i} className="bg-[#141B2D] p-2.5 rounded-lg border border-[#1A2338] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-100">{thread.threadName}</div>
                          <div className="text-[11px] text-slate-400">{thread.progressNotes}</div>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          thread.status === 'Escalating' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        }`}>
                          {thread.status}
                        </span>
                      </div>
                    ))}

                    {simulationResult.setupPayoffEvents.map((evt, i) => (
                      <div key={i} className="bg-[#141B2D] p-2.5 rounded-lg border border-purple-900/40 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-200">{evt.title}</span>
                          <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                            {evt.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{evt.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CARD 4: Canon Vault & Future Opportunities */}
                <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[#1A2338] pb-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                      4. CANON UPDATES & FUTURE CONVERGENCE OPPORTUNITIES
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-[#141B2D] p-3 rounded-lg border border-[#1A2338] space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                        ESTABLISHED CANON UPDATES:
                      </span>
                      {simulationResult.canonUpdates.map((fact, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#141B2D] p-3 rounded-lg border border-[#1A2338] space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                        RECOMMENDED FUTURE SCENE OPPORTUNITIES:
                      </span>
                      {simulationResult.futureOpportunities.map((opp, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                          <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
