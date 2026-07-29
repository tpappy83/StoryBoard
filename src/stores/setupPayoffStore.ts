import { create } from "zustand";
import { SetupEvent, PayoffEvent, SetupStatus } from "../types/setupPayoff";
import { INITIAL_SETUPS, INITIAL_PAYOFFS } from "../data/initialData";

interface SetupPayoffState {
  setups: SetupEvent[];
  payoffs: PayoffEvent[];

  createSetup: (setup: SetupEvent) => void;
  createPayoff: (payoff: PayoffEvent) => void;
  resolveSetup: (setupId: string, payoffId: string) => void;
  createPayoffAndResolve: (setupId: string, payoff: PayoffEvent) => void;
  deleteSetup: (setupId: string) => void;
  deletePayoff: (payoffId: string) => void;
  updateSetupStatus: (setupId: string, status: SetupStatus) => void;
  setInitialState: (setups: SetupEvent[], payoffs: PayoffEvent[]) => void;
}

const defaultSetups: SetupEvent[] = INITIAL_SETUPS;
const defaultPayoffs: PayoffEvent[] = INITIAL_PAYOFFS;

export const useSetupPayoffStore = create<SetupPayoffState>((set) => ({
  setups: defaultSetups,
  payoffs: defaultPayoffs,

  createSetup: (setup) =>
    set((state) => ({
      setups: [setup, ...state.setups]
    })),

  createPayoff: (payoff) =>
    set((state) => ({
      payoffs: [payoff, ...state.payoffs]
    })),

  resolveSetup: (setupId, payoffId) =>
    set((state) => ({
      setups: state.setups.map((s) =>
        s.id === setupId
          ? {
              ...s,
              status: "resolved",
              linkedPayoffIds: s.linkedPayoffIds.includes(payoffId)
                ? s.linkedPayoffIds
                : [...s.linkedPayoffIds, payoffId]
            }
          : s
      )
    })),

  createPayoffAndResolve: (setupId, payoff) =>
    set((state) => ({
      payoffs: [payoff, ...state.payoffs],
      setups: state.setups.map((s) =>
        s.id === setupId
          ? {
              ...s,
              status: "resolved",
              linkedPayoffIds: s.linkedPayoffIds.includes(payoff.id)
                ? s.linkedPayoffIds
                : [...s.linkedPayoffIds, payoff.id]
            }
          : s
      )
    })),

  deleteSetup: (setupId) =>
    set((state) => ({
      setups: state.setups.filter((s) => s.id !== setupId)
    })),

  deletePayoff: (payoffId) =>
    set((state) => ({
      payoffs: state.payoffs.filter((p) => p.id !== payoffId),
      setups: state.setups.map((s) => ({
        ...s,
        linkedPayoffIds: s.linkedPayoffIds.filter((id) => id !== payoffId),
        status: s.linkedPayoffIds.filter((id) => id !== payoffId).length === 0 && s.status === 'resolved' ? 'open' : s.status
      }))
    })),

  updateSetupStatus: (setupId, status) =>
    set((state) => ({
      setups: state.setups.map((s) => (s.id === setupId ? { ...s, status } : s))
    })),

  setInitialState: (setups, payoffs) =>
    set(() => ({
      setups: setups && setups.length ? setups : defaultSetups,
      payoffs: payoffs && payoffs.length ? payoffs : defaultPayoffs
    }))
}));
