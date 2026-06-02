import { create } from 'zustand';
import {
  buildTree,
  createEmptyState,
  loadFromLocalStorage,
  saveToLocalStorage,
  WORKSPACE_ROOT,
  downloadFile as downloadSingleFile,
  downloadDirectoryAsZip,
  downloadEntireProjectAsZip,
  type VFSState,
} from '../lib/vfs';
import type { FileNode } from '../types';

interface FileState {
  vfs: VFSState;
  tree: FileNode[];
  expanded: Record<string, boolean>;
  selectedPath: string | null;

  readFile: (path: string) => string | undefined;
  exists: (path: string) => boolean;
  writeFile: (path: string, content: string) => void;
  createFile: (path: string, content?: string) => void;
  createDirectory: (path: string) => void;
  deleteEntry: (path: string) => void;
  renameEntry: (oldPath: string, newPath: string) => void;
  uploadFile: (file: File, targetDir?: string) => Promise<void>;
  downloadFile: (path: string) => Promise<void>;
  downloadDirectory: (path: string) => Promise<void>;
  downloadProject: () => Promise<void>;

  toggleExpand: (path: string) => void;
  setSelected: (path: string | null) => void;
  refreshTree: () => void;
  resetWorkspace: () => void;
}

function ensureParents(state: VFSState, path: string) {
  const parts = path.split('/').filter(Boolean);
  let acc = '';
  for (let i = 0; i < parts.length - 1; i++) {
    acc += '/' + parts[i];
    state.dirs.add(acc);
  }
}

export const useFileStore = create<FileState>((set, get) => {
  const initialVfs = loadFromLocalStorage();

  const persist = (newVfs: VFSState) => {
    saveToLocalStorage(newVfs);
    return newVfs;
  };

  return {
    vfs: initialVfs,
    tree: buildTree(initialVfs),
    expanded: { '/workspace': true },
    selectedPath: null,

    readFile: (path) => get().vfs.files[path],
    exists: (path) => path in get().vfs.files || get().vfs.dirs.has(path),

    writeFile: (path, content) =>
      set((s) => {
        const vfs = {
          files: { ...s.vfs.files, [path]: content },
          dirs: new Set(s.vfs.dirs),
        };
        ensureParents(vfs, path);
        const persisted = persist(vfs);
        return { vfs: persisted, tree: buildTree(persisted) };
      }),

    createFile: (path, content = '') =>
      set((s) => {
        if (path in s.vfs.files) return s;
        const vfs = {
          files: { ...s.vfs.files, [path]: content },
          dirs: new Set(s.vfs.dirs),
        };
        ensureParents(vfs, path);
        const persisted = persist(vfs);
        return { vfs: persisted, tree: buildTree(persisted) };
      }),

    createDirectory: (path) =>
      set((s) => {
        const dirs = new Set(s.vfs.dirs);
        dirs.add(path);
        const vfs = { files: { ...s.vfs.files }, dirs };
        ensureParents(vfs, path + '/x');
        const persisted = persist(vfs);
        return { vfs: persisted, tree: buildTree(persisted) };
      }),

    deleteEntry: (path) =>
      set((s) => {
        const files: Record<string, string> = {};
        const dirs = new Set<string>();
        for (const [f, content] of Object.entries(s.vfs.files)) {
          if (f !== path && !f.startsWith(path + '/')) {
            files[f] = content;
          }
        }
        for (const d of s.vfs.dirs) {
          if (d !== path && !d.startsWith(path + '/')) {
            dirs.add(d);
          }
        }
        const vfs = { files, dirs };
        const persisted = persist(vfs);
        return { vfs: persisted, tree: buildTree(persisted) };
      }),

    renameEntry: (oldPath, newPath) =>
      set((s) => {
        const files: Record<string, string> = {};
        const dirs = new Set<string>();
        for (const [f, content] of Object.entries(s.vfs.files)) {
          if (f === oldPath || f.startsWith(oldPath + '/')) {
            files[newPath + f.slice(oldPath.length)] = content;
          } else {
            files[f] = content;
          }
        }
        for (const d of s.vfs.dirs) {
          if (d === oldPath || d.startsWith(oldPath + '/')) {
            dirs.add(newPath + d.slice(oldPath.length));
          } else {
            dirs.add(d);
          }
        }
        const vfs = { files, dirs };
        ensureParents(vfs, newPath + '/x');
        const persisted = persist(vfs);
        return { vfs: persisted, tree: buildTree(persisted) };
      }),

    uploadFile: async (file: File, targetDir = WORKSPACE_ROOT) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const targetPath = `${targetDir}/${file.name}`.replace('//', '/');
          set((s) => {
            const vfs = {
              files: { ...s.vfs.files, [targetPath]: content },
              dirs: new Set(s.vfs.dirs),
            };
            ensureParents(vfs, targetPath);
            const persisted = persist(vfs);
            return { vfs: persisted, tree: buildTree(persisted) };
          });
          resolve();
        };
        reader.readAsText(file);
      });
    },

    downloadFile: async (path: string) => {
      const content = get().vfs.files[path];
      if (content !== undefined) {
        await downloadSingleFile(path, content);
      }
    },

    downloadDirectory: async (path: string) => {
      await downloadDirectoryAsZip(get().vfs, path);
    },

    downloadProject: async () => {
      await downloadEntireProjectAsZip(get().vfs);
    },

    toggleExpand: (path) =>
      set((s) => ({ expanded: { ...s.expanded, [path]: !s.expanded[path] } })),

    setSelected: (path) => set({ selectedPath: path }),

    refreshTree: () => set((s) => ({ tree: buildTree(s.vfs) })),

    resetWorkspace: () =>
      set(() => {
        const empty = createEmptyState();
        saveToLocalStorage(empty);
        return {
          vfs: empty,
          tree: buildTree(empty),
          expanded: { '/workspace': true },
          selectedPath: null,
        };
      }),
  };
});
