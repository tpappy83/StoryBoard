import React, { useState } from 'react';
import { Compass, CheckCircle2, Clock, AlertTriangle, Layers, Film, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { StructureFramework, StructureMilestone } from '../types';

interface StructureIntelligenceProps {
  milestones?: StructureMilestone[];
  activeFramework?: StructureFramework;
  onUpdateStructure?: (milestones: StructureMilestone[], framework: StructureFramework) => void;
}

const DEFAULT_MILESTONES: StructureMilestone[] = [
  { id: 'm1', name: 'Inciting Incident (Sector 4 Purge)', phase: 1, framework: '3-Act', description: 'Council forces lock down Sector 4; Ava finds Helios key.', targetPercentage: 12, status: 'achieved' },
  { id: 'm2', name: 'Plot Point 1 / Door Into Act 2', phase: 2, framework: '3-Act', description: 'Ava & Liam board Elevator Shaft 09 to descend to Earth surface.', targetPercentage: 25, status: 'achieved' },
  { id: 'm3', name: 'Midpoint Confrontation (Observatory Vault)', phase: 3, framework: '3-Act', description: 'Face-to-face standoff between Ava and Rowan at the Helios plasma sphere.', targetPercentage: 50, status: 'current' },
  { id: 'm4', name: 'All Is Lost / Dark Night of Soul', phase: 4, framework: '3-Act', description: 'Council fleet arrives overhead; Liam captured at Spire.', targetPercentage: 75, status: 'pending' },
  { id: 'm5', name: 'Climax & Resolution (Solstice Assembly Reboot)', phase: 5, framework: '3-Act', description: 'Ensemble convergence at Citadel power grid.', targetPercentage: 90, status: 'pending' }
];

export const StructureIntelligence: React.FC<StructureIntelligenceProps> = ({
  milestones: externalMilestones,
  activeFramework: externalFramework = '3-Act',
  onUpdateStructure
}) => {
  const [internalFramework, setInternalFramework] = useState<StructureFramework>(externalFramework);
  const [internalMilestones, setInternalMilestones] = useState<StructureMilestone[]>(
    externalMilestones && externalMilestones.length > 0 ? externalMilestones : DEFAULT_MILESTONES
  );

  const activeFramework = externalFramework || internalFramework;
  const milestones = externalMilestones && externalMilestones.length > 0 ? externalMilestones : internalMilestones;

  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState<{
    name: string;
    description: string;
    targetPercentage: number;
    phase: number;
    status: 'achieved' | 'current' | 'pending';
  }>({
    name: '',
    description: '',
    targetPercentage: 50,
    phase: 3,
    status: 'pending'
  });

  const notifyChange = (updatedMilestones: StructureMilestone[], updatedFramework: StructureFramework) => {
    setInternalMilestones(updatedMilestones);
    setInternalFramework(updatedFramework);
    if (onUpdateStructure) {
      onUpdateStructure(updatedMilestones, updatedFramework);
    }
  };

  const handleFrameworkSelect = (fw: StructureFramework) => {
    notifyChange(milestones, fw);
  };

  const handleCycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatusMap: Record<string, 'achieved' | 'current' | 'pending'> = {
      pending: 'current',
      current: 'achieved',
      achieved: 'pending'
    };
    const updated = milestones.map(m => {
      if (m.id === id) {
        return { ...m, status: nextStatusMap[m.status] };
      }
      return m;
    });
    notifyChange(updated, activeFramework);
  };

  const handleDeleteMilestone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = milestones.filter(m => m.id !== id);
    notifyChange(updated, activeFramework);
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.name.trim()) return;

    const created: StructureMilestone = {
      id: `ms_${Date.now()}`,
      name: newMilestone.name.trim(),
      description: newMilestone.description.trim(),
      targetPercentage: Number(newMilestone.targetPercentage) || 50,
      phase: Number(newMilestone.phase) || 1,
      framework: activeFramework,
      status: newMilestone.status
    };

    const updated = [...milestones, created].sort((a, b) => a.targetPercentage - b.targetPercentage);
    notifyChange(updated, activeFramework);

    setNewMilestone({ name: '', description: '', targetPercentage: 50, phase: 3, status: 'pending' });
    setIsAddingModalOpen(false);
  };

  // Calculate current progress
  const currentMilestone = milestones.find(m => m.status === 'current') || milestones.filter(m => m.status === 'achieved').pop();
  const progressPercentage = currentMilestone ? currentMilestone.targetPercentage : 0;

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl relative">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1E293B] pb-3 gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <span>NARRATIVE STRUCTURE INTELLIGENCE</span>
              <span className="px-2 py-0.5 text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full font-sans">
                Phase 9 NOS
              </span>
            </h2>
            <p className="text-xs text-slate-400">Pacing tracker for 3-Act, 5-Act, Save The Cat, and Hero's Journey paradigms</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Framework Selector */}
          <div className="flex items-center space-x-1 bg-[#1E293B] p-1 rounded-xl border border-[#334155] text-xs font-mono overflow-x-auto">
            {(['3-Act', '5-Act', 'Save The Cat', 'Hero Journey', 'Ensemble Network'] as StructureFramework[]).map(fw => (
              <button
                key={fw}
                onClick={() => handleFrameworkSelect(fw)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeFramework === fw ? 'bg-sky-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingModalOpen(true)}
            className="flex items-center space-x-1 bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ MILESTONE</span>
          </button>
        </div>
      </div>

      {/* Timeline Progression Bar */}
      <div className="bg-[#1E293B]/60 border border-[#334155] p-4 rounded-xl space-y-3">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            STORY PROGRESSION PACING ({activeFramework})
          </span>
          <span className="text-sky-400 font-bold">{progressPercentage}% PACING TARGET REACHED</span>
        </div>

        <div className="relative w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, progressPercentage))}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
          {milestones.map(m => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all relative group shadow-md ${
                m.status === 'achieved'
                  ? 'bg-sky-950/40 border-sky-500/50 text-sky-200'
                  : m.status === 'current'
                  ? 'bg-amber-950/50 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/30 animate-pulse'
                  : 'bg-[#0F172A] border-slate-700/50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-sky-300 font-bold">{m.targetPercentage}%</span>
                <button
                  onClick={(e) => handleCycleStatus(m.id, e)}
                  className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                    m.status === 'achieved'
                      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                      : m.status === 'current'
                      ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Click to cycle status: Pending -> Current -> Achieved"
                >
                  {m.status}
                </button>
              </div>

              <div className="font-bold text-[11px] font-mono leading-tight text-slate-100 flex items-center justify-between gap-1">
                <span>{m.name}</span>
                <button
                  onClick={(e) => handleDeleteMilestone(m.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[10px] leading-relaxed text-slate-300 line-clamp-2">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for adding new structure milestone */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-sky-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                ADD NARRATIVE MILESTONE ({activeFramework})
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestoneSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dark Night of the Soul / Portal to Act 3"
                  value={newMilestone.name}
                  onChange={e => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Target Story Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newMilestone.targetPercentage}
                  onChange={e => setNewMilestone({ ...newMilestone, targetPercentage: Number(e.target.value) })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Status</label>
                <select
                  value={newMilestone.status}
                  onChange={e => setNewMilestone({ ...newMilestone, status: e.target.value as any })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="pending">Pending</option>
                  <option value="current">Current</option>
                  <option value="achieved">Achieved</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Description & Narrative Goal</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what occurs at this milestone..."
                  value={newMilestone.description}
                  onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A2338]">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-lg font-bold font-mono transition-colors"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
