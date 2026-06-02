import type { FileNode } from '../types';
import JSZip from 'jszip';

export interface VFSState {
  files: Record<string, string>;
  dirs: Set<string>;
}

export const WORKSPACE_ROOT = '/workspace';

export function createEmptyState(): VFSState {
  return {
    files: {},
    dirs: new Set([WORKSPACE_ROOT]),
  };
}

// Persistence
const STORAGE_KEY = 'greenforge_vfs_state';

export function saveToLocalStorage(state: VFSState) {
  try {
    const serializable = {
      files: state.files,
      dirs: Array.from(state.dirs),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    console.error('Failed to save VFS to localStorage', e);
  }
}

export function loadFromLocalStorage(): VFSState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createEmptyState();

    const parsed = JSON.parse(saved);
    return {
      files: parsed.files || {},
      dirs: new Set(parsed.dirs || [WORKSPACE_ROOT]),
    };
  } catch (e) {
    console.error('Failed to load VFS from localStorage', e);
    return createEmptyState();
  }
}

export function extensionOf(path: string): string {
  const name = path.split('/').pop() ?? '';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1) : '';
}

export function languageOf(path: string): string {
  const ext = extensionOf(path).toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    sh: 'shell',
    yml: 'yaml',
    yaml: 'yaml',
    env: 'ini',
  };
  return map[ext] ?? 'plaintext';
}

export function baseName(path: string): string {
  return path.split('/').pop() ?? path;
}

export function dirName(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

// Build a nested FileNode tree
export function buildTree(state: VFSState): FileNode[] {
  const rootNode: FileNode = {
    id: WORKSPACE_ROOT,
    name: baseName(WORKSPACE_ROOT),
    path: WORKSPACE_ROOT,
    type: 'directory',
    children: [],
  };

  const nodeByPath = new Map<string, FileNode>();
  nodeByPath.set(WORKSPACE_ROOT, rootNode);

  const sortedDirs = Array.from(state.dirs).sort();
  for (const dir of sortedDirs) {
    if (dir === WORKSPACE_ROOT) continue;
    const node: FileNode = {
      id: dir,
      name: baseName(dir),
      path: dir,
      type: 'directory',
      children: [],
    };
    nodeByPath.set(dir, node);
  }

  for (const dir of sortedDirs) {
    if (dir === WORKSPACE_ROOT) continue;
    const parentPath = dirName(dir);
    const parent = nodeByPath.get(parentPath) ?? rootNode;
    parent.children?.push(nodeByPath.get(dir)!);
  }

  for (const [path, content] of Object.entries(state.files)) {
    const node: FileNode = {
      id: path,
      name: baseName(path),
      path,
      type: 'file',
      extension: extensionOf(path),
      size: content.length,
    };
    const parentPath = dirName(path);
    const parent = nodeByPath.get(parentPath) ?? rootNode;
    parent.children?.push(node);
  }

  const sortChildren = (node: FileNode) => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };
  sortChildren(rootNode);

  return rootNode.children ?? [];
}

// Download helpers
export async function downloadFile(path: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = baseName(path);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadDirectoryAsZip(state: VFSState, dirPath: string = WORKSPACE_ROOT): Promise<void> {
  const zip = new JSZip();
  const prefix = dirPath === WORKSPACE_ROOT ? '' : dirPath;

  // Add files
  for (const [fullPath, content] of Object.entries(state.files)) {
    if (fullPath.startsWith(dirPath)) {
      let zipPath = fullPath.replace(prefix, '').replace(/^\/+/, '');
      if (!zipPath) zipPath = baseName(fullPath);
      zip.file(zipPath, content);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = baseName(dirPath) + '.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadEntireProjectAsZip(state: VFSState): Promise<void> {
  await downloadDirectoryAsZip(state, WORKSPACE_ROOT);
}
