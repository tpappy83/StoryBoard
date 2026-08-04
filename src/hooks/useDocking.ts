import { useWorkspaceStore } from '../stores/workspaceStore';

export const useDocking = (panelId: string) => {
  const panel = useWorkspaceStore((state) => state.panels[panelId]);
  const toggleFloatPanel = useWorkspaceStore((state) => state.toggleFloatPanel);
  const togglePinPanel = useWorkspaceStore((state) => state.togglePinPanel);
  const toggleMaximizePanel = useWorkspaceStore((state) => state.toggleMaximizePanel);
  const toggleMinimizePanel = useWorkspaceStore((state) => state.toggleMinimizePanel);
  const updatePanelPos = useWorkspaceStore((state) => state.updatePanelPos);
  const dockPanel = useWorkspaceStore((state) => state.dockPanel);

  return {
    panel,
    isFloating: panel?.isFloating ?? false,
    isDocked: panel?.isDocked ?? true,
    isPinned: panel?.isPinned ?? true,
    isMinimized: panel?.isMinimized ?? false,
    isMaximized: panel?.isMaximized ?? false,
    dockZone: panel?.dockZone ?? 'center',
    toggleFloat: (pos?: { x: number; y: number }) => toggleFloatPanel(panelId, pos),
    togglePin: () => togglePinPanel(panelId),
    toggleMaximize: () => toggleMaximizePanel(panelId),
    toggleMinimize: () => toggleMinimizePanel(panelId),
    updatePos: (x: number, y: number, w?: number, h?: number) => updatePanelPos(panelId, x, y, w, h),
    dockTo: (zone: 'left' | 'center' | 'right' | 'bottom') => dockPanel(panelId, zone)
  };
};
