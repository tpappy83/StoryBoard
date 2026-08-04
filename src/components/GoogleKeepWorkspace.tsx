import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  RefreshCw,
  Search,
  Tag,
  CheckCircle,
  ExternalLink,
  Lock,
  Sparkles,
  Share2,
  BookOpen,
  KeyRound,
  Layers,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import {
  initKeepAuth,
  signInWithGoogleKeep,
  getKeepAccessToken,
  logoutKeep,
  fetchKeepNotes,
  createKeepNote,
  deleteKeepNote,
  KeepNote
} from '../lib/keepService';
import { SetupEvent, PayoffEvent } from '../types/setupPayoff';
import { CanonFact, PlotThread, Scene } from '../types';

interface GoogleKeepWorkspaceProps {
  setups?: SetupEvent[];
  payoffs?: PayoffEvent[];
  canonFacts?: CanonFact[];
  plotThreads?: PlotThread[];
  scenes?: Scene[];
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleKeepWorkspace: React.FC<GoogleKeepWorkspaceProps> = ({
  setups = [],
  payoffs = [],
  canonFacts = [],
  plotThreads = [],
  scenes = [],
  isOpen,
  onClose
}) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // New Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  // Confirmation modal state for destructive operations
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(
    null
  );
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initKeepAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        setIsLoadingAuth(false);
        loadNotes(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
        loadNotes(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadNotes = async (token: string | null = accessToken) => {
    try {
      const fetched = await fetchKeepNotes(token);
      setNotes(fetched);
    } catch (e) {
      console.error('Failed to load notes:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogleKeep();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await loadNotes(res.accessToken);
      }
    } catch (err) {
      console.error('Google Keep login failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutKeep();
    setUser(null);
    setAccessToken(null);
    await loadNotes(null);
  };

  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newBody.trim()) return;

    const created = await createKeepNote(accessToken, {
      title: newTitle || 'Untitled Note',
      body: newBody,
      labels: [newCategory],
      color: 'indigo'
    });

    setNotes(prev => [created, ...prev]);
    setNewTitle('');
    setNewBody('');
    setIsCreatingNote(false);
    showExportToast('Note created and saved to Google Keep workspace');
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteNoteId) return;
    await deleteKeepNote(accessToken, confirmDeleteNoteId);
    setNotes(prev => prev.filter(n => n.id !== confirmDeleteNoteId));
    setConfirmDeleteNoteId(null);
    showExportToast('Note deleted successfully');
  };

  const showExportToast = (msg: string) => {
    setExportSuccessMsg(msg);
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  // Quick Export Helpers to Push Narrative Obligations to Keep
  const exportSetupsToKeep = async () => {
    if (setups.length === 0) return;
    const bodyContent = setups
      .map(
        (s, idx) =>
          `${idx + 1}. [${s.status.toUpperCase()}] ${s.title}\n   Type: ${s.setupType} | Importance: ${s.importance}/10\n   Introduced: Ch.${s.introducedChapterId || 1}\n   Description: ${s.description}`
      )
      .join('\n\n');

    const created = await createKeepNote(accessToken, {
      title: '📌 Narrative Setups & Foreshadowing Ledger',
      body: bodyContent,
      labels: ['Setups', 'Manuscript'],
      isPinned: true
    });

    setNotes(prev => [created, ...prev]);
    showExportToast(`Exported ${setups.length} setups to Google Keep`);
  };

  const exportCanonFactsToKeep = async () => {
    if (canonFacts.length === 0) return;
    const bodyContent = canonFacts
      .map(
        (cf, idx) =>
          `${idx + 1}. ${cf.statement}\n   Category: ${cf.category} | Strictness: ${cf.strictnessLevel}`
      )
      .join('\n\n');

    const created = await createKeepNote(accessToken, {
      title: '📜 Canon World Rules & Immutable Facts',
      body: bodyContent,
      labels: ['Canon', 'Rules'],
      isPinned: true
    });

    setNotes(prev => [created, ...prev]);
    showExportToast(`Exported ${canonFacts.length} canon facts to Google Keep`);
  };

  const exportScenesToKeep = async () => {
    if (scenes.length === 0) return;
    const bodyContent = scenes
      .map(
        (sc, idx) =>
          `Scene ${sc.sequenceNumber || idx + 1}: ${sc.title}\nChapter: ${sc.chapterId} | Act: ${sc.actId}\nSummary: ${sc.summary}`
      )
      .join('\n\n');

    const created = await createKeepNote(accessToken, {
      title: '🎬 Scene Outlines & Manuscript Beats',
      body: bodyContent,
      labels: ['Scenes', 'Outline']
    });

    setNotes(prev => [created, ...prev]);
    showExportToast(`Exported ${scenes.length} scene outlines to Google Keep`);
  };

  if (!isOpen) return null;

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === 'all' || (n.labels && n.labels.includes(selectedTag));
    return matchesQuery && matchesTag;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="bg-[#141B2D] border border-amber-500/40 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-[#0B1020] border-b border-[#1A2338] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
                  GOOGLE KEEP NARRATIVE WORKSPACE
                </h2>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  {accessToken ? 'GOOGLE ACCOUNT CONNECTED' : 'LOCAL WORKSPACE SYNC'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sync setups, foreshadowing, world rules, and scene outlines directly with your Google Keep account.
              </p>
            </div>
          </div>

          {/* User Auth & Close controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-[#141B2D] border border-[#1A2338] px-3 py-1.5 rounded-xl">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono">Google Keep Active</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-red-400 font-mono px-2 py-1 bg-[#0B1020] rounded border border-[#1A2338]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Official Sign in with Google Button per Material Guidelines */
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-[#0B1020] hover:bg-[#1A2338] border border-[#1A2338] rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Search */}
        <div className="bg-[#0B1020]/60 border-b border-[#1A2338] px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
          {/* Quick Push Exports */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold text-[11px]">PUSH TO KEEP:</span>
            <button
              onClick={exportSetupsToKeep}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-all flex items-center space-x-1 font-bold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Export Setups ({setups.length})</span>
            </button>

            <button
              onClick={exportCanonFactsToKeep}
              className="px-2.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg transition-all flex items-center space-x-1 font-bold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Export Canon ({canonFacts.length})</span>
            </button>

            <button
              onClick={exportScenesToKeep}
              className="px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg transition-all flex items-center space-x-1 font-bold"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Export Outlines ({scenes.length})</span>
            </button>
          </div>

          {/* Search Bar & Add Button */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Keep notes..."
                className="w-full bg-[#141B2D] border border-[#1A2338] text-slate-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <button
              onClick={() => setIsCreatingNote(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center space-x-1 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {exportSuccessMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-200 px-6 py-2 text-xs font-mono flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{exportSuccessMsg}</span>
            </div>
            <button onClick={() => setExportSuccessMsg(null)}>✕</button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Note Creation Drawer */}
          {isCreatingNote && (
            <form
              onSubmit={handleCreateNoteSubmit}
              className="bg-[#0B1020] border border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#1A2338] pb-2">
                <h3 className="text-xs font-bold font-mono text-amber-300 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>CREATE NEW GOOGLE KEEP NOTE</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="md:col-span-2 bg-[#141B2D] border border-[#1A2338] text-slate-100 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
                />
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-[#141B2D] border border-[#1A2338] text-slate-200 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="General">General Note</option>
                  <option value="Setups">Setup / Foreshadowing</option>
                  <option value="Canon">Canon Rule</option>
                  <option value="Scenes">Scene Outline</option>
                </select>
              </div>

              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Write your note content, story idea, or narrative obligation..."
                rows={4}
                className="w-full bg-[#141B2D] border border-[#1A2338] text-slate-200 p-3 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="px-4 py-2 bg-[#141B2D] text-slate-400 hover:text-slate-200 rounded-xl text-xs font-mono border border-[#1A2338]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-all shadow"
                >
                  Save to Keep
                </button>
              </div>
            </form>
          )}

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`bg-[#0B1020] border rounded-2xl p-4 space-y-3 transition-all hover:border-amber-500/50 flex flex-col justify-between shadow-lg relative group ${
                    note.isPinned
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-[#1A2338]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-100 font-mono line-clamp-2">
                        {note.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {note.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                        <button
                          onClick={() => setConfirmDeleteNoteId(note.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed line-clamp-6">
                      {note.body}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1A2338] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      {note.labels?.map((label, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0B1020] border border-[#1A2338] rounded-2xl p-12 text-center space-y-3 font-mono">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">NO KEEP NOTES FOUND</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No matching Google Keep notes found. Click &quot;New Note&quot; or use the export buttons above to sync your narrative setups, canon rules, and outlines to Google Keep.
              </p>
            </div>
          )}
        </div>

        {/* Destructive Operation Confirmation Modal */}
        {confirmDeleteNoteId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141B2D] border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans text-slate-200">
              <div className="flex items-center space-x-3 text-red-400 border-b border-[#1A2338] pb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold font-mono">
                  CONFIRM NOTE DELETION
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Are you sure you want to delete this Google Keep note? This action will permanently remove the note from your workspace storage.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setConfirmDeleteNoteId(null)}
                  className="px-4 py-2 bg-[#0B1020] hover:bg-[#1A2338] text-slate-300 rounded-xl font-mono text-xs border border-[#1A2338]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl font-mono text-xs shadow"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
