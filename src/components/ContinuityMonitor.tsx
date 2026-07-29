import React, { useState } from 'react';
import { Character, ContinuityViolation } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Wrench,
  HeartHandshake,
  Sliders,
  Sparkles,
  RefreshCw,
  MessageSquarePlus,
  Zap,
  Info,
  Check
} from 'lucide-react';

interface ContinuityMonitorProps {
  continuityScore: number;
  violations: ContinuityViolation[];
  characters?: Character[];
  onRunAudit: () => void;
  onResolveViolation: (id: string) => void;
  onUpdateCharacter?: (character: Character) => void;
  isAuditing?: boolean;
}

export interface PersonalityContradictionResult {
  character: Character;
  divergenceScore: number; // 0 to 100%
  isExceedingThreshold: boolean;
  reasons: string[];
  suggestedAction: string;
}

export const ContinuityMonitor: React.FC<ContinuityMonitorProps> = ({
  continuityScore,
  violations,
  characters = [],
  onRunAudit,
  onResolveViolation,
  onUpdateCharacter,
  isAuditing = false
}) => {
  const unresolved = violations.filter(v => !v.resolved);

  // Real-time threshold setting for Emotional vs Personality divergence (default 50%)
  const [varianceThreshold, setVarianceThreshold] = useState<number>(50);
  const [approvedArcShifts, setApprovedArcShifts] = useState<Record<string, boolean>>({});
  const [justificationNotes, setJustificationNotes] = useState<Record<string, string>>({});
  const [editingNoteForChar, setEditingNoteForChar] = useState<string | null>(null);
  const [tempNoteInput, setTempNoteInput] = useState<string>('');

  // Function to analyze a character's emotional state against personality traits
  const analyzePersonalityContradiction = (char: Character): PersonalityContradictionResult => {
    let score = 0;
    const reasons: string[] = [];

    const personalityLower = (char.personality || '').toLowerCase();
    const traitsLower = (char.traits || []).join(' ').toLowerCase();
    const moodLower = (char.emotionalState?.mood || '').toLowerCase();
    const emoScore = char.emotionalState?.score ?? 50;
    const vector = char.emotionalVector || { hope: 50, fear: 50, anger: 50, trust: 50, confidence: 50 };

    const isStoicOrTactical =
      personalityLower.includes('stoic') ||
      personalityLower.includes('pragmatic') ||
      personalityLower.includes('strategist') ||
      personalityLower.includes('calculating') ||
      traitsLower.includes('tactical') ||
      traitsLower.includes('resilient');

    const isVeteranOrConfident =
      personalityLower.includes('hardened') ||
      personalityLower.includes('veteran') ||
      personalityLower.includes('mastermind') ||
      traitsLower.includes('sharpshooter') ||
      traitsLower.includes('charismatic');

    const isUtilitarianOrRuthless =
      personalityLower.includes('utilitarian') ||
      personalityLower.includes('ruthless') ||
      personalityLower.includes('authoritarian') ||
      traitsLower.includes('ruthless') ||
      traitsLower.includes('visionary');

    // 1. Check Stoic/Pragmatic traits vs Panic/Fear spike
    if (isStoicOrTactical) {
      if (vector.fear > 60) {
        const diff = (vector.fear - 60) * 1.5;
        score += diff;
        reasons.push(`High fear (${vector.fear}%) contradicts established Stoic/Pragmatic traits.`);
      }
      if (moodLower.includes('panic') || moodLower.includes('desperate') || moodLower.includes('hysterical')) {
        score += 30;
        reasons.push(`Current mood "${char.emotionalState.mood}" conflicts with Resilient/Tactical baseline.`);
      }
      if (emoScore < 35) {
        score += 20;
        reasons.push(`Low overall stability (${emoScore}/100) deviates from Pragmatic Strategist baseline.`);
      }
    }

    // 2. Check Veteran/Hardened traits vs low confidence or panic
    if (isVeteranOrConfident) {
      if (vector.confidence < 40) {
        score += (45 - vector.confidence) * 1.2;
        reasons.push(`Low confidence (${vector.confidence}%) violates Battle-hardened / Mastermind baseline.`);
      }
      if (vector.fear > 65) {
        score += 25;
        reasons.push(`Elevated fear (${vector.fear}%) spikes past Veteran trauma tolerance.`);
      }
    }

    // 3. Check Ruthless/Utilitarian vs Sentimental / Sympathetic state
    if (isUtilitarianOrRuthless) {
      if (moodLower.includes('sentimental') || moodLower.includes('sympathetic') || moodLower.includes('remorseful')) {
        score += 35;
        reasons.push(`Mood "${char.emotionalState.mood}" contradicts Utilitarian / Ruthless directive.`);
      }
      if (vector.trust > 75) {
        score += 20;
        reasons.push(`High trust (${vector.trust}%) conflicts with Suspicious / Paranoid archetype.`);
      }
    }

    // 4. Emotional Score vs Vector Mismatch
    if (Math.abs(vector.anger - vector.trust) > 70 && emoScore > 80) {
      score += 15;
      reasons.push(`Severe internal vector disparity (Anger ${vector.anger}% vs Trust ${vector.trust}%) creates volatile tension.`);
    }

    // Clamp score to max 100
    const finalScore = Math.min(100, Math.round(score));
    const isApproved = !!approvedArcShifts[char.id];
    const isExceeding = finalScore >= varianceThreshold && !isApproved;

    let suggestedAction = 'Emotional state aligns with character baseline.';
    if (isExceeding) {
      suggestedAction = `Emotional variance (${finalScore}%) exceeds set threshold (${varianceThreshold}%). Prompt review for explicit narrative event justification or recalibrate baseline.`;
    } else if (isApproved) {
      suggestedAction = 'Emotional divergence approved as intentional character arc milestone.';
    }

    return {
      character: char,
      divergenceScore: finalScore,
      isExceedingThreshold: isExceeding,
      reasons,
      suggestedAction
    };
  };

  const characterAnalysis = characters.map(analyzePersonalityContradiction);
  const flaggedCharacters = characterAnalysis.filter(a => a.isExceedingThreshold);

  const handleApproveShift = (charId: string) => {
    setApprovedArcShifts(prev => ({ ...prev, [charId]: !prev[charId] }));
  };

  const handleRecalibrateBaseline = (char: Character) => {
    if (!onUpdateCharacter) return;
    const updated: Character = {
      ...char,
      emotionalState: {
        score: Math.min(85, Math.max(60, char.emotionalState.score)),
        mood: 'Calm / Focused'
      },
      emotionalVector: char.emotionalVector ? {
        ...char.emotionalVector,
        fear: Math.min(35, char.emotionalVector.fear),
        anger: Math.min(40, char.emotionalVector.anger),
        confidence: Math.max(70, char.emotionalVector.confidence)
      } : undefined
    };
    onUpdateCharacter(updated);
  };

  const handleSaveJustificationNote = (charId: string) => {
    if (tempNoteInput.trim()) {
      setJustificationNotes(prev => ({ ...prev, [charId]: tempNoteInput.trim() }));
    }
    setEditingNoteForChar(null);
    setTempNoteInput('');
  };

  const handleSimulateEmotionalSurge = (char: Character) => {
    if (!onUpdateCharacter) return;
    const isSpiked = char.emotionalState.mood.includes('Panicked') || (char.emotionalVector?.fear || 0) > 70;
    const updated: Character = {
      ...char,
      emotionalState: {
        score: isSpiked ? 75 : 30,
        mood: isSpiked ? 'Stressed / Determined' : 'Panicked / Hysterical'
      },
      emotionalVector: {
        hope: isSpiked ? 70 : 25,
        fear: isSpiked ? 30 : 85,
        anger: isSpiked ? 25 : 75,
        trust: isSpiked ? 65 : 20,
        confidence: isSpiked ? 80 : 30
      }
    };
    onUpdateCharacter(updated);
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-600/20 text-rose-400 p-2 rounded-lg border border-rose-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              CONTINUITY & CONSTRAINT ENGINE
              <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                AUDIT METERS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic & semantic verification for spatial teleportation, knowledge paradoxes, and emotional state contradictions.
            </p>
          </div>
        </div>

        <button
          onClick={onRunAudit}
          disabled={isAuditing}
          className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <RotateCcw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'AUDITING CONTINUITY...' : 'RE-AUDIT CONTINUITY NOW'}</span>
        </button>
      </div>

      {/* Continuity Score & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B1020] p-4 rounded-xl border border-[#1A2338] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">CONTINUITY INTEGRITY SCORE</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{continuityScore}%</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400 text-sm">
            {continuityScore}%
          </div>
        </div>

        <div className="bg-[#0B1020] p-4 rounded-xl border border-[#1A2338] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">ACTIVE UNRESOLVED ISSUES</div>
            <div className="text-2xl font-mono font-bold text-rose-400 mt-1">{unresolved.length}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        <div className="bg-[#0B1020] p-4 rounded-xl border border-[#1A2338] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">FLAGGED EMOTIONAL DISCREPANCIES</div>
            <div className={`text-2xl font-mono font-bold mt-1 ${flaggedCharacters.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {flaggedCharacters.length}
            </div>
          </div>
          <HeartHandshake className={`w-8 h-8 ${flaggedCharacters.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Real-Time Character EmotionalState vs Personality Trait Contradiction Inspector */}
      {characters.length > 0 && (
        <div className="bg-[#0B1020] border border-amber-900/40 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2338] pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                REAL-TIME EMOTIONAL STATE VS. PERSONALITY CONTRADICTION MONITOR
              </h3>
            </div>

            {/* Threshold Slider Control */}
            <div className="flex items-center space-x-3 bg-[#141B2D] px-3 py-1.5 rounded-lg border border-[#1A2338]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Divergence Tolerance:</span>
              <input
                type="range"
                min="20"
                max="85"
                step="5"
                value={varianceThreshold}
                onChange={e => setVarianceThreshold(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-8 text-right">
                {varianceThreshold}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Continuously evaluates active characters to detect when their current emotional state or mood vector diverges from established personality traits. Divergences exceeding <strong className="text-amber-400 font-mono">{varianceThreshold}%</strong> require explicit narrative justification or review.
          </p>

          {/* Character Analysis Cards */}
          <div className="space-y-3">
            {characterAnalysis.map(({ character, divergenceScore, isExceedingThreshold, reasons, suggestedAction }) => {
              const isApproved = !!approvedArcShifts[character.id];
              const note = justificationNotes[character.id];

              return (
                <div
                  key={character.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isExceedingThreshold
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                      : isApproved
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-[#141B2D] border-[#1A2338]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {character.portraitUrl ? (
                        <img
                          src={character.portraitUrl}
                          alt={character.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#1A2338]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold font-mono text-slate-300">
                          {character.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-100">{character.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {character.role}
                          </span>
                          {isExceedingThreshold && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              DISCREPANCY FLAGGED
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              ARC SHIFT APPROVED
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 mt-1">
                          <strong className="text-slate-300">Personality:</strong> "{character.personality}"
                        </div>
                      </div>
                    </div>

                    {/* Divergence Meter */}
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Divergence Index:</span>
                        <span
                          className={`text-sm font-mono font-bold ${
                            divergenceScore >= varianceThreshold
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {divergenceScore}%
                        </span>
                      </div>
                      <div className="w-28 h-2 bg-[#0B1020] rounded-full overflow-hidden border border-[#1A2338] mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            divergenceScore >= varianceThreshold
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${divergenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emotional State vs Traits Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#1A2338]/60 text-xs">
                    <div className="bg-[#0B1020] p-2 rounded-lg border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-slate-500 block">CURRENT MOOD & STABILITY:</span>
                      <span className="font-bold text-slate-200">{character.emotionalState.mood}</span>
                      <span className="text-slate-400 ml-2 font-mono">({character.emotionalState.score}/100)</span>
                    </div>

                    <div className="bg-[#0B1020] p-2 rounded-lg border border-[#1A2338]">
                      <span className="text-[10px] font-mono text-slate-500 block">ESTABLISHED TRAITS:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(character.traits || []).map((t, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contradiction Reasons */}
                  {reasons.length > 0 && (
                    <div className="mt-2.5 p-2 rounded-lg bg-[#0B1020] border border-amber-900/30 text-[11px] text-amber-200 space-y-1">
                      <div className="font-mono text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-400" />
                        CONTRADICTION ANALYSIS DETAILS:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {reasons.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Justification Note if attached */}
                  {note && (
                    <div className="mt-2 p-2 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start space-x-2">
                      <MessageSquarePlus className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-mono text-[10px] uppercase text-indigo-300 block">NARRATIVE JUSTIFICATION NOTE:</strong>
                        <span>"{note}"</span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Review */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#1A2338]">
                    <div className="text-[11px] text-slate-400 italic">
                      {suggestedAction}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Simulate Mood Spike / Test Shift */}
                      <button
                        onClick={() => handleSimulateEmotionalSurge(character)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors flex items-center space-x-1"
                        title="Toggle character's emotional state to test threshold flagging in real time"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Simulate Mood Shift</span>
                      </button>

                      {/* Add Justification Note */}
                      <button
                        onClick={() => {
                          setEditingNoteForChar(character.id);
                          setTempNoteInput(justificationNotes[character.id] || '');
                        }}
                        className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded border border-indigo-500/40 text-[11px] font-mono transition-colors flex items-center space-x-1"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        <span>{note ? 'Edit Note' : '+ Add Note'}</span>
                      </button>

                      {/* Recalibrate Baseline */}
                      {onUpdateCharacter && (
                        <button
                          onClick={() => handleRecalibrateBaseline(character)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] font-mono transition-colors flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3 text-sky-400" />
                          <span>Recalibrate Baseline</span>
                        </button>
                      )}

                      {/* Approve Arc Shift */}
                      <button
                        onClick={() => handleApproveShift(character.id)}
                        className={`px-3 py-1 rounded text-[11px] font-bold font-mono transition-colors flex items-center space-x-1 ${
                          isApproved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isApproved ? 'Arc Shift Approved' : 'Approve Arc Shift'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Note Input Box */}
                  {editingNoteForChar === character.id && (
                    <div className="mt-3 p-3 bg-[#0B1020] border border-indigo-500/40 rounded-lg space-y-2">
                      <label className="block text-[11px] font-mono text-indigo-300">
                        Narrative Event Justification (e.g. "Traumatized by Sector 4 explosion in Chapter 3"):
                      </label>
                      <input
                        type="text"
                        value={tempNoteInput}
                        onChange={e => setTempNoteInput(e.target.value)}
                        placeholder="Enter story context justifying why this character's emotion temporarily diverges..."
                        className="w-full bg-[#141B2D] border border-[#1A2338] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setEditingNoteForChar(null)}
                          className="px-2.5 py-1 text-slate-400 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveJustificationNote(character.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-mono font-bold"
                        >
                          Save Justification
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Violations List */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-slate-400 font-bold uppercase">LEDGER OF CONTINUITY VIOLATIONS</div>
        {unresolved.map(viol => (
          <div key={viol.id} className="bg-[#0B1020] p-4 rounded-xl border border-rose-900/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-950/80 pb-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-800">
                  {viol.severity.toUpperCase()} SEVERITY
                </span>
                <span className="font-bold text-xs text-rose-200">{viol.ruleName}</span>
              </div>

              <button
                onClick={() => onResolveViolation(viol.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded border border-emerald-500/50 text-xs font-semibold transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MARK RESOLVED</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {viol.details}
            </p>

            <div className="p-2.5 rounded-lg bg-[#141B2D] border border-amber-900/40 text-xs text-amber-200 flex items-start space-x-2">
              <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono text-[10px] uppercase text-amber-400 block mb-0.5">RECOMMENDED REMEDIATION:</strong>
                <span>{viol.suggestedFix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

