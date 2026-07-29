import React, { useState } from 'react';
import { Radio, Sparkles, User, MapPin, Activity, Clock } from 'lucide-react';
import { Character, OffscreenSimTick } from '../types';

interface OffscreenSimulatorProps {
  characters: Character[];
}

export const OffscreenSimulator: React.FC<OffscreenSimulatorProps> = ({ characters }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTicks, setSimTicks] = useState<OffscreenSimTick[]>([
    {
      id: 'tick_1',
      charId: 'char_council',
      charName: 'Citadel High Council',
      currentLocation: 'Citadel Inner Sanctum',
      offscreenActivity: 'Authorized emergency power transfer from Sector 3 life support to Spire defense grid.',
      resultingStateChange: 'Sector 3 civil unrest score increased by +15%. Enforcer readiness at peak.',
      updatedGoalStatus: 'Active',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'tick_2',
      charId: 'char_rowan',
      charName: 'Rowan Vale',
      currentLocation: 'Surface Transit Corridor',
      offscreenActivity: 'Calibrated orbital beacon frequency to force Observatory vault door override.',
      resultingStateChange: 'Rowan’s confidence vector +5%, fear +10% regarding Ava’s arrival.',
      updatedGoalStatus: 'Active',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleRunSimulationTick = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/gemini/offscreen-simulate', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.ticks) {
        setSimTicks([...data.ticks, ...simTicks]);
      }
    } catch (e) {
      console.error('Simulation tick failed:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <span>STORY UNIVERSE BACKGROUND SIMULATOR</span>
              <span className="px-2 py-0.5 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full font-sans">Phase 11 NOS</span>
            </h2>
            <p className="text-xs text-slate-400">Off-screen characters, factions, and world states continue evolving dynamically outside active scenes</p>
          </div>
        </div>

        <button
          onClick={handleRunSimulationTick}
          disabled={isSimulating}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-rose-950"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'SIMULATING WORLD TICK...' : 'STEP UNIVERSE TICK'}</span>
        </button>
      </div>

      {/* Ticks Log */}
      <div className="space-y-2.5">
        {simTicks.map(tick => (
          <div key={tick.id} className="bg-[#1E293B]/60 border border-[#334155] p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2 text-rose-400 font-bold">
                <User className="w-3.5 h-3.5" />
                <span>{tick.charName}</span>
                <span className="text-slate-500">•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">{tick.currentLocation}</span>
              </div>
              <span className="text-slate-400 text-[10px] flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{tick.timestamp}</span>
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed font-sans">
              <strong className="text-slate-400 font-mono text-[11px] mr-1">OFF-SCREEN ACTIVITY:</strong>
              {tick.offscreenActivity}
            </p>

            <div className="bg-[#0F172A] border border-slate-700/60 p-2 rounded-lg text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 flex-shrink-0" />
              <span>RESULTING STATE CHANGE: {tick.resultingStateChange}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
