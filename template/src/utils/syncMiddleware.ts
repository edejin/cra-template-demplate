/**
 * This is copy of default persist middleware with additional functions.
 * Warning in list of middleware, this middleware should be first!
 */

import {StoreInterface} from '@/utils/zustand';
import {State, StateCreator, StoreApi, StoreMutatorIdentifier} from 'zustand';

export type StateStorage = {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

type StorageValue<S> = { state: S; version?: number }

export type SyncOptions<S, SyncedState = S> = {
  /** Name of the storage (must be unique) */
  name: string
  /** Default `true` */
  syncOnStart?: boolean
  /** Default `false` */
  syncDynamically?: boolean
  /** Name of the storage (must be unique) */
  syncKeyName?: string
  /**
   * A function returning a storage.
   * The storage must fit `window.localStorage`'s api (or an async version of it).
   * For example the storage could be `AsyncStorage` from React Native.
   *
   * @default () => localStorage
   */
  getStorage?: () => StateStorage
  /**
   * Use a custom serializer.
   * The returned string will be stored in the storage.
   *
   * @default JSON.stringify
   */
  serialize?: (state: StorageValue<S>) => string | Promise<string>
  /**
   * Use a custom deserializer.
   * Must return an object matching StorageValue<State>
   *
   * @param str The storage's current value.
   * @default JSON.parse
   */
  deserialize?: (
    str: string
  ) => StorageValue<SyncedState> | Promise<StorageValue<SyncedState>>
  /**
   * Filter the synced value.
   *
   * @params state The state's value
   */
  partialize?: (state: S) => SyncedState
  /**
   * A function returning another (optional) function.
   * The main function will be called before the state rehydration.
   * The returned function will be called after the state rehydration or when an error occurred.
   */
  onRehydrateStorage?: (
    state: S
  ) => ((state?: S, error?: unknown) => void) | void
  /**
   * A function returning another (optional) function.
   * The main function will be called before the state rehydration.
   * The returned function will be called after the state rehydration or when an error occurred.
   */
  onUpdateStorage?: (
    state: S
  ) => ((state?: S, error?: unknown) => void) | void
  /**
   * If the stored state's version mismatch the one specified here, the storage will not be used.
   * This is useful when adding a breaking change to your store.
   */
  version?: number
  /**
   * A function to perform synced state migration.
   * This function will be called when synced state versions mismatch with the one specified here.
   */
  migrate?: (syncedState: unknown, version: number) => S | Promise<S>
  /**
   * A function to perform custom hydration merges when combining the stored state with the current one.
   * By default, this function does a shallow merge.
   */
  merge?: (syncedState: unknown, currentState: S) => S
}

type SyncListener<S> = (state: S) => void

type StoreSync<S extends State, Ps> = {
  sync: {
    setOptions: (options: Partial<SyncOptions<S, Ps>>) => void
    clearStorage: () => void
    rehydrate: () => Promise<void>
    hasHydrated: () => boolean
    onHydrate: (fn: SyncListener<S>) => () => void
    onFinishHydration: (fn: SyncListener<S>) => () => void
  }
}

type Thenable<Value> = {
  then<V>(
    onFulfilled: (value: Value) => V | Promise<V> | Thenable<V>
  ): Thenable<V>
  catch<V>(
    onRejected: (reason: Error) => V | Promise<V> | Thenable<V>
  ): Thenable<V>
}

const toThenable =
  <Result, Input>(
    fn: (input: Input) => Result | Promise<Result> | Thenable<Result>
  ) =>
    (input: Input): Thenable<Result> => {
      try {
        const result = fn(input);
        if (result instanceof Promise) {
          return result as Thenable<Result>;
        }
        return {
          then(onFulfilled) {
            return toThenable(onFulfilled)(result as Result);
          },
          catch(_onRejected) {
            return this as Thenable<any>;
          },
        };
      } catch (e: any) {
        return {
          then(_onFulfilled) {
            return this as Thenable<any>;
          },
          catch(onRejected) {
            return toThenable(onRejected)(e);
          },
        };
      }
    };

const syncImpl: SyncImpl = (config, baseOptions) => (set, get, api) => {
  type S = ReturnType<typeof config>
  let options = {
    getStorage: () => localStorage,
    serialize: JSON.stringify as (state: StorageValue<S>) => string,
    deserialize: JSON.parse as (str: string) => StorageValue<S>,
    partialize: (state: S) => state,
    version: 0,
    syncKeyName: `${baseOptions.name}-sync-key`,
    syncOnStart: true,
    syncDynamically: false,
    merge: (syncedState: unknown, currentState: S) => ({
      ...(currentState as object),
      ...(syncedState as object),
    }),
    ...baseOptions,
  };

  let hasHydrated = false;
  const hydrationListeners = new Set<SyncListener<S>>();
  const finishHydrationListeners = new Set<SyncListener<S>>();
  let storage: StateStorage | undefined;

  try {
    storage = options.getStorage();
  } catch (e) {
    // prevent error if the storage is not defined (e.g. when server side rendering a page)
  }

  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand sync middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }

  const thenableSerialize = toThenable(options.serialize);

  const setItem = (): Thenable<void> => {
    const state = options.partialize(({...(get() as object)}) as S);

    const postUpdateCallback =
      options.onUpdateStorage?.(get()) || undefined;

    let errorInSync: Error | undefined;
    const thenable = thenableSerialize({state, version: options.version})
      .then((serializedValue) => {
        (storage as StateStorage).setItem(options.name, serializedValue);
      })
      .catch((e) => {
        errorInSync = e;
        postUpdateCallback?.(undefined, e);
      })
      .then(() => {
        postUpdateCallback?.(stateFromStorage, undefined);
        if (options.syncDynamically) {
          const currentVersion = Number(localStorage.getItem(options.syncKeyName) || '0');
          localStorage.setItem(options.syncKeyName, (currentVersion + 1).toString());
        }
      });
    if (errorInSync) {
      throw errorInSync;
    }
    return thenable;
  };

  const savedSetState = api.setState;

  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };

  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );

  // a workaround to solve the issue of not storing rehydrated state in sync storage
  // the set(state) value would be later overridden with initial state by create()
  // to avoid this, we merge the state from localStorage into the initial state.
  let stateFromStorage: S | undefined;

  // rehydrate initial state with existing stored state
  const hydrate = () => {
      if (!storage) return;

      hasHydrated = false;
      hydrationListeners.forEach((cb) => cb(get()));

      const postRehydrationCallback =
        options.onRehydrateStorage?.(get()) || undefined;

      // bind is used to avoid `TypeError: Illegal invocation` error
      return toThenable(storage.getItem.bind(storage))(options.name)
        .then((storageValue) => {
          if (storageValue) {
            return options.deserialize(storageValue);
          }
        })
        .then((deserializedStorageValue) => {
          if (deserializedStorageValue) {
            if (
              typeof deserializedStorageValue.version === 'number' &&
              deserializedStorageValue.version !== options.version
            ) {
              if (options.migrate) {
                return options.migrate(
                  deserializedStorageValue.state,
                  deserializedStorageValue.version
                );
              }
              console.error(
                `State loaded from storage couldn't be migrated since no migrate function was provided`
              );
            } else {
              return deserializedStorageValue.state;
            }
          }
        })
        .then((migratedState) => {
          stateFromStorage = options.merge(
            migratedState as S,
            get() ?? configResult
          ) as S;

          set(stateFromStorage, true);
          // return setItem();
        })
        .then(() => {
          postRehydrationCallback?.(stateFromStorage, undefined);
          hasHydrated = true;
          finishHydrationListeners.forEach((cb) => cb(stateFromStorage as S));
        })
        .catch((e: Error) => {
          postRehydrationCallback?.(undefined, e);
        });
    }

  ;(api as StoreApi<S> & StoreSync<S, S>).sync = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions,
      };

      if (newOptions.getStorage) {
        storage = newOptions.getStorage();
      }
    },
    clearStorage: () => {
      storage?.removeItem(options.name);
    },
    rehydrate: () => hydrate() as Promise<void>,
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);

      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);

      return () => {
        finishHydrationListeners.delete(cb);
      };
    },
  };

  if (options.syncOnStart) {
    hydrate();
  }

  if (options.syncDynamically) {
    const nowICanSeeLocalStorageChangeEvents = (e: StorageEvent) => {
      const {
        key
      } = e;
      if (key === options.syncKeyName) {
        hydrate();
      }
    };
    window.addEventListener('storage', nowICanSeeLocalStorageChangeEvents, false);
  }

  return stateFromStorage || configResult;
};

type Sync = <T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  U = Partial<T>>(
  initializer: StateCreator<T, [...Mps, ['sync', unknown]], Mcs>,
  options?: SyncOptions<T, U>
) => StateCreator<T, Mps, [['sync', U], ...Mcs]>

declare module 'zustand/vanilla' {
  interface StoreMutators<S, A> {
    'sync': WithSync<S, A>
  }
}

type Write<T extends object, U extends object> = Omit<T, keyof U> & U
type Cast<T, U> = T extends U ? T : U

type WithSync<S, A> = S extends { getState: () => infer T }
  ? Write<S, StoreSync<Cast<T, State>, A>>
  : never

type SyncImpl = <T extends State>(
  storeInitializer: PopArgument<StateCreator<T, [], []>>,
  options: SyncOptions<T, T>
) => PopArgument<StateCreator<T, [], []>>

type PopArgument<T extends (...a: never[]) => unknown> = T extends (
  ...a: [...infer A, infer _]
  ) => infer R
  ? (...a: A) => R
  : never

export const syncMiddleware = syncImpl as unknown as Sync;

export const syncMiddlewareCreator = <T extends {}>(options: SyncOptions<T>) => (s: StoreInterface<T>) => syncMiddleware<T>(s, options);
