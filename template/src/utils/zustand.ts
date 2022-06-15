import create, {GetState, SetState, StateCreator, StoreApi} from 'zustand';
import {log} from '@/utils/index';

export type StoreInterface<T extends {}> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>,
  $$storeMutations: any
) => T;

export type Middleware<T extends {}> = (
  config: StateCreator<T>,
) => StoreInterface<T>;

export const applyMiddleware = <T extends {}>(s: StoreInterface<T>, middlewares: Middleware<T>[]) => create<T>(
  middlewares.reduce((a, m) => m(a), s)
);

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
