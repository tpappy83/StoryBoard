import React from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface DockZoneProps {
  zone: 'left' | 'center' | 'right' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export const DockZone: React.FC<DockZoneProps> = ({ zone, children, className = '' }) => {
  const dockPanel = useWorkspaceStore((state) => state.dockPanel);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const panelId = e.dataTransfer.getData('panelId');
    if (panelId) {
      dockPanel(panelId, zone);
    }
  };

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop} className={className}>
      {children}
    </div>
  );
};
