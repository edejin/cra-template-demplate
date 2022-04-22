import {GetState, SetState, StateCreator, StoreApi} from 'zustand';
import {log} from '@/utils/index';


export const logMiddleware = <T extends {}>(config: StateCreator<T>) => (
  set: SetState<T>,
  get: GetState<T>,
  store: StoreApi<T>,
  $$storeMutations: any
) => config(args => {
  log('  applying', args);
  set(args);
  log('  new state', get());
}, get, store, $$storeMutations);
