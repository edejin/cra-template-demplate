import create from 'zustand';
import {logMiddleware} from '@/utils/logMiddleware';
import {sleep} from '@/utils';

interface Test {
  a: number;
  b: number;
  addA: () => void;
  addAWithDelay: (d: number) => void;
  removeA: () => void;
  addB: () => void;
  clearB: () => void;
}

export const useTestStore = create<Test>(
  // On change log middleware
  logMiddleware<Test>(
    (set, get) => ({
      a: 0,
      b: 0,
      addA: () => set(state => ({a: state.a + 1})),
      removeA: () => set(state => ({a: state.a - 1})),
      addB: () => set(state => ({b: state.b + 1})),
      clearB: () => set({b: 0}),
      addAWithDelay: async (d: number) => {
        // It can be fetch
        await sleep(d);
        // `get()` return current value
        set({a: get().a + 1});
      }
    })
  )
);
