import React, { useState, useRef } from 'react';
import { Character, CharacterStatus } from '../types';
import { User, Shield, Key, Target, Heart, Award, Eye, EyeOff, Plus, Edit3, Lock, Camera } from 'lucide-react';


interface CharacterIntelligenceProps {
  characters: Character[];
  selectedCharId: string | null;
  onSelectCharacter: (charId: string) => void;
  onUpdateCharacter: (char: Character) => void;
  onAddCharacter: () => void;
}

export const CharacterIntelligence: React.FC<CharacterIntelligenceProps> = ({
  characters,
  selectedCharId,
  onSelectCharacter,
  onUpdateCharacter,
  onAddCharacter
}) => {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const activeChar = characters.find(c => c.id === selectedCharId) || characters[0];

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChar) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to save Firestore space
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPreviewPhotoUrl(dataUrl);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSecrets = (charId: string) => {
    setShowSecrets(prev => ({ ...prev, [charId]: !prev[charId] }));
  };

  const getStatusBadge = (status: CharacterStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'Deceased': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'Missing': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'Captured': return 'bg-purple-950 text-purple-400 border-purple-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <>

      {/* Photo Preview Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141B2D] border border-indigo-500/50 rounded-xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Confirm Portrait Update</h3>
            <p className="text-xs text-slate-400">Are you sure you want to update {activeChar?.name}'s portrait with this image?</p>
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-indigo-500/50">
              <img src={previewPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-3 w-full pt-2">
              <button
                onClick={() => {
                  setPreviewPhotoUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition-colors"
              >
                RETAKE
              </button>
              <button
                onClick={() => {
                  if (activeChar) {
                    onUpdateCharacter({ ...activeChar, portraitUrl: previewPhotoUrl });
                  }
                  setPreviewPhotoUrl(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                CONFIRM UPDATE
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg border border-indigo-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              CHARACTER INTELLIGENCE CENTER
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                PSYCHOLOGICAL DOSSIER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              RPG-style character metrics, secret knowledge, emotional state monitors, and arc progression.
            </p>
          </div>
        </div>

        <button
          onClick={onAddCharacter}
          className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ NEW CHARACTER</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Character Roster Selector */}
        <div className="space-y-2 bg-[#0B1020] p-3 rounded-xl border border-[#1A2338] overflow-y-auto max-h-96">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-2">CHARACTER ROSTER</div>
          {characters.map(char => {
            const isSelected = activeChar?.id === char.id;
            return (
              <div
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-3 ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500/80 text-white shadow-md'
                    : 'bg-[#141B2D] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img
                  src={char.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={char.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                />
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{char.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getStatusBadge(char.status)}`}>
                      {char.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{char.role}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Character RPG Dossier */}
        {activeChar ? (
          <div className="md:col-span-2 bg-[#0B1020] p-4 rounded-xl border border-[#1A2338] space-y-4">
            {/* Header / Avatar */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1A2338] pb-3">
              <div className="flex items-center space-x-4">
                
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={activeChar.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={activeChar.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500/60 shadow-lg group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="user" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleCapturePhoto} 
                  />
                </div>
<div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {activeChar.name}
                    <span className="text-xs font-mono font-normal bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                      {activeChar.role}
                    </span>
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span>Status: <strong className="text-emerald-400">{activeChar.status}</strong></span>
                    <span>•</span>
                    <span>Arc Completion: <strong className="text-indigo-400">{activeChar.arcProgress}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Arc Progress Bar */}
              <div className="w-full sm:w-48 bg-[#141B2D] p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>ARC PROGRESS</span>
                  <span className="text-indigo-400 font-bold">{activeChar.arcProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" style={{ width: `${activeChar.arcProgress}%` }} />
                </div>
              </div>
            </div>

            {/* Emotional State & Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#141B2D] p-3 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> EMOTIONAL METER</span>
                  <span className="text-rose-400 font-bold">{activeChar.emotionalState.score}/100</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${activeChar.emotionalState.score}%` }} />
                </div>
                <div className="text-xs text-slate-200 font-semibold pt-1">
                  Current Mood: <span className="text-indigo-300 font-normal">{activeChar.emotionalState.mood}</span>
                </div>
              </div>

              {/* Goals */}
              <div className="bg-[#141B2D] p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> ACTIVE MOTIVATION & GOAL
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeChar.goals}
                </p>
              </div>
            </div>

            {/* Secrets Vault */}
            <div className="bg-[#141B2D] p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> CLASSIFIED SECRET KNOWLEDGE ({activeChar.secrets.length})
                </div>
                <button
                  onClick={() => toggleSecrets(activeChar.id)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {showSecrets[activeChar.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecrets[activeChar.id] ? 'Hide Secrets' : 'Reveal Secrets'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {activeChar.secrets.map((sec, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#0B1020] border border-amber-950/60 text-xs text-amber-200/90 font-mono flex items-center space-x-2">
                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>{showSecrets[activeChar.id] ? sec : '••••••••••••••••••••••••••••••••••••••••'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traits & Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-slate-400">CHARACTER TRAITS:</span>
              {activeChar.traits.map((trait, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono font-medium">
                  #{trait}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
    </>
  );
};
