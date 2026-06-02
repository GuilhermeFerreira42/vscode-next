import { create } from 'zustand';
import type { EditorTab } from '../types';
import { baseName, languageOf } from '../lib/vfs';
import { useFileStore } from './fileStore';

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;

  openFile: (path: string) => void;
  closeTab: (id: string) => void;
  setActive: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveTab: (id: string) => void;
  syncFromVfs: (path: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openFile: (path) => {
    const existing = get().tabs.find((t) => t.path === path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    const content = useFileStore.getState().readFile(path) ?? '';
    const tab: EditorTab = {
      id: path,
      path,
      filename: baseName(path),
      content,
      isDirty: false,
      language: languageOf(path),
    };
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }));
  },

  closeTab: (id) =>
    set((s) => {
      const tabs = s.tabs.filter((t) => t.id !== id);
      let activeTabId = s.activeTabId;
      if (activeTabId === id) {
        activeTabId = tabs.length ? tabs[tabs.length - 1].id : null;
      }
      return { tabs, activeTabId };
    }),

  setActive: (id) => set({ activeTabId: id }),

  updateContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t
      ),
    })),

  saveTab: (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;
    useFileStore.getState().writeFile(tab.path, tab.content);
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
    }));
  },

  syncFromVfs: (path) => {
    const content = useFileStore.getState().readFile(path);
    if (content === undefined) return;
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.path === path ? { ...t, content, isDirty: false } : t
      ),
    }));
  },
}));
