import React from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { User, FileText, GitBranch, ShieldAlert, Calendar } from 'lucide-react';

export const DragLayer: React.FC = () => {
  const draggedObject = useWorkspaceStore((state) => state.draggedObject);

  if (!draggedObject) return null;

  const getIcon = () => {
    switch (draggedObject.type) {
      case 'character':
        return <User className="w-4 h-4 text-indigo-400" />;
      case 'scene':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'plot_thread':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'canon_fact':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'timeline':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="bg-[#0F172A] border border-indigo-500/50 text-slate-200 text-xs px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 font-mono animate-bounce">
        {getIcon()}
        <span className="font-bold text-indigo-300 capitalize">
          Dragging: {draggedObject.data?.name || draggedObject.data?.title || draggedObject.id}
        </span>
      </div>
    </div>
  );
};
