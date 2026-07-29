import React, { useState, useEffect } from 'react';
import {
  Character,
  Relationship,
  Scene,
  TimelineEvent,
  PlotThread,
  ConvergenceEvent,
  CanonFact,
  ContinuityViolation,
  SceneProposal,
  ProjectMetadata,
  PresetMode,
  CanonCategory
} from './types';
import { HeaderTransport } from './components/HeaderTransport';
import { BrowserPanel } from './components/BrowserPanel';
import { MpcPadMatrix } from './components/MpcPadMatrix';
import { RelationshipWeb } from './components/RelationshipWeb';
import { CharacterIntelligence } from './components/CharacterIntelligence';
import { SceneEditorWorkstation } from './components/SceneEditorWorkstation';
import { TimelineObservatory } from './components/TimelineObservatory';
import { CanonMemoryVault } from './components/CanonMemoryVault';
import { ConvergenceMap } from './components/ConvergenceMap';
import { ContinuityMonitor } from './components/ContinuityMonitor';
import { AiCommandDrawer } from './components/AiCommandDrawer';
import { BottomTrackMixer } from './components/BottomTrackMixer';
import { CharacterContextPanel } from './components/CharacterContextPanel';
import { WritersRoomPanel } from './components/WritersRoomPanel';
import { ConsequenceEngine } from './components/ConsequenceEngine';
import { SetupPayoffTracker } from './components/SetupPayoffTracker';
import { IntersectionMatrix } from './components/IntersectionMatrix';
import { StructureIntelligence } from './components/StructureIntelligence';
import { OffscreenSimulator } from './components/OffscreenSimulator';
import { DynamicStateEnginePanel } from './components/DynamicStateEnginePanel';
import { GuidedTutorial } from './components/GuidedTutorial';
import { StructureFramework, StructureMilestone, StateEngineSimulationResult } from './types';
import { INITIAL_PROJECT, INITIAL_CHARACTERS, INITIAL_RELATIONSHIPS, INITIAL_PLOT_THREADS, INITIAL_CONVERGENCE_EVENTS, INITIAL_SCENES, INITIAL_TIMELINE_EVENTS, INITIAL_CANON_FACTS, INITIAL_VIOLATIONS, INITIAL_STRUCTURE_MILESTONES } from './data/initialData';
import { useSetupPayoffStore } from './stores/setupPayoffStore';

export default function App() {
  const [project, setProject] = useState<ProjectMetadata>(INITIAL_PROJECT);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [relationships, setRelationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>(INITIAL_PLOT_THREADS);
  const [convergenceEvents, setConvergenceEvents] = useState<ConvergenceEvent[]>(INITIAL_CONVERGENCE_EVENTS);
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [canonFacts, setCanonFacts] = useState<CanonFact[]>(INITIAL_CANON_FACTS);
  const [violations, setViolations] = useState<ContinuityViolation[]>(INITIAL_VIOLATIONS);
  const [structureMilestones, setStructureMilestones] = useState<StructureMilestone[]>(INITIAL_STRUCTURE_MILESTONES);
  const [structureFramework, setStructureFramework] = useState<StructureFramework>('3-Act');
  const [proposals, setProposals] = useState<SceneProposal[]>([]);

  const [activePreset, setActivePreset] = useState<PresetMode>('WRITING');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(INITIAL_CHARACTERS[0].id);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(INITIAL_SCENES[0].id);
  const [isBrowserCollapsed, setIsBrowserCollapsed] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Fetch initial state from Express backend
  useEffect(() => {
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        if (data.project) setProject(data.project);
        if (data.characters) setCharacters(data.characters);
        if (data.relationships) setRelationships(data.relationships);
        if (data.plotThreads) setPlotThreads(data.plotThreads);
        if (data.convergenceEvents) setConvergenceEvents(data.convergenceEvents);
        if (data.scenes) setScenes(data.scenes);
        if (data.timelineEvents) setTimelineEvents(data.timelineEvents);
        if (data.canonFacts) setCanonFacts(data.canonFacts);
        if (data.violations) setViolations(data.violations);
        if (data.structureMilestones) setStructureMilestones(data.structureMilestones);
        if (data.structureFramework) setStructureFramework(data.structureFramework);
        if (data.proposals) setProposals(data.proposals);
        if (data.setups || data.payoffs) {
          useSetupPayoffStore.getState().setInitialState(data.setups || [], data.payoffs || []);
        }
      })
      .catch(err => {
        console.warn('Backend endpoint unreachable, running in client memory mode:', err);
      });
  }, []);

  // Sync mutations back to backend
  const syncStateToBackend = (updatedState: any) => {
    const currentSetupState = useSetupPayoffStore.getState();
    const payload = {
      setups: currentSetupState.setups,
      payoffs: currentSetupState.payoffs,
      ...updatedState
    };
    fetch('/api/update-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error('Failed to sync to server:', err));
  };

  // Automatically sync when setup/payoff store undergoes updates
  useEffect(() => {
    const unsub = useSetupPayoffStore.subscribe((state) => {
      syncStateToBackend({ setups: state.setups, payoffs: state.payoffs });
    });
    return () => unsub();
  }, []);

  const handleUpdateStructure = (newMilestones: StructureMilestone[], newFramework: StructureFramework) => {
    setStructureMilestones(newMilestones);
    setStructureFramework(newFramework);
    syncStateToBackend({ structureMilestones: newMilestones, structureFramework: newFramework });
  };

  const handleUpdateTimelineEvents = (newEvents: TimelineEvent[]) => {
    setTimelineEvents(newEvents);
    syncStateToBackend({ timelineEvents: newEvents });
  };

  const handleCommitSimulationState = (simResult: StateEngineSimulationResult) => {
    let updatedFacts = [...canonFacts];
    if (simResult.canonUpdates && simResult.canonUpdates.length > 0) {
      const newFacts: CanonFact[] = simResult.canonUpdates.map((factStr: string, index: number) => ({
        id: `cf_sim_${Date.now()}_${index}`,
        fact: factStr,
        category: 'Lore' as const,
        confidence: 95,
        contentHash: 'sim',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      updatedFacts = [...newFacts, ...updatedFacts];
      setCanonFacts(updatedFacts);
    }

    let updatedChars = [...characters];
    if (simResult.characterChanges && simResult.characterChanges.length > 0) {
      updatedChars = updatedChars.map(char => {
        const matchingChange = simResult.characterChanges.find((sc: any) =>
          char.name.toLowerCase().includes(sc.charName?.toLowerCase() || '') || char.id === sc.charId
        );
        if (matchingChange) {
          const updated = { ...char };
          if (matchingChange.emotionalStateChange) {
            updated.emotionalState = {
              ...updated.emotionalState,
              mood: matchingChange.emotionalStateChange
            };
          }
          if (matchingChange.goalShift) {
            updated.goals = matchingChange.goalShift;
          }
          return updated;
        }
        return char;
      });
      setCharacters(updatedChars);
    }

    let updatedThreads = [...plotThreads];
    if (simResult.plotThreadUpdates && simResult.plotThreadUpdates.length > 0) {
      updatedThreads = updatedThreads.map(thread => {
        const match = simResult.plotThreadUpdates.find((t: any) => t.threadName === thread.name || t.threadId === thread.id);
        if (match) {
          return {
            ...thread,
            status: match.status === 'Escalating' ? 'Escalating' : match.status === 'Resolved' ? 'Resolved' : thread.status,
            progress: match.status === 'Resolved' ? 100 : Math.min(95, thread.progress + 15)
          };
        }
        return thread;
      });
      setPlotThreads(updatedThreads);
    }

    syncStateToBackend({
      characters: updatedChars,
      canonFacts: updatedFacts,
      plotThreads: updatedThreads
    });
  };

  // Generate AI Scene Proposal via Server SDK endpoint
  const handleGenerateProposal = async (data: {
    location: string;
    participantIds: string[];
    purpose: string;
    threadId: string;
    promptInstructions: string;
    adapter: string;
  }) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/propose-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success && result.proposal) {
        setProposals(prev => [result.proposal, ...prev]);
        setIsAiDrawerOpen(false);
        setActivePreset('WRITING');
      }
    } catch (error) {
      console.error('Error generating AI proposal:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Approve AI Scene Proposal
  const handleApproveProposal = async (proposalId: string) => {
    try {
      const res = await fetch('/api/approve-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId })
      });
      const result = await res.json();
      if (result.success) {
        if (result.scenes) setScenes(result.scenes);
        if (result.characters) setCharacters(result.characters);
        if (result.canonFacts) setCanonFacts(result.canonFacts);
        if (result.proposals) setProposals(result.proposals);
        if (result.scene) setSelectedSceneId(result.scene.id);
      }
    } catch (e) {
      console.error('Failed to approve proposal:', e);
    }
  };

  const [isAuditing, setIsAuditing] = useState(false);

  // Run Continuity Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/validate-continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await res.json();
      if (result.success) {
        if (result.continuityScore !== undefined) {
          setProject(prev => ({ ...prev, continuityScore: result.continuityScore }));
        }
        if (result.violations) {
          setViolations(result.violations);
        }
        setActivePreset('CONTINUITY');
      }
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  // Quick Adds
  const handleQuickAddCharacter = () => {
    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: 'New Operative',
      role: 'Supporting',
      portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      goals: 'Establish contact with resistance forces.',
      emotionalState: { score: 50, mood: 'Guarded' },
      trustMap: {},
      secrets: ['Holds confidential signal frequency.'],
      arcProgress: 10,
      traits: ['Resourceful'],
      status: 'Active'
    };
    const updated = [newChar, ...characters];
    setCharacters(updated);
    setSelectedCharId(newChar.id);
    syncStateToBackend({ characters: updated });
  };

  const handleQuickAddScene = (padIndex?: number) => {
    const nextPad = padIndex || (scenes.length + 1);
    const newScene: Scene = {
      id: `sc_${Date.now()}`,
      chapter: 1,
      padIndex: nextPad,
      title: `Scene Pad ${nextPad}`,
      location: 'Citadel Sector 4 Relay',
      participantIds: [characters[0]?.id || 'char_ava'],
      purpose: 'Advance narrative plot thread.',
      status: 'Drafted',
      prose: 'The terminal flickered with emerald telemetry. A faint hum reverberated through the alloy flooring as the transmission completed.',
      expectedConsequences: ['Signal sent.'],
      timelinePhase: nextPad,
      wordCount: 22,
      threadId: plotThreads[0]?.id
    };
    const updated = [...scenes, newScene];
    setScenes(updated);
    setSelectedSceneId(newScene.id);
    syncStateToBackend({ scenes: updated });
  };

  const replaceNameInString = (str: string | undefined, oldName: string, newName: string): string => {
    if (!str || !oldName || oldName === newName) return str || '';
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    return str.replace(regex, newName);
  };

  const handleSaveScene = (updatedScene: Scene) => {
    const oldScene = scenes.find(s => s.id === updatedScene.id);
    let updatedScenes = scenes.map(s => s.id === updatedScene.id ? updatedScene : s);
    let updatedTimelineEvents = [...timelineEvents];
    let updatedCanonFacts = [...canonFacts];

    if (oldScene) {
      const titleChanged = oldScene.title !== updatedScene.title && oldScene.title.trim() !== '';
      const locationChanged = oldScene.location !== updatedScene.location && oldScene.location.trim() !== '';

      if (titleChanged) {
        const oldTitle = oldScene.title.trim();
        const newTitle = updatedScene.title.trim();
        updatedTimelineEvents = updatedTimelineEvents.map(evt => ({
          ...evt,
          description: replaceNameInString(evt.description, oldTitle, newTitle)
        }));
      }

      if (locationChanged) {
        const oldLoc = oldScene.location.trim();
        const newLoc = updatedScene.location.trim();

        updatedTimelineEvents = updatedTimelineEvents.map(evt => ({
          ...evt,
          description: replaceNameInString(evt.description, oldLoc, newLoc),
          timestampLabel: replaceNameInString(evt.timestampLabel, oldLoc, newLoc)
        }));

        updatedCanonFacts = updatedCanonFacts.map(fact => ({
          ...fact,
          fact: replaceNameInString(fact.fact, oldLoc, newLoc)
        }));
      }

      setTimelineEvents(updatedTimelineEvents);
      setCanonFacts(updatedCanonFacts);
    }

    setScenes(updatedScenes);

    syncStateToBackend({
      scenes: updatedScenes,
      timelineEvents: updatedTimelineEvents,
      canonFacts: updatedCanonFacts
    });
  };

  const handleUpdateCharacter = (updatedChar: Character) => {
    const oldChar = characters.find(c => c.id === updatedChar.id);
    let updatedCharacters = characters.map(c => c.id === updatedChar.id ? updatedChar : c);
    let updatedRelationships = [...relationships];
    let updatedTimelineEvents = [...timelineEvents];
    let updatedCanonFacts = [...canonFacts];
    let updatedScenes = [...scenes];
    let updatedPlotThreads = [...plotThreads];

    if (oldChar && oldChar.name !== updatedChar.name && oldChar.name.trim() !== '') {
      const oldName = oldChar.name.trim();
      const newName = updatedChar.name.trim();

      // Propagate through Character Relationship maps / histories
      updatedRelationships = updatedRelationships.map(rel => ({
        ...rel,
        history: replaceNameInString(rel.history, oldName, newName)
      }));

      // Propagate through Timeline Events references
      updatedTimelineEvents = updatedTimelineEvents.map(evt => ({
        ...evt,
        description: replaceNameInString(evt.description, oldName, newName),
        timestampLabel: replaceNameInString(evt.timestampLabel, oldName, newName),
        violationDetails: evt.violationDetails ? replaceNameInString(evt.violationDetails, oldName, newName) : undefined
      }));

      // Propagate through Canon Facts
      updatedCanonFacts = updatedCanonFacts.map(fact => ({
        ...fact,
        fact: replaceNameInString(fact.fact, oldName, newName)
      }));

      // Propagate through Scenes
      updatedScenes = updatedScenes.map(sc => ({
        ...sc,
        title: replaceNameInString(sc.title, oldName, newName),
        prose: replaceNameInString(sc.prose, oldName, newName),
        purpose: replaceNameInString(sc.purpose, oldName, newName),
        expectedConsequences: sc.expectedConsequences.map(c => replaceNameInString(c, oldName, newName))
      }));

      // Propagate through Plot Threads
      updatedPlotThreads = updatedPlotThreads.map(pt => ({
        ...pt,
        setup: replaceNameInString(pt.setup, oldName, newName),
        escalation: replaceNameInString(pt.escalation, oldName, newName),
        payoff: replaceNameInString(pt.payoff, oldName, newName)
      }));

      setRelationships(updatedRelationships);
      setTimelineEvents(updatedTimelineEvents);
      setCanonFacts(updatedCanonFacts);
      setScenes(updatedScenes);
      setPlotThreads(updatedPlotThreads);
    }

    setCharacters(updatedCharacters);

    syncStateToBackend({
      characters: updatedCharacters,
      relationships: updatedRelationships,
      timelineEvents: updatedTimelineEvents,
      canonFacts: updatedCanonFacts,
      scenes: updatedScenes,
      plotThreads: updatedPlotThreads
    });
  };

  const handleUpdateLocation = (oldLocation: string, newLocation: string) => {
    if (!oldLocation || !newLocation || oldLocation === newLocation) return;
    const oldLoc = oldLocation.trim();
    const newLoc = newLocation.trim();

    const updatedScenes = scenes.map(sc => sc.location === oldLoc ? { ...sc, location: newLoc } : sc);

    const updatedTimelineEvents = timelineEvents.map(evt => ({
      ...evt,
      description: replaceNameInString(evt.description, oldLoc, newLoc),
      timestampLabel: replaceNameInString(evt.timestampLabel, oldLoc, newLoc)
    }));

    const updatedCanonFacts = canonFacts.map(fact => ({
      ...fact,
      fact: replaceNameInString(fact.fact, oldLoc, newLoc)
    }));

    setScenes(updatedScenes);
    setTimelineEvents(updatedTimelineEvents);
    setCanonFacts(updatedCanonFacts);

    syncStateToBackend({
      scenes: updatedScenes,
      timelineEvents: updatedTimelineEvents,
      canonFacts: updatedCanonFacts
    });
  };

  const handleAddFact = (factText: string, category: CanonCategory) => {
    const newFact: CanonFact = {
      id: `fact_${Date.now()}`,
      category,
      fact: factText,
      confidence: 100,
      contentHash: Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newFact, ...canonFacts];
    setCanonFacts(updated);
    syncStateToBackend({ canonFacts: updated });
  };

  const handleResolveViolation = (id: string) => {
    const updated = violations.map(v => v.id === id ? { ...v, resolved: true } : v);
    setViolations(updated);
    syncStateToBackend({ violations: updated });
  };

  const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[0] || null;

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header & Transport Bar */}
      <HeaderTransport
        project={project}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        continuityScore={project.continuityScore}
        canonCount={canonFacts.length}
        violationCount={violations.filter(v => !v.resolved).length}
        aiStatus={isAiLoading ? 'PROPOSING' : 'READY'}
        onRunAudit={handleRunAudit}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main Workspace Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Browser */}
        <BrowserPanel
          characters={characters}
          scenes={scenes}
          plotThreads={plotThreads}
          canonFacts={canonFacts}
          violations={violations}
          relationships={relationships}
          convergenceEvents={convergenceEvents}
          selectedCharId={selectedCharId}
          setSelectedCharId={setSelectedCharId}
          selectedSceneId={selectedSceneId}
          setSelectedSceneId={setSelectedSceneId}
          isCollapsed={isBrowserCollapsed}
          setIsCollapsed={setIsBrowserCollapsed}
          onQuickAddCharacter={handleQuickAddCharacter}
          onQuickAddScene={() => handleQuickAddScene()}
          onQuickAddPlotThread={() => {}}
          onQuickAddFact={() => handleAddFact('New story lore principle recorded.', 'Lore')}
          onUpdateCharacter={handleUpdateCharacter}
          onUpdateScene={handleSaveScene}
          onUpdateLocation={handleUpdateLocation}
        />

        {/* Center Workspace Canvas (Adapts to Workspace Preset Mode) */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Preset 1: WRITING MODE (80% Scene Editor + 20% Character Context, Timeline Hidden) */}
          {activePreset === 'WRITING' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* 80% Width: Scene Editor Workstation */}
                <div className="lg:col-span-9 xl:col-span-9 space-y-4">
                  <SceneEditorWorkstation
                    scene={selectedScene}
                    characters={characters}
                    proposals={proposals}
                    onSaveScene={handleSaveScene}
                    onApproveProposal={handleApproveProposal}
                    onOpenAiProposeModal={() => setIsAiDrawerOpen(true)}
                  />
                </div>

                {/* 20% Width: Character Context Drawer */}
                <div className="lg:col-span-3 xl:col-span-3">
                  <CharacterContextPanel
                    scene={selectedScene}
                    characters={characters}
                    onSelectCharacter={setSelectedCharId}
                  />
                </div>
              </div>

              {/* MPC Scene Pad Matrix (Sequencer Pads) */}
              <MpcPadMatrix
                scenes={scenes}
                characters={characters}
                selectedSceneId={selectedSceneId}
                onSelectScene={setSelectedSceneId}
                onNewSceneOnPad={padIdx => handleQuickAddScene(padIdx)}
                soundEnabled={soundEnabled}
              />
            </div>
          )}

          {/* DYNAMIC NARRATIVE STATE ENGINE & SIMULATION DIRECTIVE */}
          {activePreset === 'STATE_ENGINE' && (
            <div className="space-y-4">
              <DynamicStateEnginePanel
                characters={characters}
                scenes={scenes}
                plotThreads={plotThreads}
                canonFacts={canonFacts}
                activeSceneId={selectedSceneId || undefined}
                onCommitSimulationState={handleCommitSimulationState}
              />
            </div>
          )}

          {/* Phase 10: WRITER'S ROOM AI ADVISORY BOARD */}
          {activePreset === 'WRITERS_ROOM' && (
            <div className="space-y-4">
              <WritersRoomPanel
                scenes={scenes}
                characters={characters}
                canonFacts={canonFacts}
                plotThreads={plotThreads}
                selectedSceneId={selectedSceneId || undefined}
                onSelectScene={(id) => setSelectedSceneId(id)}
                onSaveScene={handleSaveScene}
                onAddProposal={(proposal) => setProposals(prev => [proposal, ...prev])}
              />
              <SceneEditorWorkstation
                scene={selectedScene}
                characters={characters}
                proposals={proposals}
                onSaveScene={handleSaveScene}
                onApproveProposal={handleApproveProposal}
                onOpenAiProposeModal={() => setIsAiDrawerOpen(true)}
              />
            </div>
          )}

          {/* Phase 2 & 3 & 5 & 6: NARRATIVE CONSEQUENCE & SETUP/PAYOFF ENGINE */}
          {activePreset === 'CONSEQUENCE' && (
            <div className="space-y-4">
              <ConsequenceEngine characters={characters} />
              <SetupPayoffTracker
                plotThreads={plotThreads}
                scenes={scenes}
                characters={characters}
                canonFacts={canonFacts}
                currentChapter={23}
              />
            </div>
          )}

          {/* Phase 7 & 8: INTERSECTION & ENSEMBLE NARRATIVE MATRIX */}
          {activePreset === 'INTERSECTION' && (
            <div className="space-y-4">
              <IntersectionMatrix characters={characters} />
              <ConvergenceMap
                plotThreads={plotThreads}
                convergenceEvents={convergenceEvents}
                onTriggerBackwardPlan={handleRunAudit}
              />
            </div>
          )}

          {/* Phase 9: STORY STRUCTURE INTELLIGENCE */}
          {activePreset === 'STRUCTURE' && (
            <div className="space-y-4">
              <StructureIntelligence
                milestones={structureMilestones}
                activeFramework={structureFramework}
                onUpdateStructure={handleUpdateStructure}
              />
              <TimelineObservatory
                events={timelineEvents}
                characters={characters}
                onUpdateEvents={handleUpdateTimelineEvents}
              />
            </div>
          )}

          {/* Phase 11: OFF-SCREEN UNIVERSE BACKGROUND SIMULATOR */}
          {activePreset === 'OFFSCREEN_SIM' && (
            <div className="space-y-4">
              <OffscreenSimulator characters={characters} />
              <CharacterIntelligence
                characters={characters}
                selectedCharId={selectedCharId}
                onSelectCharacter={setSelectedCharId}
                onUpdateCharacter={handleUpdateCharacter}
                onAddCharacter={handleQuickAddCharacter}
              />
            </div>
          )}

          {/* Preset 2: CHARACTER DESIGN MODE (Character Inspector, Arc Progression & Relationship Matrix) */}
          {activePreset === 'CHARACTER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Character Inspector & Arc Progression */}
                <div className="xl:col-span-7 space-y-4">
                  <CharacterIntelligence
                    characters={characters}
                    selectedCharId={selectedCharId}
                    onSelectCharacter={setSelectedCharId}
                    onUpdateCharacter={handleUpdateCharacter}
                    onAddCharacter={handleQuickAddCharacter}
                  />
                </div>

                {/* Relationship Matrix & Web */}
                <div className="xl:col-span-5 space-y-4">
                  <RelationshipWeb
                    characters={characters}
                    relationships={relationships}
                    selectedCharId={selectedCharId}
                    onSelectCharacter={setSelectedCharId}
                    onAddRelationship={() => {}}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preset 3: CONTINUITY MODE (Violations Panel, Canon Search & Timeline Observatory) */}
          {activePreset === 'CONTINUITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Prominent Violations Panel */}
                <div className="xl:col-span-6 space-y-4">
                  <ContinuityMonitor
                    continuityScore={project.continuityScore}
                    violations={violations}
                    characters={characters}
                    onRunAudit={handleRunAudit}
                    onResolveViolation={handleResolveViolation}
                    onUpdateCharacter={updated => {
                      const newChars = characters.map(c => c.id === updated.id ? updated : c);
                      setCharacters(newChars);
                      syncStateToBackend({ characters: newChars });
                    }}
                    isAuditing={isAuditing}
                  />
                </div>

                {/* Canon Search & Vault */}
                <div className="xl:col-span-6 space-y-4">
                  <CanonMemoryVault
                    canonFacts={canonFacts}
                    onAddFact={handleAddFact}
                  />
                </div>
              </div>

              {/* Timeline Observatory for Canon Verification */}
              <TimelineObservatory
                events={timelineEvents}
                characters={characters}
                onUpdateEvents={handleUpdateTimelineEvents}
              />
            </div>
          )}

          {/* Preset 4: PLANNING MODE (Timeline Observatory & Convergence Map) */}
          {activePreset === 'PLANNING' && (
            <div className="space-y-4">
              <TimelineObservatory
                events={timelineEvents}
                characters={characters}
                onUpdateEvents={handleUpdateTimelineEvents}
              />
              <ConvergenceMap
                plotThreads={plotThreads}
                convergenceEvents={convergenceEvents}
                onTriggerBackwardPlan={handleRunAudit}
              />
            </div>
          )}

          {/* Preset 5: MPC PADS SEQUENCER MODE */}
          {activePreset === 'MPC_GRID' && (
            <div className="space-y-4">
              <MpcPadMatrix
                scenes={scenes}
                characters={characters}
                selectedSceneId={selectedSceneId}
                onSelectScene={setSelectedSceneId}
                onNewSceneOnPad={padIdx => handleQuickAddScene(padIdx)}
                soundEnabled={soundEnabled}
              />
              <SceneEditorWorkstation
                scene={selectedScene}
                characters={characters}
                proposals={proposals}
                onSaveScene={handleSaveScene}
                onApproveProposal={handleApproveProposal}
                onOpenAiProposeModal={() => setIsAiDrawerOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Bottom Track Sequencer & Mixer Deck */}
      <BottomTrackMixer
        plotThreads={plotThreads}
        scenes={scenes}
        selectedSceneId={selectedSceneId}
        onSelectScene={setSelectedSceneId}
      />

      {/* AI Proposal Drawer Modal */}
      <AiCommandDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        characters={characters}
        plotThreads={plotThreads}
        onGenerateProposal={handleGenerateProposal}
        isLoading={isAiLoading}
      />

      {/* Guided Tutorial Overlay with Instruction Bubbles */}
      <GuidedTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onRunAudit={handleRunAudit}
      />
    </div>
  );
}
