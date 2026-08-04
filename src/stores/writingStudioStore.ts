import { create } from 'zustand';
import {
  WritingMedium,
  WritingBlock,
  WritingStudioDoc,
  WritingStudioMetadata,
  WritingStudioAiTool,
  WritingBlockType
} from '../types/writingStudio';
import { WRITING_MEDIUM_PRESETS } from '../data/writingMediumPresets';
import { Scene } from '../types';

interface WritingStudioStore {
  activeDoc: WritingStudioDoc;
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  viewMode: 'pages' | 'continuous';
  dockingState: 'full' | 'dock_left' | 'dock_right' | 'windowed';
  fontSize: number;
  activeAiTool: WritingStudioAiTool | null;
  aiOutput: string | null;
  isAiGenerating: boolean;

  // Actions
  setMedium: (medium: WritingMedium) => void;
  addBlock: (type?: WritingBlockType, afterBlockId?: string, text?: string) => void;
  updateBlock: (id: string, updates: Partial<WritingBlock>) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  selectBlock: (id: string | null) => void;
  selectSection: (id: string | null) => void;
  setDocTitle: (title: string) => void;
  updateMetadata: (metadata: Partial<WritingStudioMetadata>) => void;
  setViewMode: (mode: 'pages' | 'continuous') => void;
  setDockingState: (mode: 'full' | 'dock_left' | 'dock_right' | 'windowed') => void;
  setFontSize: (size: number) => void;
  convertSceneToStudio: (scene: Scene, medium?: WritingMedium) => void;
  setAiToolState: (tool: WritingStudioAiTool | null, output?: string | null, isGenerating?: boolean) => void;
}

const INITIAL_SCREENPLAY_BLOCKS: WritingBlock[] = [
  {
    id: 'block_1',
    type: 'slugline',
    text: 'INT. CITADEL COMMAND CENTER - NIGHT',
    sceneNumber: 1,
    pageNumber: 1
  },
  {
    id: 'block_2',
    type: 'action',
    text: 'A blinding storm lashes against the reinforced glass observation bay. Emergency red lights pulse rhythmically across dormant holographic arrays. Sparks shower from an overhead conduit.',
    pageNumber: 1
  },
  {
    id: 'block_3',
    type: 'character',
    text: 'CAPTAIN VANCE',
    pageNumber: 1
  },
  {
    id: 'block_4',
    type: 'parenthetical',
    text: '(gripping the command console, voice strained)',
    pageNumber: 1
  },
  {
    id: 'block_5',
    type: 'dialogue',
    text: 'If Sector 4 loses primary power, the containment shield fails in under two minutes. Ryn, report on the backup relay!',
    pageNumber: 1
  },
  {
    id: 'block_6',
    type: 'character',
    text: 'LIAISON RYN',
    pageNumber: 1
  },
  {
    id: 'block_7',
    type: 'dialogue',
    text: 'The relay didn’t fail, Captain. Someone manually severed the bypass key from inside the vault.',
    pageNumber: 1
  },
  {
    id: 'block_8',
    type: 'transition',
    text: 'SMASH CUT TO:',
    pageNumber: 1
  },
  {
    id: 'block_9',
    type: 'slugline',
    text: 'INT. SUB-LEVEL VAULT 7 - CONTINUOUS',
    sceneNumber: 2,
    pageNumber: 2
  },
  {
    id: 'block_10',
    type: 'action',
    text: 'A hooded figure seals the heavy titanium pressure door, sliding an encrypted datapad into a hidden jacket pocket.',
    pageNumber: 2
  }
];

const DEFAULT_DOC: WritingStudioDoc = {
  id: 'doc_default_1',
  title: 'Sector 4: The Citadel Breach',
  medium: 'screenplay',
  blocks: INITIAL_SCREENPLAY_BLOCKS,
  metadata: {
    logline: 'When primary power fails in Sector 4, a seasoned captain discovers an insider sabotage targeting the citadel containment shield.',
    genre: 'Sci-Fi / Political Thriller',
    targetWordCount: 15000,
    targetPageCount: 120,
    issueNumber: 'Episode 1',
    actStructure: '3-Act Structure'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const useWritingStudioStore = create<WritingStudioStore>((set, get) => ({
  activeDoc: DEFAULT_DOC,
  selectedBlockId: 'block_1',
  selectedSectionId: null,
  viewMode: 'pages',
  dockingState: 'full',
  fontSize: 14,
  activeAiTool: null,
  aiOutput: null,
  isAiGenerating: false,

  setMedium: (medium) => {
    const preset = WRITING_MEDIUM_PRESETS[medium];
    set((state) => {
      // Re-map blocks or convert if switching medium
      const defaultBlockType = preset.blockTypes[0].type;
      const updatedBlocks = state.activeDoc.blocks.map((b) => {
        // check if block type belongs to new medium
        const existsInNew = preset.blockTypes.some((bt) => bt.type === b.type);
        if (existsInNew) return b;
        return { ...b, type: defaultBlockType };
      });

      return {
        viewMode: preset.isPageBased ? 'pages' : 'continuous',
        activeDoc: {
          ...state.activeDoc,
          medium,
          blocks: updatedBlocks,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  addBlock: (type, afterBlockId, text = '') => {
    set((state) => {
      const preset = WRITING_MEDIUM_PRESETS[state.activeDoc.medium];
      const targetType = type || preset.blockTypes[0].type;

      const newBlock: WritingBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: targetType,
        text,
        pageNumber: 1
      };

      const blocks = [...state.activeDoc.blocks];
      if (afterBlockId) {
        const idx = blocks.findIndex((b) => b.id === afterBlockId);
        if (idx !== -1) {
          blocks.splice(idx + 1, 0, newBlock);
        } else {
          blocks.push(newBlock);
        }
      } else {
        blocks.push(newBlock);
      }

      return {
        selectedBlockId: newBlock.id,
        activeDoc: {
          ...state.activeDoc,
          blocks,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  updateBlock: (id, updates) => {
    set((state) => ({
      activeDoc: {
        ...state.activeDoc,
        blocks: state.activeDoc.blocks.map((b) =>
          b.id === id ? { ...b, ...updates } : b
        ),
        updatedAt: new Date().toISOString()
      }
    }));
  },

  deleteBlock: (id) => {
    set((state) => {
      if (state.activeDoc.blocks.length <= 1) return state; // keep at least 1 block
      const newBlocks = state.activeDoc.blocks.filter((b) => b.id !== id);
      return {
        selectedBlockId: newBlocks[0]?.id || null,
        activeDoc: {
          ...state.activeDoc,
          blocks: newBlocks,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  reorderBlocks: (fromIndex, toIndex) => {
    set((state) => {
      const blocks = [...state.activeDoc.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return {
        activeDoc: {
          ...state.activeDoc,
          blocks,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  selectSection: (id) => set({ selectedSectionId: id }),

  setDocTitle: (title) =>
    set((state) => ({
      activeDoc: {
        ...state.activeDoc,
        title,
        updatedAt: new Date().toISOString()
      }
    })),

  updateMetadata: (metadata) =>
    set((state) => ({
      activeDoc: {
        ...state.activeDoc,
        metadata: {
          ...state.activeDoc.metadata,
          ...metadata
        },
        updatedAt: new Date().toISOString()
      }
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setDockingState: (mode) => set({ dockingState: mode }),

  setFontSize: (size) => set({ fontSize: size }),

  convertSceneToStudio: (scene, medium = 'screenplay') => {
    const lines = scene.prose.split('\n').filter((l) => l.trim().length > 0);
    const convertedBlocks: WritingBlock[] = [];

    // First block: Slugline / Title
    convertedBlocks.push({
      id: `block_conv_0_${Date.now()}`,
      type: medium === 'screenplay' ? 'slugline' : 'chapter_title',
      text: `${scene.location ? `INT/EXT. ${scene.location.toUpperCase()}` : scene.title.toUpperCase()}`,
      sceneNumber: scene.padIndex || 1,
      pageNumber: 1
    });

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      let blockType: WritingBlockType = 'action';

      if (medium === 'screenplay') {
        if (/^[A-Z0-9\s]{3,25}:/.test(trimmed)) {
          // Character Dialogue
          const parts = trimmed.split(':');
          convertedBlocks.push({
            id: `block_conv_${idx}_char_${Date.now()}`,
            type: 'character',
            text: parts[0].trim().toUpperCase(),
            pageNumber: 1
          });
          blockType = 'dialogue';
          trimmed.replace(parts[0] + ':', '');
        } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          blockType = 'parenthetical';
        } else if (/^(INT\.|EXT\.|CUT TO:)/i.test(trimmed)) {
          blockType = 'slugline';
        } else {
          blockType = 'action';
        }
      } else if (medium === 'novel') {
        blockType = 'prose';
      } else if (medium === 'magazine') {
        blockType = idx === 0 ? 'lede' : 'body_section';
      }

      convertedBlocks.push({
        id: `block_conv_${idx}_${Date.now()}`,
        type: blockType,
        text: trimmed,
        pageNumber: 1
      });
    });

    set((state) => ({
      activeDoc: {
        id: `doc_scene_${scene.id}`,
        title: `Script: ${scene.title}`,
        medium,
        blocks: convertedBlocks.length > 0 ? convertedBlocks : INITIAL_SCREENPLAY_BLOCKS,
        metadata: {
          ...state.activeDoc.metadata,
          logline: scene.purpose || `Converted from Scene: ${scene.title}`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      selectedBlockId: convertedBlocks[0]?.id || null,
      viewMode: medium === 'screenplay' || medium === 'stage_play' ? 'pages' : 'continuous'
    }));
  },

  setAiToolState: (tool, output = null, isGenerating = false) => {
    set({
      activeAiTool: tool,
      aiOutput: output,
      isAiGenerating: isGenerating
    });
  }
}));
