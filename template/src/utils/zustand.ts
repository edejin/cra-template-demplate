import create, {GetState, SetState, StateCreator, StoreApi} from 'zustand';
import {log} from '@/utils/index';

export type Middleware<T extends {}> = (
  config: StateCreator<T>,
) => StateCreator<T>;

export const applyMiddleware = <T extends {}>(s: StateCreator<T>, middlewares: Middleware<T>[]) => create<T>(
  middlewares.reduce((a, m) => m(a), s)
);

export const logMiddleware = <T extends {}>(config: StateCreator<T>) => (
  set: SetState<T>,
  get: GetState<T>,
  store: StoreApi<T>
) => config(args => {
  log('  applying', args);
  set(args);
  log('  new state', get());
}, get, store);
