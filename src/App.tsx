import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useSettingsStore } from './stores/settingsStore';
import { useAuthStore } from './stores/authStore';
import React, { useState, useEffect } from 'react';
import { LiveVoiceChat } from './components/LiveVoiceChat';

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
import { NarrativeNavigator } from './components/NarrativeNavigator';
import { SceneBoard } from './components/SceneBoard';
import { StatusDock } from './components/StatusDock';
import { RelationshipWeb } from './components/RelationshipWeb';
import { CharacterIntelligence } from './components/CharacterIntelligence';
import { SceneEditorWorkstation } from './components/SceneEditorWorkstation';
import { TimelineObservatory } from './components/TimelineObservatory';
import { CanonMemoryVault } from './components/CanonMemoryVault';
import { ConvergenceMap } from './components/ConvergenceMap';
import { ContinuityMonitor } from './components/ContinuityMonitor';
import { AiCommandDrawer } from './components/AiCommandDrawer';
import { CharacterContextPanel } from './components/CharacterContextPanel';
import { WritersRoomPanel } from './components/WritersRoomPanel';
import { ConsequenceEngine } from './components/ConsequenceEngine';
import { SetupPayoffTracker } from './components/SetupPayoffTracker';
import { IntersectionMatrix } from './components/IntersectionMatrix';
import { StructureIntelligence } from './components/StructureIntelligence';
import { OffscreenSimulator } from './components/OffscreenSimulator';
import { DynamicStateEnginePanel } from './components/DynamicStateEnginePanel';
import { GuidedTutorial } from './components/GuidedTutorial';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { GoogleKeepWorkspace } from './components/GoogleKeepWorkspace';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import { PlotEvolutionWorkstation } from './components/PlotEvolutionWorkstation';
import { TestingHarnessModal } from './components/TestingHarnessModal';
import { WritingStudioWindow } from './components/writingStudio/WritingStudioWindow';
import { useWritingStudioStore } from './stores/writingStudioStore';
import { NarrativeSyncService } from './services/narrativeSyncService';
import { useAuditTrailStore } from './services/auditTrailService';
import { StructureFramework, StructureMilestone, StateEngineSimulationResult, WorkspaceMode, SelectedNarrativeObject, NarrativeObjectType } from './types';
import { INITIAL_PROJECT, INITIAL_CHARACTERS, INITIAL_RELATIONSHIPS, INITIAL_PLOT_THREADS, INITIAL_CONVERGENCE_EVENTS, INITIAL_SCENES, INITIAL_TIMELINE_EVENTS, INITIAL_CANON_FACTS, INITIAL_VIOLATIONS, INITIAL_STRUCTURE_MILESTONES } from './data/initialData';
import { useSetupPayoffStore } from './stores/setupPayoffStore';
import { useWorkspaceStore } from './stores/workspaceStore';
import { DockManager } from './components/workspace/DockManager';
import { WorkspaceCanvas } from './components/workspace/WorkspaceCanvas';
import { PanelContainer } from './components/workspace/PanelContainer';




export default function App() {
  const { firebaseUser: user } = useAuthStore();
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

  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(INITIAL_CHARACTERS[0].id);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(INITIAL_SCENES[0].id);
  const [selectedObject, setSelectedObject] = useState<SelectedNarrativeObject | null>(null);
  const [isBrowserCollapsed, setIsBrowserCollapsed] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isKeepOpen, setIsKeepOpen] = useState<boolean>(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);
  const [isTestHarnessOpen, setIsTestHarnessOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
      const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Setup Firestore save/load
  useEffect(() => {
    const saveToFirestore = async () => {
      const { firebaseUser } = useAuthStore.getState();
      if (!firebaseUser) {
        alert("Please sign in to save to cloud.");
        return;
      }
      
      try {
        useSettingsStore.setState({ cloudSyncStatus: 'syncing' });
        
                const data = {
          project,
          characters,
          relationships,
          plotThreads,
          convergenceEvents,
          scenes,
          timelineEvents,
          canonFacts,
          violations,
          structureMilestones,
          setups: useSetupPayoffStore.getState().setups,
          payoffs: useSetupPayoffStore.getState().payoffs
        };
        
        await setDoc(doc(db, "projects", firebaseUser.uid), data);
        useSettingsStore.setState({ cloudSyncStatus: 'synced' });
        alert("Project saved successfully!");
      } catch (err) {
        console.error("Save error", err);
        useSettingsStore.setState({ cloudSyncStatus: 'error' });
        alert("Failed to save project.");
      }
    };

    const loadFromFirestore = async () => {
      const { firebaseUser } = useAuthStore.getState();
      if (!firebaseUser) {
        alert("Please sign in to load from cloud.");
        return;
      }
      
      try {
        const docRef = doc(db, "projects", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
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
          if (data.setups) useSetupPayoffStore.setState({ setups: data.setups });
          if (data.payoffs) useSetupPayoffStore.setState({ payoffs: data.payoffs });
          alert("Project loaded successfully!");
        } else {
          alert("No saved project found.");
        }
      } catch (err) {
        console.error("Load error", err);
        alert("Failed to load project.");
      }
    };

    useSettingsStore.setState({
      saveProject: saveToFirestore,
      syncToCloud: saveToFirestore,
      loadProject: loadFromFirestore
    });
  }, [
    project, characters, relationships, plotThreads, convergenceEvents, 
    scenes, timelineEvents, canonFacts, violations, structureMilestones
  ]);


  

  useEffect(() => {
    useAuthStore.getState().initAuth();

  }, []);



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
        if (data.structureMilestones) if (data.structureMilestones) setStructureMilestones(data.structureMilestones);
        if (data.structureFramework) setStructureFramework(data.structureFramework);
        if (data.proposals) setProposals(data.proposals);
        if (data.version) {
          NarrativeSyncService.getInstance().setClientVersion(data.version);
        }
        if (data.setups || data.payoffs) {
          useSetupPayoffStore.getState().setInitialState(data.setups || [], data.payoffs || []);
        }
      })
      .catch(err => {
        console.warn('Backend endpoint unreachable, running in client memory mode:', err);
      });
  }, []);

  // Sync state changes back to backend via NarrativeSyncService
  const syncStateToBackend = (updatedState: any, actionSummary?: string) => {
    const currentSetupState = useSetupPayoffStore.getState();
    const payload = {
      setups: currentSetupState.setups,
      payoffs: currentSetupState.payoffs,
      ...updatedState
    };

    let auditEntry;
    if (actionSummary) {
      auditEntry = useAuditTrailStore.getState().addAuditLog({
        transactionId: `tx_${Date.now()}`,
        actionType: 'STATE_SYNC',
        summary: actionSummary
      });
    }

    NarrativeSyncService.getInstance().queueStateSync(payload, auditEntry);
  };

  // State restoration handler for rollback
  const handleApplyRestoredState = (restoredState: Record<string, any>) => {
    if (restoredState.project) setProject(restoredState.project);
    if (restoredState.characters) setCharacters(restoredState.characters);
    if (restoredState.relationships) setRelationships(restoredState.relationships);
    if (restoredState.plotThreads) setPlotThreads(restoredState.plotThreads);
    if (restoredState.convergenceEvents) setConvergenceEvents(restoredState.convergenceEvents);
    if (restoredState.scenes) setScenes(restoredState.scenes);
    if (restoredState.timelineEvents) setTimelineEvents(restoredState.timelineEvents);
    if (restoredState.canonFacts) setCanonFacts(restoredState.canonFacts);
    if (restoredState.violations) setViolations(restoredState.violations);
    if (restoredState.structureMilestones) setStructureMilestones(restoredState.structureMilestones);
    if (restoredState.structureFramework) setStructureFramework(restoredState.structureFramework);
    if (restoredState.setups || restoredState.payoffs) {
      useSetupPayoffStore.getState().setInitialState(restoredState.setups || [], restoredState.payoffs || []);
    }
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

  const handleUpdatePlotThread = (updatedThread: PlotThread) => {
    const updated = plotThreads.map(t => t.id === updatedThread.id ? updatedThread : t);
    setPlotThreads(updated);
    syncStateToBackend({ plotThreads: updated }, `Evolved Plot Thread: ${updatedThread.name}`);
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
        setActiveWorkspace('WRITING');
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
        setActiveWorkspace('CONTINUITY');
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
    <>
      <LiveVoiceChat />
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header & Transport Bar */}
      <HeaderTransport user={user}
        project={project}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        continuityScore={project.continuityScore}
        canonCount={canonFacts.length}
        violationCount={violations.filter(v => !v.resolved).length}
        aiStatus={isAiLoading ? 'PROPOSING' : 'READY'}
        onRunAudit={handleRunAudit}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenKeepWorkspace={() => setIsKeepOpen(true)}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        onOpenTestHarness={() => setIsTestHarnessOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onToggleNavigator={() => setIsMobileNavOpen(prev => !prev)}
        scenes={scenes}
        proposals={proposals}
        scene={selectedScene || scenes[0]}
        characters={characters}
        plotThreads={plotThreads}
        canonFacts={canonFacts}
        setups={useSetupPayoffStore.getState().setups}
        payoffs={useSetupPayoffStore.getState().payoffs}
        selectedObject={selectedObject}
        onClearSelection={() => setSelectedObject(null)}
        onSelectCharacter={(id) => setSelectedCharId(id)}
      />

      {/* Main Workspace Grid managed by DockManager */}
      <DockManager
        leftPanel={
          <NarrativeNavigator
            characters={characters}
            scenes={scenes}
            plotThreads={plotThreads}
            canonFacts={canonFacts}
            timelineEvents={timelineEvents}
            relationships={relationships}
            selectedObjectId={selectedObject?.id}
            onSelectObject={(type, id, data) => {
              setSelectedObject({ type, id, data });
              if (type === 'character') {
                setSelectedCharId(id);
                setActiveWorkspace('CHARACTER');
              }
              if (type === 'scene') {
                setSelectedSceneId(id);
                setActiveWorkspace('WRITING_STUDIO');
              }
              if (type === 'plot_thread') {
                setActiveWorkspace('PLANNING');
              }
              if (type === 'canon_fact') {
                setActiveWorkspace('WORLDBUILDING');
              }
            }}
            onNewObject={(type) => {
              if (type === 'character') handleQuickAddCharacter();
              if (type === 'scene') handleQuickAddScene();
              if (type === 'canon_fact') handleAddFact('New story lore principle recorded.', 'Lore');
            }}
          />
        }
        centerCanvas={
          <WorkspaceCanvas>
            {/* WRITING WORKSPACE */}
            {activeWorkspace === 'WRITING' && (
              <div className="space-y-4">
                <SceneEditorWorkstation
                  scene={selectedScene}
                  characters={characters}
                  proposals={proposals}
                  relationships={relationships}
                  plotThreads={plotThreads}
                  canonFacts={canonFacts}
                  scenes={scenes}
                  timelineEvents={timelineEvents}
                  convergenceEvents={convergenceEvents}
                  onSaveScene={handleSaveScene}
                  onApproveProposal={handleApproveProposal}
                  onOpenAiProposeModal={() => setIsAiDrawerOpen(true)}
                  onOpenWritingStudio={(sc) => {
                    useWritingStudioStore.getState().convertSceneToStudio(sc);
                    setActiveWorkspace('WRITING_STUDIO');
                  }}
                />
                <SceneBoard
                  scenes={scenes}
                  characters={characters}
                  selectedSceneId={selectedSceneId}
                  onSelectScene={(id) => {
                    setSelectedSceneId(id);
                    const sc = scenes.find(s => s.id === id);
                    if (sc) setSelectedObject({ type: 'scene', id, data: sc });
                  }}
                  onNewScene={(padIdx) => handleQuickAddScene(padIdx)}
                />
              </div>
            )}

            {/* DEDICATED WRITING STUDIO WORKSTATION */}
            {activeWorkspace === 'WRITING_STUDIO' && (
              <div className="h-full min-h-[82vh]">
                <WritingStudioWindow
                  characters={characters}
                  plotThreads={plotThreads}
                  locations={[]}
                  scenes={scenes}
                  onCloseWindow={() => setActiveWorkspace('WRITING')}
                />
              </div>
            )}

            {/* PLANNING WORKSPACE */}
            {activeWorkspace === 'PLANNING' && (
              <div className="space-y-4">
                <PlotEvolutionWorkstation
                  plotThreads={plotThreads}
                  scenes={scenes}
                  characters={characters}
                  canonFacts={canonFacts}
                  timelineEvents={timelineEvents}
                  setups={useSetupPayoffStore.getState().setups}
                  payoffs={useSetupPayoffStore.getState().payoffs}
                  convergenceEvents={convergenceEvents}
                  onUpdatePlotThread={handleUpdatePlotThread}
                  onAddScene={(newScene) => {
                    const newScenes = [newScene, ...scenes];
                    setScenes(newScenes);
                    syncStateToBackend({ scenes: newScenes }, `Created Scene: ${newScene.title}`);
                  }}
                  onAddTimelineEvent={(evt) => {
                    const newEvts = [...timelineEvents, evt];
                    setTimelineEvents(newEvts);
                    syncStateToBackend({ timelineEvents: newEvts });
                  }}
                />
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
                <StructureIntelligence
                  structureMilestones={structureMilestones}
                  activeFramework={structureFramework}
                  onUpdateStructure={handleUpdateStructure}
                />
                <SetupPayoffTracker
                  plotThreads={plotThreads}
                  scenes={scenes}
                  characters={characters}
                  canonFacts={canonFacts}
                  currentChapter={23}
                />
              </div>
            )}

            {/* CONTINUITY WORKSPACE */}
            {activeWorkspace === 'CONTINUITY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
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
                  <div className="xl:col-span-6 space-y-4">
                    <CanonMemoryVault
                      canonFacts={canonFacts}
                      onAddFact={handleAddFact}
                    />
                  </div>
                </div>
                <TimelineObservatory
                  events={timelineEvents}
                  characters={characters}
                  onUpdateEvents={handleUpdateTimelineEvents}
                />
              </div>
            )}

            {/* WORLDBUILDING WORKSPACE */}
            {activeWorkspace === 'WORLDBUILDING' && (
              <div className="space-y-4">
                <IntersectionMatrix characters={characters} />
                <CanonMemoryVault
                  canonFacts={canonFacts}
                  onAddFact={handleAddFact}
                />
                <ConvergenceMap
                  plotThreads={plotThreads}
                  convergenceEvents={convergenceEvents}
                  onTriggerBackwardPlan={handleRunAudit}
                />
              </div>
            )}

            {/* CHARACTER STUDIO WORKSPACE */}
            {activeWorkspace === 'CHARACTER' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                  <div className="xl:col-span-7 space-y-4">
                    <CharacterIntelligence
                      characters={characters}
                      selectedCharId={selectedCharId}
                      onSelectCharacter={(id) => {
                        setSelectedCharId(id);
                        const ch = characters.find(c => c.id === id);
                        if (ch) setSelectedObject({ type: 'character', id, data: ch });
                      }}
                      onUpdateCharacter={handleUpdateCharacter}
                      onAddCharacter={handleQuickAddCharacter}
                    />
                  </div>
                  <div className="xl:col-span-5 space-y-4">
                    <RelationshipWeb
                      characters={characters}
                      relationships={relationships}
                      selectedCharId={selectedCharId}
                      onSelectCharacter={setSelectedCharId}
                      onAddRelationship={(newRel) => setRelationships(prev => [...prev, { ...newRel, id: 'rel_' + Date.now() }])}
                      onUpdateRelationship={(updatedRel) => setRelationships(prev => prev.map(r => r.id === updatedRel.id ? updatedRel : r))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATION WORKSPACE */}
            {activeWorkspace === 'SIMULATION' && (
              <div className="space-y-4">
                <DynamicStateEnginePanel
                  characters={characters}
                  scenes={scenes}
                  plotThreads={plotThreads}
                  canonFacts={canonFacts}
                  activeSceneId={selectedSceneId || undefined}
                  onCommitSimulationState={handleCommitSimulationState}
                />
                <OffscreenSimulator characters={characters} />
                <ConsequenceEngine characters={characters} />
              </div>
            )}

            {/* CUSTOM WORKSPACE */}
            {activeWorkspace === 'CUSTOM' && (
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
                <SceneBoard
                  scenes={scenes}
                  characters={characters}
                  selectedSceneId={selectedSceneId}
                  onSelectScene={(id) => setSelectedSceneId(id)}
                  onNewScene={(padIdx) => handleQuickAddScene(padIdx)}
                />
              </div>
            )}
          </WorkspaceCanvas>
        }
      />

      {/* Persistent Telemetry Status Dock */}
      <StatusDock
        characterCount={characters.length}
        sceneCount={scenes.length}
        threadCount={plotThreads.length}
        canonCount={canonFacts.length}
        memoryCount={characters.reduce((acc, c) => acc + (c.memories?.length || 0), 0)}
        warningCount={violations.filter(v => !v.resolved).length}
        simulationStatus={isAiLoading ? 'Simulating' : 'Ready'}
        keepConnected={true}
        onOpenTool={(tool) => setActiveWorkspace(tool as WorkspaceMode)}
        onOpenKeepWorkspace={() => setIsKeepOpen(true)}
        onRunAudit={handleRunAudit}
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

      
      <ChatbotDrawer 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        projectState={{ project, characters, relationships, plotThreads, scenes, timelineEvents, canonFacts, violations, structureMilestones }}
      />

      {/* Guided Tutorial Overlay with Instruction Bubbles */}
      <GuidedTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onRunAudit={handleRunAudit}
      />

      {/* Google Keep Workspace Drawer & Modal */}
      <GoogleKeepWorkspace
        isOpen={isKeepOpen}
        onClose={() => setIsKeepOpen(false)}
        setups={useSetupPayoffStore.getState().setups}
        payoffs={useSetupPayoffStore.getState().payoffs}
        canonFacts={canonFacts}
        plotThreads={plotThreads}
        scenes={scenes}
      />

      {/* Mobile Navigator Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex md:hidden">
          <div className="w-80 max-w-[85vw] bg-[#0F172A] p-4 h-full border-r border-[#1E293B] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1E293B]">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Narrative Navigator</span>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-[#1E293B] rounded font-mono"
              >
                Close
              </button>
            </div>
            <NarrativeNavigator
              characters={characters}
              scenes={scenes}
              plotThreads={plotThreads}
              canonFacts={canonFacts}
              timelineEvents={timelineEvents}
              relationships={relationships}
              selectedObjectId={selectedObject?.id}
              onSelectObject={(type, id, data) => {
                setSelectedObject({ type, id, data });
                if (type === 'character') {
                  setSelectedCharId(id);
                  setActiveWorkspace('CHARACTER');
                }
                if (type === 'scene') {
                  setSelectedSceneId(id);
                  setActiveWorkspace('WRITING_STUDIO');
                }
                if (type === 'plot_thread') setActiveWorkspace('PLANNING');
                if (type === 'canon_fact') setActiveWorkspace('WORLDBUILDING');
                setIsMobileNavOpen(false);
              }}
              onNewObject={(type) => {
                if (type === 'character') handleQuickAddCharacter();
                if (type === 'scene') handleQuickAddScene();
                if (type === 'canon_fact') handleAddFact('New story lore principle recorded.', 'Lore');
                setIsMobileNavOpen(false);
              }}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
        </div>
      )}

      

      {/* Automated Diagnostics & Testing Harness Console */}
      <TestingHarnessModal
        isOpen={isTestHarnessOpen}
        onClose={() => setIsTestHarnessOpen(false)}
        scenes={scenes}
        characters={characters}
        plotThreads={plotThreads}
        canonFacts={canonFacts}
        timelineEvents={timelineEvents}
        setups={useSetupPayoffStore.getState().setups}
        payoffs={useSetupPayoffStore.getState().payoffs}
      />

      {/* Audit Trail & Sync Engine Drawer */}
      <AuditTrailDrawer
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        onApplyRestoredState={handleApplyRestoredState}
        currentStateSnapshot={{
          project,
          characters,
          relationships,
          plotThreads,
          convergenceEvents,
          scenes,
          timelineEvents,
          canonFacts,
          violations,
          structureMilestones,
          structureFramework
        }}
      />
    </div>
    </>
  );
}
