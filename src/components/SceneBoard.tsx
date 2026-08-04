import React, { useState } from 'react';
import { Scene, Character } from '../types';
import {
  Layers,
  LayoutGrid,
  ListFilter,
  Network,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitMerge,
  FileText,
  User,
  MapPin,
  Search,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

interface SceneBoardProps {
  scenes: Scene[];
  characters: Character[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onNewScene: (padIndex?: number) => void;
}

type SceneViewMode = 'board' | 'list' | 'graph';

export const SceneBoard: React.FC<SceneBoardProps> = ({
  scenes,
  characters,
  selectedSceneId,
  onSelectScene,
  onNewScene
}) => {
  const [viewMode, setViewMode] = useState<SceneViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredScenes = scenes.filter(scene => {
    const matchesSearch =
      scene.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || scene.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'Drafted':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Violation':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Convergence':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800/50 text-slate-400 border-slate-700/50';
    }
  };

  const getCharacterName = (id: string) => {
    return characters.find(c => c.id === id)?.name || id;
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-xl space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wider uppercase">
                SCENE DEVELOPMENT BOARD
              </h2>
              <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-bold">
                {scenes.length} SCENES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage narrative beats, character participation, state changes, and story flow.
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="bg-[#0B1020] p-1 rounded-xl border border-[#1A2338] flex items-center space-x-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                viewMode === 'graph'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Story Graph</span>
            </button>
          </div>

          <button
            onClick={() => onNewScene()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center space-x-1 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Scene</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search scenes..."
            className="w-full bg-[#0B1020] border border-[#1A2338] text-slate-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['all', 'Approved', 'Drafted', 'Pending', 'Violation', 'Convergence'].map(
            st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] capitalize transition-all ${
                  selectedStatus === st
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 font-bold'
                    : 'bg-[#0B1020] text-slate-400 border-[#1A2338] hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* View Mode Render */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredScenes.map(scene => {
            const isSelected = scene.id === selectedSceneId;
            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`bg-[#0B1020] border rounded-xl p-4 transition-all cursor-pointer space-y-3 relative group hover:border-indigo-500/50 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg ring-1 ring-indigo-500/50'
                    : 'border-[#1A2338]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-[#141B2D] text-slate-400 px-2 py-0.5 rounded border border-[#1A2338]">
                      CH.{scene.chapter}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100 font-mono line-clamp-1">
                      {scene.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${getStatusColor(
                      scene.status
                    )}`}
                  >
                    {scene.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {scene.purpose || 'No purpose specified yet.'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#1A2338]/80 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span className="truncate max-w-[120px]">
                        {scene.location}
                      </span>
                    </span>
                    <span className="text-slate-500">{scene.wordCount || 0} words</span>
                  </div>

                  <div className="flex items-center space-x-1.5 overflow-hidden pt-1">
                    <User className="w-3 h-3 text-slate-500 shrink-0" />
                    <div className="flex items-center space-x-1 truncate">
                      {scene.participantIds.map(id => (
                        <span
                          key={id}
                          className="px-1.5 py-0.5 bg-[#141B2D] text-slate-300 rounded text-[10px] border border-[#1A2338]"
                        >
                          {getCharacterName(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141B2D] border-b border-[#1A2338] text-slate-400 text-[11px]">
                <th className="p-3">Chapter</th>
                <th className="p-3">Scene Title</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Participants</th>
                <th className="p-3 text-right">Words</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2338]">
              {filteredScenes.map(scene => (
                <tr
                  key={scene.id}
                  onClick={() => onSelectScene(scene.id)}
                  className={`cursor-pointer hover:bg-[#141B2D]/80 transition-colors ${
                    scene.id === selectedSceneId ? 'bg-indigo-950/30 font-bold' : ''
                  }`}
                >
                  <td className="p-3 text-slate-400">Ch. {scene.chapter}</td>
                  <td className="p-3 text-slate-100 font-bold">{scene.title}</td>
                  <td className="p-3 text-slate-400">{scene.location}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(
                        scene.status
                      )}`}
                    >
                      {scene.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    {scene.participantIds.map(getCharacterName).join(', ')}
                  </td>
                  <td className="p-3 text-right text-slate-400">
                    {scene.wordCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'graph' && (
        <div className="bg-[#0B1020] border border-[#1A2338] rounded-xl p-6 min-h-[280px] flex items-center justify-center font-mono">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {filteredScenes.map((scene, idx) => (
              <React.Fragment key={scene.id}>
                <div
                  onClick={() => onSelectScene(scene.id)}
                  className={`p-3 bg-[#141B2D] border rounded-xl cursor-pointer hover:border-indigo-400 transition-all text-center space-y-1 w-36 ${
                    scene.id === selectedSceneId
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'border-[#1A2338]'
                  }`}
                >
                  <div className="text-[10px] text-indigo-400 font-bold">
                    BEAT #{idx + 1}
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {scene.title}
                  </div>
                  <div className="text-[9px] text-slate-400">Ch. {scene.chapter}</div>
                </div>
                {idx < filteredScenes.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
