import React from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { DockZone } from './DockZone';
import { DragLayer } from './DragLayer';
import { FloatingWindow } from './FloatingWindow';

interface DockManagerProps {
  leftPanel: React.ReactNode;
  centerCanvas: React.ReactNode;
  
  floatingWindows?: { id: string; title: string; content: React.ReactNode }[];
}

export const DockManager: React.FC<DockManagerProps> = ({
  leftPanel,
  centerCanvas,
  
  floatingWindows = []
}) => {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const isNavigatorCollapsed = useWorkspaceStore((state) => state.isNavigatorCollapsed);
  const navigatorWidth = useWorkspaceStore((state) => state.navigatorWidth);

  return (
    <div className="flex-1 flex overflow-hidden p-2 gap-3 relative font-mono">
      {/* Drag Overlay Indicator */}
      <DragLayer />

      {/* Left Dock Zone (Navigator) */}
      <DockZone zone="left" className={`shrink-0 hidden md:block transition-all duration-180 ease-in-out`} style={{ width: isNavigatorCollapsed ? 48 : navigatorWidth }}>
        {leftPanel}
      </DockZone>

      {/* Center Dock Zone (Workspace Canvas) */}
      <DockZone zone="center" className="flex-1 overflow-hidden flex flex-col">
        {centerCanvas}
      </DockZone>

      

      {/* Floating Windows Managed Layer */}
      {floatingWindows.map((win) => (
        <FloatingWindow key={win.id} panelId={win.id} title={win.title}>
          {win.content}
        </FloatingWindow>
      ))}
    </div>
  );
};
