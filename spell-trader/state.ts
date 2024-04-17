import { ModalKeys, ModalStates } from "@/modals";
import { set as _set, last } from "lodash";
import { create } from "zustand";
import constants from "@/modules/constants";
import { User } from "@/types/App/User";
import Ebay from "@/types/Ebay";

export const useUserStore = create<{
  user?: User | null;
  setUser: (user?: User | null) => void;
}>((set, get) => ({
  user: undefined,
  setUser: (user) => {
    set({ user });
  },
}));

export const useBreadcrumbStore = create<{
  crumbs: { [index: string]: string | undefined };
  setCrumb: (key: string, val: string | undefined) => void;
}>((set, get) => ({
  crumbs: {},
  setCrumb: (key, val) => set({ crumbs: { [key]: val } }),
}));

const initialModalState = ModalKeys.reduce((acc, key) => {
  acc[key] = { show: false };
  return acc;
}, {} as Record<ModalKey, { show: false }>);

export type ModalKey = keyof ModalStates;
type ModalStatesWithShow = {
  [K in ModalKey]: Partial<ModalStates[K]> & { show: boolean };
};
type ModalStore = {
  [K in ModalKey]: ModalStatesWithShow[K];
} & {
  modals: {
    // closeModal: any;
    /**
     * Sets modals show state to true and resets all other modals show state
     * to false
     * @param key
     * @param state
     */
    show<K extends ModalKey>(
      key: K,
      state?: Omit<ModalStatesWithShow[K], "show">
    ): void;
    /**
     * Updates modal state without resetting other modals
     * @param key
     * @param state
     */
    update<K extends ModalKey>(key: K, state: ModalStatesWithShow[K]): void;
    /**
     * Resets all modals show state to false. Keeps reset of modal state intact.
     */
    reset(): void;
    /**
     * Hides modal. Sets modals show state to false.
     * @param key
     */
    hide<K extends ModalKey>(key: K): void;
    /**
     * History of modals that have been shown
     */
    history: ModalKey[];
  };

  /**
   * Use modals.show instead
   * @deprecated Use modals.show instead
   * @param key
   * @param state
   * @param replace
   */
  setModalState<K extends ModalKey>(
    key: K,
    state: ModalStatesWithShow[K],
    replace?: boolean
  ): void;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  ...initialModalState,
  modals: {
    show: <K extends ModalKey>(
      key: K,
      state?: Omit<ModalStatesWithShow[K], "show">
    ) => {
      get().modals.reset();
      const newState = { ...get() };
      newState[key] = { ...newState[key], show: true, ...state };
      newState.modals.history.push(key);
      set(newState);
    },
    reset: () => {
      const newState = { ...get() };
      for (const key in newState) {
        if (key !== "setModalState" && key !== "modals") {
          newState[key as ModalKey].show = false;
        }
      }
      set(newState);
    },
    update: <K extends ModalKey>(key: K, state: ModalStatesWithShow[K]) => {
      const newState = { ...get() };
      const newModalState = { ...newState[key], ...state };
      newState[key] = newModalState;
      set(newState);
    },
    hide: (key: ModalKey) => {
      const newState = { ...get() };
      newState[key].show = false;
      newState.modals.history.pop(); // remove current modal from history
      const previousModalKey = last(newState.modals.history);
      if (previousModalKey) {
        newState[previousModalKey].show = true;
      }
      set(newState);
    },
    history: [],
  },
  setModalState: (key, state, replace = false) => {
    get().modals.reset();
    const newModalState = replace ? { ...state } : { ...get()[key], ...state };
    const currentState = get();
    currentState[key] = newModalState;
    set({ ...currentState });
  },
}));

export const useEbayStore = create<{
  global: {
    category: {
      [key in keyof typeof constants.ebay.categories]?: {
        item: { aspects: Ebay.Taxonomy.Aspect[]; conditions: any };
      };
    };
  };
  setEbayState: (key: string, value: any) => void;
}>((set) => ({
  global: {
    category: {
      vinyl: {
        item: {
          aspects: [],
          conditions: null,
        },
      },
    },
  },
  setEbayState: (key, value) => {
    set((state) => _set({ ...state }, key, value), true);
  },
}));
