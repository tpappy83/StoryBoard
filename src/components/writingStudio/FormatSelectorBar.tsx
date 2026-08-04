import React from 'react';
import {
  WritingMedium,
  WritingStudioDoc
} from '../../types/writingStudio';
import { WRITING_MEDIUM_PRESETS } from '../../data/writingMediumPresets';
import {
  Clapperboard,
  BookOpen,
  Newspaper,
  Feather,
  Drama,
  LayoutGrid,
  Settings2,
  Sparkles,
  FileText,
  Maximize2,
  PanelLeft,
  PanelRight,
  Eye,
  Layers,
  Clock,
  Hash
} from 'lucide-react';
import { ThreeDotActionsBar } from '../ThreeDotActionsBar';

interface FormatSelectorBarProps {
  doc: WritingStudioDoc;
  viewMode: 'pages' | 'continuous';
  dockingState: 'full' | 'dock_left' | 'dock_right' | 'windowed';
  onSelectMedium: (medium: WritingMedium) => void;
  onChangeTitle: (title: string) => void;
  onToggleViewMode: (mode: 'pages' | 'continuous') => void;
  onChangeDocking: (state: 'full' | 'dock_left' | 'dock_right' | 'windowed') => void;
  onOpenAiRevision: () => void;
  onOpenGoogleDocs?: () => void;
}

const MEDIUM_ICONS: Record<WritingMedium, React.FC<{ className?: string }>> = {
  screenplay: Clapperboard,
  novel: BookOpen,
  magazine: Newspaper,
  short_story: Feather,
  stage_play: Drama,
  comic_script: LayoutGrid,
  custom: Settings2
};

export const FormatSelectorBar: React.FC<FormatSelectorBarProps> = ({
  doc,
  viewMode,
  dockingState,
  onSelectMedium,
  onChangeTitle,
  onToggleViewMode,
  onChangeDocking,
  onOpenAiRevision,
  onOpenGoogleDocs
}) => {
  // Calculate stats
  const totalWords = doc.blocks.reduce((acc, b) => {
    return acc + (b.text ? b.text.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const estimatedPages = Math.max(1, Math.ceil(totalWords / 250));
  const readingTimeMin = Math.max(1, Math.ceil(totalWords / 200));

  return (
    <div className="bg-[#0A2A43] border-b border-[#153B5C] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none">
      {/* Left: Doc Title & Active Medium Indicator */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex items-center space-x-2 bg-[#000000] p-1.5 rounded-md border border-[#153B5C]">
          {React.createElement(MEDIUM_ICONS[doc.medium] || FileText, {
            className: 'w-4 h-4 text-[#F2C94C]'
          })}
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F2C94C]">
            {WRITING_MEDIUM_PRESETS[doc.medium]?.label || doc.medium}
          </span>
        </div>

        <input
          type="text"
          value={doc.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="bg-transparent text-sm font-bold text-white focus:outline-none focus:bg-[#000000] px-2 py-1 rounded-md border border-transparent focus:border-[#153B5C] transition-all truncate max-w-xs md:max-w-md"
          placeholder="Document Title..."
        />
      </div>

      {/* Middle: Medium Selector Pills */}
      <div className="flex items-center bg-[#000000] p-1 rounded-md border border-[#153B5C] overflow-x-auto space-x-1 max-w-full">
        {(Object.keys(WRITING_MEDIUM_PRESETS) as WritingMedium[]).map((mediumKey) => {
          const preset = WRITING_MEDIUM_PRESETS[mediumKey];
          const IconComp = MEDIUM_ICONS[mediumKey] || FileText;
          const isActive = doc.medium === mediumKey;

          return (
            <button
              key={mediumKey}
              onClick={() => onSelectMedium(mediumKey)}
              className={`btn-workstation flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] transition-all shrink-0 ${
                isActive
                  ? 'bg-[#000000] text-white border-b-2 border-[#F2C94C]'
                  : 'bg-[#0A2A43] text-[#C4C4C4] hover:text-[#F2C94C] hover:bg-[#0E3859] border border-[#153B5C]'
              }`}
              title={preset.description}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Telemetry, Controls, and ThreeDotActionsBar */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Telemetry Pill */}
        <div className="hidden lg:flex items-center space-x-3 bg-[#000000] px-2.5 py-1 rounded-md border border-[#153B5C] text-[11px] font-mono text-[#C4C4C4]">
          <span className="flex items-center space-x-1" title="Word Count">
            <Hash className="w-3 h-3 text-[#F2C94C]" />
            <strong className="text-white">{totalWords}</strong> words
          </span>
          <span className="text-[#153B5C]">|</span>
          <span className="flex items-center space-x-1" title="Est. Pages">
            <Layers className="w-3 h-3 text-[#F2C94C]" />
            <strong className="text-white">{estimatedPages}</strong> pgs
          </span>
          <span className="text-[#153B5C]">|</span>
          <span className="flex items-center space-x-1" title="Reading Time">
            <Clock className="w-3 h-3 text-emerald-400" />
            <strong className="text-white">{readingTimeMin}</strong>m read
          </span>
        </div>

        {/* View Mode Toggle */}
        <button
          onClick={() => onToggleViewMode(viewMode === 'pages' ? 'continuous' : 'pages')}
          className={`btn-workstation flex items-center space-x-1 px-2 py-1 rounded-md border text-[11px] font-mono font-bold transition-all ${
            viewMode === 'pages'
              ? 'bg-[#000000] text-[#F2C94C] border-[#F2C94C]/50'
              : 'bg-[#0A2A43] text-[#C4C4C4] border-[#153B5C] hover:text-white'
          }`}
          title="Toggle Page vs Continuous View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="capitalize">{viewMode} View</span>
        </button>

        {/* AI Revision Launch */}
        <button
          onClick={onOpenAiRevision}
          className="btn-workstation flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#F2C94C] hover:bg-amber-400 text-[#000000] font-bold text-xs shadow-md transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI REVISION</span>
        </button>

        {/* Docking Mode Controls */}
        <div className="flex items-center bg-[#000000] p-0.5 rounded-md border border-[#153B5C]">
          <button
            onClick={() => onChangeDocking('full')}
            className={`p-1 rounded-md ${dockingState === 'full' ? 'bg-[#0A2A43] text-[#F2C94C]' : 'text-[#C4C4C4] hover:text-white'}`}
            title="Full Window Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeDocking('dock_left')}
            className={`p-1 rounded-md ${dockingState === 'dock_left' ? 'bg-[#0A2A43] text-[#F2C94C]' : 'text-[#C4C4C4] hover:text-white'}`}
            title="Dock Left"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeDocking('dock_right')}
            className={`p-1 rounded-md ${dockingState === 'dock_right' ? 'bg-[#0A2A43] text-[#F2C94C]' : 'text-[#C4C4C4] hover:text-white'}`}
            title="Dock Right"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Three-Dot Actions Bar */}
        <ThreeDotActionsBar
          onRunMultiPassRevision={onOpenAiRevision}
          onOpenGoogleDocs={onOpenGoogleDocs}
        />
      </div>
    </div>
  );
};
