import React, { useState } from 'react';
import { TimelineEvent, TimelineLayer, Character } from '../types';
import { Layers, AlertTriangle, CheckCircle2, Clock, Plus, ZoomIn, ZoomOut, Filter, X, Trash2, Edit2 } from 'lucide-react';
import { DropTarget } from './workspace/DropTarget';
import { DragPayload } from '../stores/workspaceStore';

interface TimelineObservatoryProps {
  events: TimelineEvent[];
  characters: Character[];
  onAddEvent?: () => void;
  onUpdateEvents?: (updatedEvents: TimelineEvent[]) => void;
}

export const TimelineObservatory: React.FC<TimelineObservatoryProps> = ({
  events,
  characters,
  onAddEvent,
  onUpdateEvents
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    timestampLabel: string;
    phase: number;
    layer: TimelineLayer;
    description: string;
    conflictStatus: 'Valid' | 'Violation';
    violationDetails?: string;
  }>({
    timestampLabel: 'Cycle 289.20',
    phase: 1,
    layer: 'Character',
    description: '',
    conflictStatus: 'Valid',
    violationDetails: ''
  });

  const layers: TimelineLayer[] = ['Character', 'Political', 'Military', 'Magic'];

  const getLayerColor = (layer: TimelineLayer) => {
    switch (layer) {
      case 'Character': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      case 'Political': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Military': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Magic': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const phases = Array.from({ length: 8 }, (_, i) => i + 1);

  const handleOpenAdd = (defaultPhase = 1, defaultLayer: TimelineLayer = 'Character') => {
    setEditingEvent(null);
    setFormData({
      timestampLabel: `Cycle 289.0${defaultPhase}`,
      phase: defaultPhase,
      layer: defaultLayer,
      description: '',
      conflictStatus: 'Valid',
      violationDetails: ''
    });
    setIsModalOpen(true);
    if (onAddEvent) onAddEvent();
  };

  const handleOpenEdit = (evt: TimelineEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(evt);
    setFormData({
      id: evt.id,
      timestampLabel: evt.timestampLabel,
      phase: evt.phase,
      layer: evt.layer,
      description: evt.description,
      conflictStatus: evt.conflictStatus || 'Valid',
      violationDetails: evt.violationDetails || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!editingEvent || !onUpdateEvents) return;
    const updated = events.filter(e => e.id !== editingEvent.id);
    onUpdateEvents(updated);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    let updatedList: TimelineEvent[];

    if (editingEvent) {
      updatedList = events.map(evt => {
        if (evt.id === editingEvent.id) {
          return {
            ...evt,
            timestampLabel: formData.timestampLabel,
            phase: formData.phase,
            layer: formData.layer,
            description: formData.description,
            conflictStatus: formData.conflictStatus,
            violationDetails: formData.conflictStatus === 'Violation' ? formData.violationDetails : undefined
          };
        }
        return evt;
      });
    } else {
      const newEvt: TimelineEvent = {
        id: `evt_${Date.now()}`,
        timestampLabel: formData.timestampLabel || 'Cycle 289.20',
        phase: formData.phase,
        layer: formData.layer,
        description: formData.description,
        involvedCharIds: [],
        conflictStatus: formData.conflictStatus,
        violationDetails: formData.conflictStatus === 'Violation' ? formData.violationDetails : undefined
      };
      updatedList = [...events, newEvt];
    }

    if (onUpdateEvents) {
      onUpdateEvents(updatedList);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl space-y-4 relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 font-mono">
              <span>TIMELINE OBSERVATORY</span>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                MULTI-LAYER TRACK SEQUENCER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Chronological event tracks layered by character action, political intrigue, military movements, and magic lore.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Layer Filter */}
          <div className="flex items-center bg-[#0B1020] rounded-lg border border-[#1A2338] p-1 space-x-1 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={activeLayerFilter}
              onChange={e => setActiveLayerFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL TRACKS</option>
              <option value="CHARACTER">CHARACTER</option>
              <option value="POLITICAL">POLITICAL</option>
              <option value="MILITARY">MILITARY</option>
              <option value="MAGIC">MAGIC</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-[#0B1020] rounded-lg border border-[#1A2338] p-1 space-x-1 text-xs">
            <button
              onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.15))}
              className="p-1 hover:bg-[#141B2D] text-slate-400 hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-300 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.15))}
              className="p-1 hover:bg-[#141B2D] text-slate-400 hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => handleOpenAdd(1, 'Character')}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD TIMELINE EVENT</span>
          </button>
        </div>
      </div>

      {/* Sequencer Track Grid */}
      <div className="bg-[#0B1020] rounded-xl border border-[#1A2338] p-4 overflow-x-auto bg-daw-grid">
        <div style={{ minWidth: `${800 * zoomLevel}px` }} className="space-y-4">
          {/* Phase Header Ticks */}
          <div className="grid grid-cols-8 border-b border-[#1A2338] pb-2 text-center text-xs font-mono font-bold text-slate-400">
            {phases.map(phase => (
              <div key={phase} className="border-r border-[#1A2338]/60 last:border-r-0">
                PHASE 0{phase}
              </div>
            ))}
          </div>

          {/* Layer Tracks */}
          {layers.map(layer => {
            if (activeLayerFilter !== 'ALL' && activeLayerFilter.toUpperCase() !== layer.toUpperCase()) {
              return null;
            }

            const layerEvents = events.filter(e => e.layer === layer);

            return (
              <div key={layer} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span className={`px-2 py-0.5 rounded border ${getLayerColor(layer)}`}>
                    TRACK: {layer.toUpperCase()} LAYER
                  </span>
                  <span className="text-slate-500 text-[10px]">{layerEvents.length} events logged</span>
                </div>

                <div className="grid grid-cols-8 gap-2 bg-[#141B2D] p-2 rounded-lg border border-[#1A2338] min-h-[72px]">
                  {phases.map(phase => {
                    const evt = layerEvents.find(e => e.phase === phase);

                    return (
                      <DropTarget
                        key={phase}
                        accepts={['scene', 'character', 'plot_thread']}
                        label={`Phase ${phase} ${layer}`}
                        onDrop={(payload: DragPayload) => {
                          const title = payload.data?.title || payload.data?.name || payload.id;
                          const newEvt: TimelineEvent = {
                            id: `evt_${Date.now()}`,
                            timestampLabel: `Cycle 289.0${phase}`,
                            phase,
                            layer,
                            description: `Linked ${payload.type}: ${title}`,
                            involvedCharIds: payload.type === 'character' ? [payload.id] : [],
                            conflictStatus: 'Valid'
                          };
                          if (onUpdateEvents) {
                            onUpdateEvents([...events, newEvt]);
                          }
                        }}
                        className="relative flex flex-col justify-center min-h-[60px]"
                      >
                        {evt ? (
                          <div
                            onClick={(e) => handleOpenEdit(evt, e)}
                            className={`p-2 rounded-lg border text-xs space-y-1 shadow-md transition-all cursor-pointer group hover:scale-[1.02] ${
                              evt.conflictStatus === 'Violation'
                                ? 'bg-rose-950/80 border-rose-600 text-rose-200 animate-pulse'
                                : 'bg-[#0B1020] border-indigo-500/60 text-slate-200 hover:border-indigo-400'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-indigo-400 font-bold">{evt.timestampLabel}</span>
                              <div className="flex items-center gap-1">
                                {evt.conflictStatus === 'Violation' && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" title={evt.violationDetails} />
                                )}
                                <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="text-[11px] leading-tight font-medium truncate">
                              {evt.description}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAdd(phase, layer)}
                            className="h-full border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 rounded flex items-center justify-center text-slate-700 hover:text-indigo-400 text-[10px] font-mono transition-colors p-2"
                            title={`Add ${layer} event at Phase 0${phase}`}
                          >
                            + ADD
                          </button>
                        )}
                      </DropTarget>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding/editing timeline event */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-indigo-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {editingEvent ? 'EDIT TIMELINE EVENT' : 'ADD TIMELINE EVENT'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">Phase (1-8)</label>
                  <select
                    value={formData.phase}
                    onChange={e => setFormData({ ...formData, phase: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {phases.map(p => (
                      <option key={p} value={p}>Phase 0{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">Track Layer</label>
                  <select
                    value={formData.layer}
                    onChange={e => setFormData({ ...formData, layer: e.target.value as TimelineLayer })}
                    className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {layers.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Timestamp Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cycle 289.15"
                  value={formData.timestampLabel}
                  onChange={e => setFormData({ ...formData, timestampLabel: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Event Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the chronological event..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Continuity Status</label>
                <select
                  value={formData.conflictStatus}
                  onChange={e => setFormData({ ...formData, conflictStatus: e.target.value as 'Valid' | 'Violation' })}
                  className="w-full bg-[#0B1020] border border-[#1A2338] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Valid">Valid (No Violation)</option>
                  <option value="Violation">Violation (Flagged Conflict)</option>
                </select>
              </div>

              {formData.conflictStatus === 'Violation' && (
                <div>
                  <label className="block text-rose-400 font-mono text-[11px] mb-1">Violation Details</label>
                  <input
                    type="text"
                    placeholder="Describe the temporal or spatial paradox..."
                    value={formData.violationDetails}
                    onChange={e => setFormData({ ...formData, violationDetails: e.target.value })}
                    className="w-full bg-[#0B1020] border border-rose-800 rounded-lg px-3 py-2 text-rose-200 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#1A2338]">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-mono text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Event</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-bold font-mono transition-colors"
                  >
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
