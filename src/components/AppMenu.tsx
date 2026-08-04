import React, { useRef, useEffect } from 'react';
import { Menu, Save, FolderOpen, Download, Settings, Palette, User, LogOut, Cloud, DatabaseBackup, PlusSquare, FileEdit, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';

export const AppMenu: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, userProfile, signIn, signOut } = useAuthStore();
  
  const {
    isSettingsMenuOpen,
    toggleSettingsMenu,
    cloudSyncStatus,
    saveProject,
    loadProject,
    saveProjectAs,
    exportProject,
    openProjectSettings,
    openAppSettings,
    openThemeSettings,
    openAccountSettings,
    createBackup,
    restoreBackup,
    syncToCloud
  } = useSettingsStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isSettingsMenuOpen) {
        toggleSettingsMenu();
      }
    };
    if (isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsMenuOpen, toggleSettingsMenu]);

  const handleAction = (action: () => void) => {
    action();
    toggleSettingsMenu();
  };

  return (
    <div className="relative font-mono" ref={menuRef}>
      <button
        onClick={toggleSettingsMenu}
        className={`p-1.5 border rounded-md transition-all shrink-0 flex items-center justify-center ${
          isSettingsMenuOpen 
            ? 'bg-[#000000] border-[#F2C94C] text-[#F2C94C]' 
            : 'bg-[#000000] text-[#C4C4C4] hover:text-[#F2C94C] hover:bg-[#0A2A43] border-[#153B5C]'
        }`}
        title="Application Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div 
        className={`absolute right-0 top-full mt-2 w-72 bg-[#0A2A43] border border-[#153B5C] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-[160ms] ease-[cubic-bezier(0.2,0.8,0.0,1.0)] origin-top-right ${
          isSettingsMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Auth Section */}
        <div className="bg-[#000000] p-4 border-b border-[#153B5C]">
          {isAuthenticated && userProfile ? (
            <div className="flex items-center space-x-3">
              <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-10 h-10 rounded-full border-2 border-[#153B5C] bg-[#0A2A43]" />
              <div className="flex flex-col flex-1 truncate">
                <span className="text-sm font-bold text-white truncate">{userProfile.name}</span>
                <span className="text-[10px] text-[#C4C4C4] truncate">{userProfile.email}</span>
              </div>
              {cloudSyncStatus === 'synced' && (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" title="Cloud Synced" />
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-bold text-[#C4C4C4] uppercase tracking-wider mb-1">Sign In</span>
              <button onClick={() => { signIn('google'); toggleSettingsMenu(); }} className="flex items-center justify-center space-x-2 bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                <User className="w-3.5 h-3.5" /> <span>Continue with Google</span>
              </button>
              <button onClick={() => { signIn('microsoft'); toggleSettingsMenu(); }} className="flex items-center justify-center space-x-2 bg-[#00A4EF] text-white hover:bg-[#0078D7] px-3 py-1.5 rounded text-xs font-bold transition-colors">
                <User className="w-3.5 h-3.5" /> <span>Continue with Microsoft</span>
              </button>
            </div>
          )}
        </div>

        <div className="py-2 flex flex-col overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {/* File Operations */}
          <div className="px-3 py-1 text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider">File</div>
          <button onClick={() => handleAction(saveProject)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <Save className="w-3.5 h-3.5 text-[#F2C94C]" /> <span>Save Project</span>
          </button>
          <button onClick={() => handleAction(() => loadProject())} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" /> <span>Load Project</span>
          </button>
          <button onClick={() => handleAction(() => saveProjectAs('New Project'))} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> <span>Save As...</span>
          </button>
          <button onClick={() => handleAction(() => exportProject('pdf'))} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <Download className="w-3.5 h-3.5 text-purple-400" /> <span>Export Project</span>
          </button>

          <div className="h-px bg-[#153B5C] my-2 mx-3"></div>

          {/* Settings */}
          <div className="px-3 py-1 text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider">Settings</div>
          <button onClick={() => handleAction(openProjectSettings)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <FileEdit className="w-3.5 h-3.5 text-slate-400" /> <span>Edit Project Settings</span>
          </button>
          <button onClick={() => handleAction(openAppSettings)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <Settings className="w-3.5 h-3.5 text-slate-400" /> <span>Application Settings</span>
          </button>
          <button onClick={() => handleAction(openThemeSettings)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
            <Palette className="w-3.5 h-3.5 text-slate-400" /> <span>Theme & UI Preferences</span>
          </button>

          <div className="h-px bg-[#153B5C] my-2 mx-3"></div>

          {/* Cloud & Account */}
          <div className="px-3 py-1 text-[10px] font-bold text-[#C4C4C4] uppercase tracking-wider">Cloud & Account</div>
          {isAuthenticated ? (
            <>
              <button onClick={() => handleAction(openAccountSettings)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
                <User className="w-3.5 h-3.5 text-sky-400" /> <span>Account & Authentication</span>
              </button>
              <button onClick={() => handleAction(syncToCloud)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
                <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'text-amber-400 animate-pulse' : 'text-sky-400'}`} /> 
                <span>{cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync to Cloud'}</span>
              </button>
              <button onClick={() => handleAction(createBackup)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-[#0E3859] text-slate-200 hover:text-white transition-colors w-full text-left text-xs">
                <DatabaseBackup className="w-3.5 h-3.5 text-emerald-400" /> <span>Backup & Restore</span>
              </button>
              <button onClick={() => handleAction(signOut)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 transition-colors w-full text-left text-xs mt-1">
                <LogOut className="w-3.5 h-3.5 text-rose-400" /> <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="px-4 py-2 text-[11px] text-slate-500 italic flex items-center space-x-2">
              <Cloud className="w-3 h-3" />
              <span>Sign in to access cloud features</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
