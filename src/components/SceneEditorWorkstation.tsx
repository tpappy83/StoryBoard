import React, { useState, useEffect } from 'react';
import { Scene, Character, SceneProposal, Relationship, PlotThread, CanonFact, TimelineEvent, ConvergenceEvent } from '../types';
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Save, Layers, Clock, ShieldCheck, UserCheck, RefreshCw, Clapperboard } from 'lucide-react';
import { NarrativeDropZone } from './workspace/NarrativeDropZone';
import { NarrativeDropContext } from '../interactions/narrativeDragTypes';
import { MultiPassRevisionModal } from './MultiPassRevisionModal';
import { useSetupPayoffStore } from '../stores/setupPayoffStore';
import { ThreeDotActionsBar } from './ThreeDotActionsBar';

interface SceneEditorWorkstationProps {
  scene: Scene | null;
  characters: Character[];
  proposals: SceneProposal[];
  relationships?: Relationship[];
  plotThreads?: PlotThread[];
  canonFacts?: CanonFact[];
  scenes?: Scene[];
  timelineEvents?: TimelineEvent[];
  convergenceEvents?: ConvergenceEvent[];
  onSaveScene: (updatedScene: Scene) => void;
  onApproveProposal: (proposalId: string) => void;
  onOpenAiProposeModal: () => void;
  onOpenWritingStudio?: (scene: Scene) => void;
}

export const SceneEditorWorkstation: React.FC<SceneEditorWorkstationProps> = ({
  scene,
  characters,
  proposals,
  relationships = [],
  plotThreads = [],
  canonFacts = [],
  scenes = [],
  timelineEvents = [],
  convergenceEvents = [],
  onSaveScene,
  onApproveProposal,
  onOpenAiProposeModal,
  onOpenWritingStudio
}) => {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedProse, setEditedProse] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isMultiPassModalOpen, setIsMultiPassModalOpen] = useState(false);

  const { setups, payoffs } = useSetupPayoffStore();

  useEffect(() => {
    if (scene) {
      setEditedTitle(scene.title);
      setEditedProse(scene.prose);
      setEditedLocation(scene.location);
    }
  }, [scene]);

  const activeProposal = proposals.find(p => p.sceneId === scene?.id || p.status === 'Pending');

  const handleSave = () => {
    if (!scene) return;
    const updated: Scene = {
      ...scene,
      title: editedTitle,
      prose: editedProse,
      location: editedLocation,
      wordCount: editedProse.trim().split(/\s+/).filter(Boolean).length
    };
    onSaveScene(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!scene) {
    return (
      <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-8 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
        <h3 className="text-base font-bold text-slate-200">NO SCENE LOADED IN WORKSTATION</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select a scene pad from the MPC Sequencer or Project Browser, or generate a new AI proposal to begin writing.
        </p>
        <button
          onClick={onOpenAiProposeModal}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs rounded-lg shadow-lg"
        >
          ⚡ GENERATE AI SCENE PROPOSAL
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] border border-[#153B5C] rounded-2xl p-4 shadow-2xl space-y-4 font-mono select-none">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#153B5C] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-[#0A2A43] text-[#F2C94C] p-2 rounded-lg border border-[#153B5C]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono bg-[#0A2A43] text-[#F2C94C] px-2 py-0.5 rounded border border-[#153B5C] font-bold">
                PAD #{scene.padIndex}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                scene.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                scene.status === 'Violation' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                'bg-[#0A2A43] text-[#C4C4C4] border border-[#153B5C]'
              }`}>
                {scene.status}
              </span>
            </div>
            <input
              type="text"
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
              className="text-base font-bold text-white bg-transparent focus:outline-none focus:bg-[#0A2A43] px-1.5 py-0.5 rounded border border-transparent focus:border-[#153B5C] mt-1 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className={`btn-workstation flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0A2A43] hover:bg-[#0E3859] text-white border border-[#153B5C] hover:border-[#F2C94C]'
            }`}
          >
            <Save className="w-4 h-4 text-[#F2C94C]" />
            <span>{isSaved ? 'SAVED TO CANON' : 'SAVE CHANGES'}</span>
          </button>

          {onOpenWritingStudio && scene && (
            <button
              onClick={() => onOpenWritingStudio(scene)}
              className="btn-workstation flex items-center space-x-1.5 bg-[#0A2A43] hover:bg-[#0E3859] text-white border border-[#153B5C] hover:border-[#F2C94C] px-3 py-1.5 rounded-md text-xs font-bold shadow-md transition-all"
              title="Open scene in Final Draft / Scrivener Writing Studio"
            >
              <Clapperboard className="w-4 h-4 text-[#F2C94C]" />
              <span className="hidden md:inline">STUDIO FORMAT</span>
            </button>
          )}

          <button
            onClick={onOpenAiProposeModal}
            className="btn-workstation flex items-center space-x-1.5 bg-[#F2C94C] hover:bg-amber-400 text-[#000000] px-3 py-1.5 rounded-md text-xs font-bold shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#000000]" />
            <span className="hidden sm:inline">AI REVISION</span>
          </button>

          <button
            onClick={() => setIsMultiPassModalOpen(true)}
            className="btn-workstation flex items-center space-x-1.5 bg-[#0A2A43] hover:bg-[#0E3859] text-[#F2C94C] border border-[#153B5C] hover:border-[#F2C94C] px-3 py-1.5 rounded-md text-xs font-bold shadow-md"
            title="Open 4-Pass Multi-Pass Narrative Revision Engine"
          >
            <Layers className="w-4 h-4 text-[#F2C94C]" />
            <span className="hidden lg:inline">4-PASS ENGINE</span>
          </button>

          {/* THREE-DOT ACTIONS MENU */}
          <ThreeDotActionsBar
            scene={scene}
            onSaveScene={handleSave}
            onOpenWritingStudio={onOpenWritingStudio ? () => onOpenWritingStudio(scene) : undefined}
            onRunMultiPassRevision={() => setIsMultiPassModalOpen(true)}
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Prose Editor */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              LOCATION:
              <input
                type="text"
                value={editedLocation}
                onChange={e => setEditedLocation(e.target.value)}
                className="bg-[#0B1020] text-slate-200 px-2 py-0.5 rounded border border-[#1A2338] text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </span>
            <span>WORD COUNT: {editedProse.trim().split(/\s+/).filter(Boolean).length} WORDS</span>
          </div>

          {scene && (
            <NarrativeDropZone
              targetType="scene"
              targetId={scene.id}
              accepts={['character', 'canon_fact', 'plot_thread', 'location']}
              label={`into Scene "${scene.title}"`}
              context={{
                characters,
                scenes: scenes.length ? scenes : [scene],
                relationships,
                plotThreads,
                canonFacts,
                timelineEvents,
                convergenceEvents
              }}
              onCommitOperation={(result, payloadData) => {
                if (result.operationType === 'linkCharacterToScene' && payloadData?.characterId) {
                  const currentParticipants = scene.participantIds || [];
                  if (!currentParticipants.includes(payloadData.characterId)) {
                    onSaveScene({
                      ...scene,
                      participantIds: [...currentParticipants, payloadData.characterId]
                    });
                  }
                } else if (result.operationType === 'linkCanonToScene' && payloadData?.factText) {
                  setEditedProse((prev) => `${prev}\n\n[Canon Lore Note: ${payloadData.factText}]`);
                } else if (result.operationType === 'attachThreadToScene' && payloadData?.threadTitle) {
                  setEditedProse((prev) => `${prev}\n\n[Plot Thread Beat: ${payloadData.threadTitle}]`);
                } else if (result.operationType === 'updateSceneLocation' && payloadData?.location) {
                  setEditedLocation(payloadData.location);
                }
              }}
            >
              <textarea
                value={editedProse}
                onChange={e => setEditedProse(e.target.value)}
                rows={12}
                className="w-full bg-[#0B1020] text-slate-200 p-4 rounded-xl border border-[#1A2338] text-sm leading-relaxed focus:outline-none focus:border-indigo-500/80 font-serif resize-y"
                placeholder="Write or edit scene prose here... (Drag and drop characters, canon facts, or plot threads directly onto this canvas)"
              />
            </NarrativeDropZone>
          )}

          {/* Character Participants Tags */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">PARTICIPANTS:</span>
            {scene.participantIds.map(charId => {
              const char = characters.find(c => c.id === charId);
              return (
                <span key={charId} className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-mono">
                  {char?.name || charId}
                </span>
              );
            })}
          </div>
        </div>

        {/* AI Proposal & Validation Checklist Drawer */}
        <div className="bg-[#0B1020] rounded-xl border border-[#1A2338] p-4 space-y-4">
          <div className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-[#1A2338] pb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              AI PROPOSAL & VALIDATION
            </span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
              DETERMINISTIC CHECK
            </span>
          </div>

          {activeProposal ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#141B2D] border border-indigo-900/60">
                <div className="font-bold text-indigo-200 mb-1">{activeProposal.title}</div>
                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                  {activeProposal.prose}
                </p>
              </div>

              {/* Validation Checklist */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">CONTINUITY VALIDATION CHECKS</div>
                {activeProposal.validationChecks.map((val, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#141B2D] border border-slate-800 flex items-start space-x-2 text-[11px]">
                    {val.status === 'PASS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : val.status === 'WARN' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-200">{val.check}</div>
                      <div className="text-slate-400 text-[10px]">{val.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proposed Character State Ledger */}
              {activeProposal.proposedStateChanges.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">PROPOSED STATE LEDGER</div>
                  {activeProposal.proposedStateChanges.map((sc, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#141B2D] border border-indigo-900/40 text-[11px] text-slate-300 font-mono">
                      <span className="font-bold text-indigo-300">{sc.charName}</span>: {sc.field} ({sc.oldValue} → <strong className="text-emerald-400">{sc.newValue}</strong>)
                    </div>
                  ))}
                </div>
              )}

              {/* Approve & Commit Button */}
              {activeProposal.status === 'Pending' && (
                <button
                  onClick={() => onApproveProposal(activeProposal.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPROVE & COMMIT TO CANON MEMORY</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-8 text-center space-y-2">
              <p>No pending AI proposal for this scene.</p>
              <button
                onClick={onOpenAiProposeModal}
                className="text-indigo-400 underline hover:text-indigo-300 font-medium text-xs"
              >
                Click to propose AI scene draft
              </button>
            </div>
          )}
        </div>
      </div>

      <MultiPassRevisionModal
        isOpen={isMultiPassModalOpen}
        onClose={() => setIsMultiPassModalOpen(false)}
        scene={scene}
        characters={characters}
        plotThreads={plotThreads}
        canonFacts={canonFacts}
        timelineEvents={timelineEvents}
        setups={setups}
        payoffs={payoffs}
        onApplyRevisedProse={(revisedProse) => {
          setEditedProse(revisedProse);
          if (scene) {
            onSaveScene({
              ...scene,
              title: editedTitle || scene.title,
              prose: revisedProse,
              location: editedLocation || scene.location,
              wordCount: revisedProse.trim().split(/\s+/).filter(Boolean).length
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
          }
        }}
      />
    </div>
  );
};
