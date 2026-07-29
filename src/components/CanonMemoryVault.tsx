import React, { useState } from 'react';
import { CanonFact, CanonCategory } from '../types';
import { BookOpen, Search, ShieldCheck, Hash, Plus, CheckCircle2, Clock, Sparkles, Filter } from 'lucide-react';

interface CanonMemoryVaultProps {
  canonFacts: CanonFact[];
  onAddFact: (factText: string, category: CanonCategory) => void;
}

const CATEGORIES: CanonCategory[] = ['Lore', 'Fact', 'Rule', 'Magic', 'History'];

export const CanonMemoryVault: React.FC<CanonMemoryVaultProps> = ({
  canonFacts,
  onAddFact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [newFactText, setNewFactText] = useState('');
  const [newCategory, setNewCategory] = useState<CanonCategory>('Lore');
  const [showAddForm, setShowAddForm] = useState(false);

  const [isRecallLoading, setIsRecallLoading] = useState(false);
  const [recallResult, setRecallResult] = useState<{
    matchedFactIds: string[];
    summaryAnalysis: string;
    contradictionWarnings: string[];
  } | null>(null);

  const handleRunSemanticRecall = async () => {
    if (!searchTerm.trim()) return;
    setIsRecallLoading(true);
    try {
      const res = await fetch('/api/gemini/memory-recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm })
      });
      const data = await res.json();
      if (data.success && data.recall) {
        setRecallResult(data.recall);
      }
    } catch (e) {
      console.error('Semantic recall failed:', e);
    } finally {
      setIsRecallLoading(false);
    }
  };

  const filteredFacts = canonFacts.filter(f => {
    const matchesSearch = f.fact.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || f.category.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  const handleSubmitNewFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    onAddFact(newFactText.trim(), newCategory);
    setNewFactText('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-lg border border-emerald-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              CANON MEMORY VAULT
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                FTS & CONTENT HASH LEDGER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Authoritative story state repository with cryptographic duplicate prevention and confidence scores.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ RECORD CANON FACT</span>
        </button>
      </div>

      {/* Add Fact Form Modal/Box */}
      {showAddForm && (
        <form onSubmit={handleSubmitNewFact} className="bg-[#0B1020] p-4 rounded-xl border border-emerald-500/40 space-y-3">
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase">RECORD IMMUTABLE CANON FACT</div>
          <div className="flex flex-wrap gap-3">
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as CanonCategory)}
              className="bg-[#141B2D] text-slate-200 px-3 py-1.5 rounded border border-[#1A2338] text-xs font-mono focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="State the immutable canon fact..."
              value={newFactText}
              onChange={e => setNewFactText(e.target.value)}
              className="flex-1 bg-[#141B2D] text-slate-200 px-3 py-1.5 rounded border border-[#1A2338] text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors"
            >
              COMMIT FACT
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1020] p-2.5 rounded-xl border border-[#1A2338]">
        <div className="relative flex-1 min-w-[200px] flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search canon memory vault by keyword, lore, or hash..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#141B2D] text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-[#1A2338] text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleRunSemanticRecall}
            disabled={isRecallLoading || !searchTerm.trim()}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold font-mono transition-all flex items-center space-x-1 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRecallLoading ? 'RECALLING...' : 'SEMANTIC RECALL'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded font-mono text-[11px] ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[#141B2D] text-slate-400 hover:text-white'
            }`}
          >
            ALL ({canonFacts.length})
          </button>
          {['Lore', 'Fact', 'Rule', 'Magic', 'History'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded font-mono text-[11px] ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-[#141B2D] text-slate-400 hover:text-white'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* High-Thinking Semantic Memory Recall Output */}
      {recallResult && (
        <div className="bg-gradient-to-br from-[#0B1020] to-[#141B2D] border border-emerald-500/40 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              HIGH-THINKING CANON MEMORY SYNTHESIS
            </span>
            <button 
              onClick={() => setRecallResult(null)}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              DISMISS
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed">
            {recallResult.summaryAnalysis}
          </p>
          {recallResult.contradictionWarnings && recallResult.contradictionWarnings.length > 0 && (
            <div className="bg-rose-950/50 border border-rose-800 p-2.5 rounded-lg space-y-1">
              <div className="text-rose-400 font-bold font-mono text-[11px]">CONTRADICTION WARNINGS DETECTED</div>
              {recallResult.contradictionWarnings.map((warn, i) => (
                <div key={i} className="text-rose-200 text-[11px]">• {warn}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredFacts.map(fact => (
          <div key={fact.id} className="bg-[#0B1020] p-3.5 rounded-xl border border-[#1A2338] space-y-2 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                [{fact.category}]
              </span>
              <span className="flex items-center text-slate-400 font-mono">
                <Hash className="w-3 h-3 text-slate-500 mr-0.5" />
                {fact.contentHash}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {fact.fact}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-[#1A2338]/60">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> CONFIDENCE {fact.confidence}%
              </span>
              <span>Logged {fact.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
