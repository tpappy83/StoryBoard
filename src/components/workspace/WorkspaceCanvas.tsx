import React from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface WorkspaceCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ children, className = '' }) => {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  return (
    <div
      className={`flex-1 overflow-y-auto space-y-4 pr-1 transition-all ${className}`}
      data-workspace={activeWorkspace}
    >
      {children}
    </div>
  );
};
