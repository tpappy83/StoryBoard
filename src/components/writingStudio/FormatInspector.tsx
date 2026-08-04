import React, { useState } from 'react';
import {
  WritingStudioDoc,
  WritingMedium,
  WritingStudioAiTool,
  WritingStudioMetadata
} from '../../types/writingStudio';
import { WRITING_MEDIUM_PRESETS } from '../../data/writingMediumPresets';
import { SetupPayoffEvent } from '../../types';
import {
  Sliders,
  Sparkles,
  FileText,
  Target,
  ShieldCheck,
  Download,
  Wand2,
  BookOpen,
  Clapperboard,
  Newspaper,
  LayoutGrid,
  Drama,
  Check,
  AlertCircle,
  Copy,
  Layers,
  Hash
} from 'lucide-react';

interface FormatInspectorProps {
  doc: WritingStudioDoc;
  setups?: SetupPayoffEvent[];
  isAiGenerating?: boolean;
  aiOutput?: string | null;
  onUpdateMetadata: (metadata: Partial<WritingStudioMetadata>) => void;
  onRunAiTool: (toolName: WritingStudioAiTool, extraPrompt?: string) => void;
  onApplyAiOutputToBlocks?: (output: string) => void;
}

export const FormatInspector: React.FC<FormatInspectorProps> = ({
  doc,
  setups = [],
  isAiGenerating = false,
  aiOutput = null,
  onUpdateMetadata,
  onRunAiTool,
  onApplyAiOutputToBlocks
}) => {
  const [activeTab, setActiveTab] = useState<'ai_tools' | 'metadata' | 'setups' | 'export'>('ai_tools');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const preset = WRITING_MEDIUM_PRESETS[doc.medium];

  // Medium-specific AI Tool Options
  const mediumAiTools: { id: WritingStudioAiTool; name: string; description: string; icon: any }[] = [
    {
      id: 'format_aware_rewrite',
      name: 'Format-Aware Rewrite',
      description: `Polish current ${preset.label} syntax and pacing strictly adhering to industry rules.`,
      icon: Wand2
    },
    {
      id: 'scene_to_screenplay',
      name: 'Scene → Screenplay Conversion',
      description: 'Convert narrative prose into Final Draft sluglines, dialogue, and action beats.',
      icon: Clapperboard
    },
    {
      id: 'prose_to_dialogue',
      name: 'Prose → Dialogue Extraction',
      description: 'Extract raw character voices into structured theatrical/screenplay speech blocks.',
      icon: Drama
    },
    {
      id: 'chapter_expansion',
      name: 'Chapter Expansion',
      description: 'Flesh out narrative outlines with vivid sensory prose and subtext.',
      icon: BookOpen
    },
    {
      id: 'magazine_lede_generator',
      name: 'Magazine Lede & Nut-graf',
      description: 'Generate high-impact journalistic openings and core thesis paragraphs.',
      icon: Newspaper
    },
    {
      id: 'comic_panel_breakdown',
      name: 'Comic Panel Breakdown',
      description: 'Divide action beats into page numbers, panel descriptions, captions, and balloons.',
      icon: LayoutGrid
    },
    {
      id: 'stage_play_beat_mapping',
      name: 'Stage Play Beat Mapping',
      description: 'Map stage entrances, exits, and emotional beats for theatrical production.',
      icon: Drama
    }
  ];

  // Unresolved setups
  const unresolvedSetups = setups.filter((s) => s.type === 'Setup');

  // Export full document text
  const getExportableText = () => {
    return doc.blocks
      .map((b) => {
        if (b.type === 'slugline' || b.type === 'scene_heading') {
          return `\n\n${b.text.toUpperCase()}\n`;
        }
        if (b.type === 'character') {
          return `\n${' '.repeat(20)}${b.text.toUpperCase()}`;
        }
        if (b.type === 'parenthetical') {
          return `${' '.repeat(15)}${b.text}`;
        }
        if (b.type === 'dialogue') {
          return `${' '.repeat(10)}${b.text}\n`;
        }
        if (b.type === 'transition') {
          return `\n${' '.repeat(35)}${b.text.toUpperCase()}\n`;
        }
        return b.text;
      })
      .join('\n');
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(getExportableText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 bg-[#0B1020] border-l border-[#1E293B] flex flex-col h-full select-none shrink-0">
      {/* Header Tabs */}
      <div className="p-3 border-b border-[#1E293B] bg-[#080D1A]">
        <div className="flex items-center space-x-1 bg-[#141B2D] p-1 rounded-xl border border-[#1E293B] text-[11px] font-mono">
          <button
            onClick={() => setActiveTab('ai_tools')}
            className={`flex-1 py-1 rounded-lg text-center font-bold transition-all ${
              activeTab === 'ai_tools'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI TOOLS
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex-1 py-1 rounded-lg text-center font-bold transition-all ${
              activeTab === 'metadata'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            METADATA
          </button>
          <button
            onClick={() => setActiveTab('setups')}
            className={`flex-1 py-1 rounded-lg text-center font-bold transition-all ${
              activeTab === 'setups'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OBLIGATIONS
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1 rounded-lg text-center font-bold transition-all ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EXPORT
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {/* TAB 1: AI MEDIUM TOOLS */}
        {activeTab === 'ai_tools' && (
          <div className="space-y-3">
            <div className="bg-[#141B2D] p-3 rounded-xl border border-indigo-500/30 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Medium-Specific AI Assistant</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Generate format-correct text blocks tailored for {preset.label}.
              </p>
            </div>

            {/* Prompt input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Custom Directive (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Focus on high tension dialogue between Vance and Ryn..."
                rows={2}
                className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>

            {/* AI Tools List */}
            <div className="space-y-2">
              {mediumAiTools.map((tool) => {
                const IconComp = tool.icon;
                return (
                  <button
                    key={tool.id}
                    disabled={isAiGenerating}
                    onClick={() => onRunAiTool(tool.id, customPrompt)}
                    className="w-full text-left p-2.5 bg-[#141B2D] hover:bg-[#1A2338] border border-[#1E293B] hover:border-indigo-500/50 rounded-xl transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-1.5 bg-indigo-950 rounded-lg text-indigo-400 group-hover:text-indigo-300 border border-indigo-500/30">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {tool.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug pl-7">
                      {tool.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* AI Output Result Box */}
            {aiOutput && (
              <div className="bg-[#141B2D] border border-purple-500/50 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-300">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI GENERATED DRAFT</span>
                  </span>
                  {onApplyAiOutputToBlocks && (
                    <button
                      onClick={() => onApplyAiOutputToBlocks(aiOutput)}
                      className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold"
                    >
                      INSERT INTO CANVAS
                    </button>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-200 bg-[#0B1020] p-2 rounded border border-[#1E293B] max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {aiOutput}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: METADATA EDITOR */}
        {activeTab === 'metadata' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Logline / Premise</label>
              <textarea
                value={doc.metadata.logline || ''}
                onChange={(e) => onUpdateMetadata({ logline: e.target.value })}
                rows={3}
                className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Logline..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Genre</label>
                <input
                  type="text"
                  value={doc.metadata.genre || ''}
                  onChange={(e) => onUpdateMetadata({ genre: e.target.value })}
                  className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Sci-Fi Thriller"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Act Structure</label>
                <input
                  type="text"
                  value={doc.metadata.actStructure || ''}
                  onChange={(e) => onUpdateMetadata({ actStructure: e.target.value })}
                  className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="3-Act Structure"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Target Word Count</label>
                <input
                  type="number"
                  value={doc.metadata.targetWordCount || 15000}
                  onChange={(e) => onUpdateMetadata({ targetWordCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Target Pages</label>
                <input
                  type="number"
                  value={doc.metadata.targetPageCount || 120}
                  onChange={(e) => onUpdateMetadata({ targetPageCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UNRESOLVED SETUPS & OBLIGATIONS */}
        {activeTab === 'setups' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
              <span>UNRESOLVED CHEKHOV GUNS</span>
              <span className="bg-amber-950 px-2 py-0.5 rounded border border-amber-800 text-[10px]">
                {unresolvedSetups.length} Open
              </span>
            </div>

            {unresolvedSetups.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-[#141B2D] rounded-xl border border-[#1E293B] space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p>All story setups have matching payoffs in manuscript!</p>
              </div>
            ) : (
              unresolvedSetups.map((setup, idx) => (
                <div
                  key={`setup_${idx}`}
                  className="bg-[#141B2D] p-3 rounded-xl border border-amber-500/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span>{setup.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">Ch. {setup.chapter}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{setup.notes}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: EXPORT & FORMATTING GUIDELINES */}
        {activeTab === 'export' && (
          <div className="space-y-3">
            <div className="bg-[#141B2D] p-3 rounded-xl border border-[#1E293B] text-xs space-y-2">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export & Industry Guidelines</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Formats manuscript using standard industry margins and Courier Prime 12pt specifications for studio submissions.
              </p>

              <button
                onClick={handleCopyExport}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 text-xs shadow-lg transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY FORMATTED MANUSCRIPT'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
