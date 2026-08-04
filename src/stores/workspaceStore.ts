import { create } from 'zustand';
import { NarrativeObjectType } from '../types';

export interface DragPayload {
  type: NarrativeObjectType;
  id: string;
  data?: any;
}

export interface PanelState {
  id: string;
  title: string;
  isFloating: boolean;
  isDocked: boolean;
  isPinned: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  dockZone?: 'left' | 'center' | 'right' | 'bottom';
}

export interface SavedLayout {
  id: string;
  name: string;
  panels: PanelState[];
}

interface WorkspaceStore {
  draggedObject: DragPayload | null;
  isNavigatorCollapsed: boolean;
  navigatorWidth: number;
  activeNavigatorSection: string;
  activeWorkspace: string;
  savedLayouts: SavedLayout[];
  panels: Record<string, PanelState>;

  // Drag actions
  setDraggedObject: (obj: DragPayload | null) => void;
  toggleNavigatorCollapse: () => void;
  setActiveNavigatorSection: (section: string) => void;

  // Workspace actions
  setActiveWorkspace: (workspace: string) => void;

  // Panel actions
  toggleFloatPanel: (panelId: string, initialPos?: { x: number; y: number }) => void;
  togglePinPanel: (panelId: string) => void;
  toggleMaximizePanel: (panelId: string) => void;
  toggleMinimizePanel: (panelId: string) => void;
  updatePanelPos: (panelId: string, x: number, y: number, width?: number, height?: number) => void;
  dockPanel: (panelId: string, zone: 'left' | 'center' | 'right' | 'bottom') => void;
  resetLayout: () => void;
}

const DEFAULT_PANELS: Record<string, PanelState> = {
  navigator: {
    id: 'navigator',
    title: 'Narrative Navigator',
    isFloating: false,
    isDocked: true,
    isPinned: true,
    isMinimized: false,
    isMaximized: false,
    dockZone: 'left'
  },
  inspector: {
    id: 'inspector',
    title: 'Context Inspector',
    isFloating: false,
    isDocked: true,
    isPinned: true,
    isMinimized: false,
    isMaximized: false,
    dockZone: 'right'
  },
  sceneEditor: {
    id: 'sceneEditor',
    title: 'Scene Editor',
    isFloating: false,
    isDocked: true,
    isPinned: true,
    isMinimized: false,
    isMaximized: false,
    dockZone: 'center'
  },
  timeline: {
    id: 'timeline',
    title: 'Timeline Observatory',
    isFloating: false,
    isDocked: true,
    isPinned: true,
    isMinimized: false,
    isMaximized: false,
    dockZone: 'center'
  },
  writersRoom: {
    id: 'writersRoom',
    title: 'Narrative Advisory Council',
    isFloating: false,
    isDocked: true,
    isPinned: false,
    isMinimized: false,
    isMaximized: false,
    dockZone: 'center'
  }
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  draggedObject: null,
  isNavigatorCollapsed: false,
  navigatorWidth: 280,
  activeNavigatorSection: 'Characters',
  activeWorkspace: 'WRITING',
  savedLayouts: [],
  panels: DEFAULT_PANELS,

  setDraggedObject: (obj) => set({ draggedObject: obj }),
  toggleNavigatorCollapse: () => set((state) => ({ isNavigatorCollapsed: !state.isNavigatorCollapsed })),
  setActiveNavigatorSection: (section) => set({ activeNavigatorSection: section }),

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  toggleFloatPanel: (panelId, initialPos) =>
    set((state) => {
      const panel = state.panels[panelId];
      if (!panel) return state;

      const isFloating = !panel.isFloating;
      return {
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            isFloating,
            isDocked: !isFloating,
            x: initialPos?.x ?? panel.x ?? 100,
            y: initialPos?.y ?? panel.y ?? 100,
            width: panel.width ?? 480,
            height: panel.height ?? 360
          }
        }
      };
    }),

  togglePinPanel: (panelId) =>
    set((state) => {
      const panel = state.panels[panelId];
      if (!panel) return state;
      return {
        panels: {
          ...state.panels,
          [panelId]: { ...panel, isPinned: !panel.isPinned }
        }
      };
    }),

  toggleMaximizePanel: (panelId) =>
    set((state) => {
      const panel = state.panels[panelId];
      if (!panel) return state;
      return {
        panels: {
          ...state.panels,
          [panelId]: { ...panel, isMaximized: !panel.isMaximized }
        }
      };
    }),

  toggleMinimizePanel: (panelId) =>
    set((state) => {
      const panel = state.panels[panelId];
      if (!panel) return state;
      return {
        panels: {
          ...state.panels,
          [panelId]: { ...panel, isMinimized: !panel.isMinimized }
        }
      };
    }),

  updatePanelPos: (panelId, x, y, width, height) =>
    set((state) => {
      const panel = state.panels[panelId];
      if (!panel) return state;
      return {
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            x,
            y,
            width: width ?? panel.width,
            height: height ?? panel.height
          }
        }
      };
    }),

  dockPanel: (panelId, zone) =>
    set((state) => {
      const panel = state.panels[panelId];
      if (!panel) return state;
      return {
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            isFloating: false,
            isDocked: true,
            dockZone: zone
          }
        }
      };
    }),

  resetLayout: () => set({ panels: DEFAULT_PANELS })
}));
