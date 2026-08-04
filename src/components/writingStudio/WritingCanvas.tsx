import React, { useRef } from 'react';
import { WritingStudioDoc, WritingBlock, WritingBlockType } from '../../types/writingStudio';
import { WRITING_MEDIUM_PRESETS } from '../../data/writingMediumPresets';
import { NarrativeDropZone } from '../workspace/NarrativeDropZone';
import { NarrativeDropContext, NarrativeDragPayload } from '../../interactions/narrativeDragTypes';
import { Character, PlotThread } from '../../types';
import {
  GripVertical,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  UserCheck,
  Type,
  FileText
} from 'lucide-react';

interface WritingCanvasProps {
  doc: WritingStudioDoc;
  selectedBlockId: string | null;
  viewMode: 'pages' | 'continuous';
  fontSize: number;
  characters?: Character[];
  locations?: Location[];
  plotThreads?: PlotThread[];
  onSelectBlock: (id: string) => void;
  onAddBlock: (type?: WritingBlockType, afterBlockId?: string) => void;
  onUpdateBlock: (id: string, updates: Partial<WritingBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onRunAiRewriteBlock?: (block: WritingBlock) => void;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({
  doc,
  selectedBlockId,
  viewMode,
  fontSize,
  characters = [],
  locations = [],
  plotThreads = [],
  onSelectBlock,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onRunAiRewriteBlock
}) => {
  const preset = WRITING_MEDIUM_PRESETS[doc.medium];
  const containerRef = useRef<HTMLDivElement>(null);

  // Group blocks into pages if viewMode is 'pages'
  // ~8-10 screenplay blocks or ~250 words per page
  const pageChunks: WritingBlock[][] = [];
  if (viewMode === 'pages' && preset.isPageBased) {
    let currentPage: WritingBlock[] = [];
    let wordCounter = 0;

    doc.blocks.forEach((block) => {
      const words = block.text ? block.text.trim().split(/\s+/).filter(Boolean).length : 0;
      if (wordCounter + words > 220 && currentPage.length > 0) {
        pageChunks.push(currentPage);
        currentPage = [block];
        wordCounter = words;
      } else {
        currentPage.push(block);
        wordCounter += words;
      }
    });
    if (currentPage.length > 0) pageChunks.push(currentPage);
  } else {
    pageChunks.push(doc.blocks);
  }

  // Keyboard navigation & auto-tabbing
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    block: WritingBlock,
    idx: number
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle through block types
      const currentIdx = preset.blockTypes.findIndex((bt) => bt.type === block.type);
      const nextTypeIdx = (currentIdx + 1) % preset.blockTypes.length;
      const nextType = preset.blockTypes[nextTypeIdx].type;
      onUpdateBlock(block.id, { type: nextType });
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Find autoNextType for current block
      const currentPresetType = preset.blockTypes.find((bt) => bt.type === block.type);
      const autoNext = currentPresetType?.autoNextType || preset.blockTypes[0].type;
      onAddBlock(autoNext, block.id);
    }
  };

  const handleDropOnCanvasBlock = (blockId: string, payload: NarrativeDragPayload) => {
    if (payload.objectType === 'character') {
      const char = characters.find((c) => c.id === payload.objectId);
      if (char) {
        onUpdateBlock(blockId, {
          characterId: char.id,
          text: char.name.toUpperCase()
        });
      }
    } else if (payload.objectType === 'location') {
      onUpdateBlock(blockId, {
        text: `INT. ${payload.objectId.toUpperCase()} - NIGHT`
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#090D16] overflow-y-auto p-4 md:p-8 flex flex-col items-center custom-scrollbar select-text"
      style={{ fontFamily: preset.defaultFontFamily, fontSize: `${fontSize}px` }}
    >
      {pageChunks.map((pageBlocks, pageIdx) => (
        <div
          key={`page_${pageIdx}`}
          className={`w-full max-w-3xl transition-all duration-300 relative ${
            viewMode === 'pages' && preset.isPageBased
              ? 'bg-[#101728] border border-[#1E293B] rounded-2xl shadow-2xl p-8 md:p-14 mb-8 min-h-[1050px]'
              : 'bg-[#0E1526] border border-[#1E293B] rounded-xl p-6 md:p-10 mb-6'
          }`}
        >
          {/* Page Header (if page mode) */}
          {viewMode === 'pages' && preset.isPageBased && (
            <div className="flex items-center justify-between border-b border-[#1E293B]/60 pb-4 mb-6 font-mono text-[11px] text-slate-500 uppercase tracking-widest select-none">
              <span>{doc.title || 'Untitled Script'}</span>
              <span>PAGE {pageIdx + 1}</span>
            </div>
          )}

          {/* Blocks */}
          <div className="space-y-2">
            {pageBlocks.map((block) => {
              const blockPreset = preset.blockTypes.find((bt) => bt.type === block.type) || preset.blockTypes[0];
              const isSelected = selectedBlockId === block.id;

              return (
                <NarrativeDropZone
                  key={block.id}
                  targetType="workspace"
                  targetId={`canvas_block_${block.id}`}
                  accepts={['character', 'location', 'plot_thread', 'setup']}
                  context={{ sourcePanel: 'writing_studio' }}
                  onCommitOperation={(_, payloadData) => { if (payloadData) handleDropOnCanvasBlock(block.id, payloadData); }}
                >
                  <div
                    onClick={() => onSelectBlock(block.id)}
                    className={`group relative rounded-xl p-2 transition-all border ${
                      isSelected
                        ? 'bg-[#162035] border-indigo-500/80 ring-2 ring-indigo-500/30'
                        : 'border-transparent hover:bg-[#141B2D]/50 hover:border-[#1E293B]'
                    }`}>
                      {/* Floating Block Controls Bar (When Selected) */}
                      {isSelected && (
                        <div className="absolute -top-4 right-3 z-10 flex items-center space-x-1 bg-[#0B1020] border border-indigo-500/60 rounded-lg p-1 shadow-xl font-mono text-[10px] animate-in fade-in duration-150">
                          {/* Type Switcher Selector */}
                          <select
                            value={block.type}
                            onChange={(e) =>
                              onUpdateBlock(block.id, {
                                type: e.target.value as WritingBlockType
                              })
                            }
                            className="bg-[#141B2D] text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-[#1E293B] focus:outline-none"
                          >
                            {preset.blockTypes.map((bt) => (
                              <option key={bt.type} value={bt.type}>
                                {bt.label}
                              </option>
                            ))}
                          </select>

                          {/* AI Rewrite Action */}
                          {onRunAiRewriteBlock && (
                            <button
                              onClick={() => onRunAiRewriteBlock(block)}
                              className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded font-semibold flex items-center space-x-1"
                              title="AI Format-Aware Rewrite"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>AI</span>
                            </button>
                          )}

                          {/* Add Block */}
                          <button
                            onClick={() => onAddBlock(preset.blockTypes[0].type, block.id)}
                            className="p-1 hover:bg-[#141B2D] text-slate-300 rounded"
                            title="Add Block Below"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Block */}
                          <button
                            onClick={() => onDeleteBlock(block.id)}
                            className="p-1 hover:bg-rose-950 text-rose-400 rounded"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Block Type Tag Badge */}
                      <div className="flex items-center justify-between mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] text-slate-500 uppercase select-none">
                        <span>{blockPreset.label}</span>
                        <span className="text-[9px] text-indigo-400/80">
                          {blockPreset.shortcut}
                        </span>
                      </div>

                      {/* Text Input Area */}
                      <textarea
                        value={block.text}
                        onChange={(e) =>
                          onUpdateBlock(block.id, { text: e.target.value })
                        }
                        onKeyDown={(e) => handleKeyDown(e, block, pageBlocks.indexOf(block))}
                        placeholder={blockPreset.placeholder}
                        rows={
                          block.type === 'action' || block.type === 'prose' || block.type === 'panel_description'
                            ? Math.max(2, Math.ceil(block.text.length / 70))
                            : 1
                        }
                        className={`w-full bg-transparent resize-none focus:outline-none placeholder-slate-600/70 ${blockPreset.className}`}
                      />
                    </div>
                </NarrativeDropZone>
              );
            })}
          </div>

          {/* Bottom Page Break Line */}
          {viewMode === 'pages' && preset.isPageBased && (
            <div className="mt-8 pt-4 border-t border-dashed border-[#1E293B] text-center text-[10px] font-mono text-slate-600 uppercase select-none">
              END OF PAGE {pageIdx + 1}
            </div>
          )}
        </div>
      ))}

      {/* Quick Add Block Button at bottom */}
      <button
        onClick={() => onAddBlock()}
        className="my-4 px-6 py-2.5 bg-[#101728] hover:bg-[#162035] border border-[#1E293B] hover:border-indigo-500/50 rounded-xl text-slate-300 hover:text-white font-mono text-xs flex items-center space-x-2 shadow-lg transition-all"
      >
        <Plus className="w-4 h-4 text-indigo-400" />
        <span>Add New {preset.blockTypes[0].label} Block</span>
      </button>
    </div>
  );
};
