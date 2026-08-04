import React, { useState } from 'react';
import { WritingStudioDoc, WritingBlock, WritingMedium } from '../../types/writingStudio';
import { WRITING_MEDIUM_PRESETS } from '../../data/writingMediumPresets';
import { NarrativeDropZone } from '../workspace/NarrativeDropZone';
import { NarrativeDropContext, NarrativeDragPayload } from '../../interactions/narrativeDragTypes';
import { Character, PlotThread, SetupPayoffEvent } from '../../types';
import {
  ListTree,
  Search,
  Plus,
  GripVertical,
  ChevronRight,
  BookOpen,
  Clapperboard,
  Users,
  MapPin,
  GitBranch,
  Target,
  Sparkles,
  Trash2
} from 'lucide-react';

interface StructureNavigatorProps {
  doc: WritingStudioDoc;
  selectedBlockId: string | null;
  characters?: Character[];
  plotThreads?: PlotThread[];
  setups?: SetupPayoffEvent[];
  onSelectBlock: (id: string) => void;
  onAddBlock: (type?: any) => void;
  onDeleteBlock: (id: string) => void;
  onReorderBlocks: (fromIdx: number, toIdx: number) => void;
  onUpdateBlock: (id: string, updates: Partial<WritingBlock>) => void;
}

export const StructureNavigator: React.FC<StructureNavigatorProps> = ({
  doc,
  selectedBlockId,
  characters = [],
  plotThreads = [],
  setups = [],
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onReorderBlocks,
  onUpdateBlock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const preset = WRITING_MEDIUM_PRESETS[doc.medium];

  // Filter structural items based on medium hierarchy
  // Screenplay -> Sluglines, Characters, Transitions
  // Novel -> Chapter Titles, Section Subheads
  // Magazine -> Headlines, Ledes, Nut-grafs, Sidebars
  // Stage Play -> Acts, Scenes
  // Comic -> Pages, Panels
  const isStructuralBlock = (b: WritingBlock) => {
    switch (doc.medium) {
      case 'screenplay':
        return b.type === 'slugline' || b.type === 'character' || b.type === 'transition';
      case 'novel':
      case 'short_story':
        return b.type === 'chapter_title' || b.type === 'section_subhead' || b.type === 'pov_break';
      case 'magazine':
        return b.type === 'headline' || b.type === 'deck' || b.type === 'lede' || b.type === 'sidebar';
      case 'stage_play':
        return b.type === 'act_heading' || b.type === 'scene_heading';
      case 'comic_script':
        return b.type === 'page_heading' || b.type === 'panel_heading';
      default:
        return b.type === 'heading' || b.type === 'subheading';
    }
  };

  const structuralBlocks = doc.blocks.filter((b) => {
    if (searchQuery.trim().length > 0) {
      return b.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return isStructuralBlock(b);
  });

  const toggleCollapse = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Semantic drop handler for Structure Navigator
  const handleDropOnBlock = (blockId: string, payload: NarrativeDragPayload) => {
    if (payload.objectType === 'character') {
      const char = characters.find((c) => c.id === payload.objectId);
      if (char) {
        onUpdateBlock(blockId, {
          characterId: char.id,
          text: `${char.name.toUpperCase()}`
        });
      }
    } else if (payload.objectType === 'location') {
      onUpdateBlock(blockId, {
        text: `INT. ${payload.objectId.toUpperCase()} - DAY`
      });
    } else if (payload.objectType === 'plot_thread') {
      const thread = plotThreads.find((t) => t.id === payload.objectId);
      if (thread) {
        onUpdateBlock(blockId, {
          plotThreadId: thread.id,
          notes: `[Plot Thread: ${thread.name}]`
        });
      }
    }
  };

  return (
    <div className="w-72 bg-[#0B1020] border-r border-[#1E293B] flex flex-col h-full select-none shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-[#1E293B] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold">
            <ListTree className="w-4 h-4" />
            <span>{preset.structuralHierarchyName.toUpperCase()}</span>
          </div>
          <button
            onClick={() => onAddBlock(preset.blockTypes[0].type)}
            className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs flex items-center space-x-1 font-semibold"
            title="Add Structural Heading"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter scenes/headings..."
            className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Structural Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {structuralBlocks.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No structural headings match filter.</p>
          </div>
        ) : (
          structuralBlocks.map((block, idx) => {
            const isSelected = selectedBlockId === block.id;

            return (
              <NarrativeDropZone
                key={block.id}
                targetType="workspace"
                targetId={`nav_block_${block.id}`}
                accepts={['character', 'location', 'plot_thread', 'setup']}
                context={{ sourcePanel: 'writing_studio' }}
                onCommitOperation={(_, payloadData) => { if (payloadData) handleDropOnBlock(block.id, payloadData); }}
              >
                <div
                  onClick={() => onSelectBlock(block.id)}
                  className={`group relative flex items-center justify-between p-2 rounded-lg cursor-pointer border text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold shadow-md'
                      : 'bg-[#141B2D]/60 hover:bg-[#141B2D] border-[#1E293B] text-slate-300'
                  }`}
                >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 cursor-grab" />
                      
                      {/* Icon per type */}
                      {block.type === 'slugline' || block.type === 'scene_heading' ? (
                        <Clapperboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : block.type === 'character' ? (
                        <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      ) : block.type === 'chapter_title' || block.type === 'headline' ? (
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}

                      <div className="truncate">
                        <span className="block text-[11px] font-mono uppercase tracking-tight text-slate-100 truncate">
                          {block.text || `[Untitled ${block.type}]`}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans capitalize">
                          {block.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBlock(block.id);
                        }}
                        className="p-1 hover:text-rose-400 text-slate-500"
                        title="Delete Heading"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
              </NarrativeDropZone>
            );
          })
        )}
      </div>

      {/* Semantic Integration Quick Badges */}
      <div className="p-3 bg-[#080D1A] border-t border-[#1E293B] text-[10px] space-y-2">
        <div className="text-slate-400 font-mono font-bold flex items-center justify-between">
          <span>SEMANTIC DROPS</span>
          <span className="text-indigo-400">READY</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono">
          <div className="bg-[#141B2D] p-1.5 rounded border border-[#1E293B] flex items-center space-x-1">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>{characters.length} Chars</span>
          </div>
          <div className="bg-[#141B2D] p-1.5 rounded border border-[#1E293B] flex items-center space-x-1">
            <GitBranch className="w-3 h-3 text-rose-400" />
            <span>{plotThreads.length} Threads</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-500 italic">
          Drag characters or threads onto structure items to insert dialogue or links.
        </p>
      </div>
    </div>
  );
};
