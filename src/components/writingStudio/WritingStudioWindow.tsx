import React, { useState } from 'react';
import { useWritingStudioStore } from '../../stores/writingStudioStore';
import { useSetupPayoffStore } from '../../stores/setupPayoffStore';
import { FormatSelectorBar } from './FormatSelectorBar';
import { StructureNavigator } from './StructureNavigator';
import { WritingCanvas } from './WritingCanvas';
import { FormatInspector } from './FormatInspector';
import { MultiPassRevisionModal } from '../MultiPassRevisionModal';
import { GoogleDocsModal } from './GoogleDocsModal';
import { Character, PlotThread, Scene } from '../../types';
import { WritingStudioAiTool, WritingBlock } from '../../types/writingStudio';
import { Sparkles, ShieldAlert, X } from 'lucide-react';

interface WritingStudioWindowProps {
  characters?: Character[];
  plotThreads?: PlotThread[];
  locations?: string[];
  scenes?: Scene[];
  onSaveStudioDocToScene?: (docTitle: string, proseText: string) => void;
  onCloseWindow?: () => void;
}

export const WritingStudioWindow: React.FC<WritingStudioWindowProps> = ({
  characters = [],
  plotThreads = [],
  locations = [],
  scenes = [],
  onSaveStudioDocToScene,
  onCloseWindow
}) => {
  const {
    activeDoc,
    selectedBlockId,
    viewMode,
    dockingState,
    fontSize,
    activeAiTool,
    aiOutput,
    isAiGenerating,
    setMedium,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    selectBlock,
    setDocTitle,
    updateMetadata,
    setViewMode,
    setDockingState,
    setFontSize,
    setAiToolState
  } = useWritingStudioStore();

  const { setups } = useSetupPayoffStore();
  const [isMultiPassModalOpen, setIsMultiPassModalOpen] = useState(false);
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Tool Execution
  const handleRunAiTool = async (toolName: WritingStudioAiTool, extraPrompt?: string) => {
    setAiToolState(toolName, null, true);
    setErrorMessage(null);

    const fullManuscriptText = activeDoc.blocks.map((b) => b.text).join('\n');

    try {
      const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneTitle: `${activeDoc.title} [${toolName}]`,
          location: activeDoc.blocks[0]?.text || 'CITADEL COMMAND',
          characters: characters.map((c) => ({ name: c.name, goals: c.goals })),
          previousContext: fullManuscriptText,
          prompt: `[WRITING STUDIO MEDIUM TOOL: ${toolName}] Medium: ${activeDoc.medium}. ${
            extraPrompt ? `Extra Directive: ${extraPrompt}` : ''
          }. Re-format or generate structured text blocks adhering strictly to ${activeDoc.medium} industry rules.`
        })
      });

      const data = await response.json();
      if (data.prose) {
        setAiToolState(toolName, data.prose, false);
      } else {
        throw new Error(data.error || 'AI tool generation failed');
      }
    } catch (err: any) {
      console.warn('[Writing Studio AI] Fallback engine utilized due to rate limit/error:', err);
      setAiToolState(toolName, `[ERROR] AI Generation Failed: ${err.message}`, false);
    }
  };

  // Insert AI Output into Canvas as new blocks
  const handleApplyAiOutputToBlocks = (output: string) => {
    const lines = output.split('\n').filter((l) => l.trim().length > 0);
    lines.forEach((line) => {
      addBlock(undefined, undefined, line.trim());
    });
    setAiToolState(null, null, false);
  };

  return (
    <div
      className={`bg-[#0B1020] flex flex-col border border-[#1E293B] shadow-2xl overflow-hidden rounded-2xl transition-all duration-300 ${
        dockingState === 'full'
          ? 'w-full h-full min-h-[85vh]'
          : dockingState === 'dock_left'
          ? 'w-full md:w-2/3 h-full border-r-4 border-indigo-500'
          : dockingState === 'dock_right'
          ? 'w-full md:w-2/3 h-full border-l-4 border-indigo-500'
          : 'w-full h-[80vh]'
      }`}
    >
      {/* Format Selector Bar Top */}
      <FormatSelectorBar
        doc={activeDoc}
        viewMode={viewMode}
        dockingState={dockingState}
        onSelectMedium={setMedium}
        onChangeTitle={setDocTitle}
        onToggleViewMode={setViewMode}
        onChangeDocking={setDockingState}
        onOpenAiRevision={() => setIsMultiPassModalOpen(true)}
        onOpenGoogleDocs={() => setIsGoogleDocsModalOpen(true)}
      />

      {/* Main Workstation 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Structure Navigator */}
        <StructureNavigator
          doc={activeDoc}
          selectedBlockId={selectedBlockId}
          characters={characters}
          plotThreads={plotThreads}
          setups={setups}
          onSelectBlock={selectBlock}
          onAddBlock={addBlock}
          onDeleteBlock={deleteBlock}
          onReorderBlocks={reorderBlocks}
          onUpdateBlock={updateBlock}
        />

        {/* Central Writing Canvas */}
        <WritingCanvas
          doc={activeDoc}
          selectedBlockId={selectedBlockId}
          viewMode={viewMode}
          fontSize={fontSize}
          characters={characters}
          locations={locations}
          plotThreads={plotThreads}
          onSelectBlock={selectBlock}
          onAddBlock={addBlock}
          onUpdateBlock={updateBlock}
          onDeleteBlock={deleteBlock}
          onRunAiRewriteBlock={(block) =>
            handleRunAiTool('format_aware_rewrite', `Target block: "${block.text}"`)
          }
        />

        {/* Right Format Inspector */}
        <FormatInspector
          doc={activeDoc}
          setups={setups}
          isAiGenerating={isAiGenerating}
          aiOutput={aiOutput}
          onUpdateMetadata={updateMetadata}
          onRunAiTool={handleRunAiTool}
          onApplyAiOutputToBlocks={handleApplyAiOutputToBlocks}
        />
      </div>

      {/* Multi-Pass Revision Pipeline Modal Integration */}
      {isMultiPassModalOpen && (
        <MultiPassRevisionModal
          isOpen={isMultiPassModalOpen}
          onClose={() => setIsMultiPassModalOpen(false)}
          scene={{
            id: activeDoc.id,
            title: activeDoc.title || 'Studio Manuscript',
            prose: activeDoc.blocks.map((b) => b.text).join('\n\n'),
            location: activeDoc.blocks[0]?.text || 'CITADEL COMMAND',
            act: 1,
            chapter: 1,
            order: 1,
            participantIds: characters.map((c) => c.id),
            status: 'In Progress',
            wordCount: activeDoc.blocks.reduce((acc, b) => acc + (b.text ? b.text.split(/\s+/).filter(Boolean).length : 0), 0),
            targetWordCount: activeDoc.metadata.targetWordCount || 1000,
            povCharacterId: characters[0]?.id || '',
            emotionalTone: 'Tense',
            timelinePhase: 'Present'
          }}
          characters={characters}
          plotThreads={plotThreads}
          canonFacts={[]}
          timelineEvents={[]}
          setups={[]}
          payoffs={[]}
          onApplyRevisedProse={(revisedProse) => {
            const paragraphs = revisedProse.split('\n\n').filter((p) => p.trim().length > 0);
            paragraphs.forEach((p, idx) => {
              if (activeDoc.blocks[idx]) {
                updateBlock(activeDoc.blocks[idx].id, { text: p.trim() });
              } else {
                addBlock(undefined, undefined, p.trim());
              }
            });
            setIsMultiPassModalOpen(false);
          }}
        />
      )}

      {/* Google Docs Integration Modal */}
      {isGoogleDocsModalOpen && (
        <GoogleDocsModal
          isOpen={isGoogleDocsModalOpen}
          onClose={() => setIsGoogleDocsModalOpen(false)}
          documentTitle={activeDoc.title || 'Studio Manuscript'}
          documentContent={activeDoc.blocks.map((b) => b.text).join('\n\n')}
          onImportContent={(importedProse) => {
            const paragraphs = importedProse.split('\n\n').filter((p) => p.trim().length > 0);
            
            // Clear existing blocks except the first one to avoid empty states
            activeDoc.blocks.slice(1).forEach(b => deleteBlock(b.id));
            
            if (paragraphs.length === 0) {
              if (activeDoc.blocks[0]) updateBlock(activeDoc.blocks[0].id, { text: '' });
            } else {
              paragraphs.forEach((p, idx) => {
                if (idx === 0 && activeDoc.blocks[0]) {
                  updateBlock(activeDoc.blocks[0].id, { text: p.trim() });
                } else {
                  addBlock(undefined, undefined, p.trim());
                }
              });
            }
            setIsGoogleDocsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
