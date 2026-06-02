import { useState, useRef } from 'react';
import {
  ChevronRight,
  File as FileIcon,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  FolderPlus,
} from 'lucide-react';
import { useFileStore } from '../stores/fileStore';
import { useEditorStore } from '../stores/editorStore';
import type { FileNode } from '../types';
import { WORKSPACE_ROOT } from '../lib/vfs';

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const cls = 'shrink-0';
  if (ext === 'json') return <FileJson size={15} className={`${cls} text-yellow-500`} />;
  if (ext === 'md') return <FileText size={15} className={`${cls} text-sky-400`} />;
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext ?? ''))
    return <FileCode size={15} className={`${cls} text-blue-400`} />;
  return <FileIcon size={15} className={`${cls} text-slate-400`} />;
}

function TreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const {
    expanded,
    toggleExpand,
    selectedPath,
    setSelected,
    deleteEntry,
    downloadFile,
    downloadDirectory,
  } = useFileStore();
  const openFile = useEditorStore((s) => s.openFile);
  const [hover, setHover] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);

  const isOpen = expanded[node.path] ?? false;
  const isSelected = selectedPath === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(node.path);
    if (node.type === 'directory') {
      toggleExpand(node.path);
    } else {
      openFile(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelected(node.path);
    setContextMenu({ x: e.pageX, y: e.pageY, path: node.path });
  };

  const closeContext = () => setContextMenu(null);

  return (
    <div>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`group flex items-center gap-1.5 cursor-pointer select-none pr-2 h-[26px] text-[13px] ${
          isSelected
            ? 'bg-blue-500/20 text-white'
            : 'text-slate-300 hover:bg-white/5'
        }`}
        style={{ paddingLeft: depth * 12 + 8 }}
      >
        {node.type === 'directory' ? (
          <ChevronRight
            size={14}
            className={`shrink-0 text-slate-500 transition-transform ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        {node.type === 'directory' ? (
          isOpen ? (
            <FolderOpen size={15} className="shrink-0 text-amber-400/90" />
          ) : (
            <Folder size={15} className="shrink-0 text-amber-400/90" />
          )
        ) : (
          <FileTypeIcon name={node.name} />
        )}
        <span className="truncate flex-1">{node.name}</span>

        {hover && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
            {node.type === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(node.path);
                }}
                className="text-slate-400 hover:text-sky-400"
                title="Download"
              >
                <Download size={13} />
              </button>
            )}
            {node.type === 'directory' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadDirectory(node.path);
                }}
                className="text-slate-400 hover:text-sky-400"
                title="Download as ZIP"
              >
                <Download size={13} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${node.name}?`)) deleteEntry(node.path);
              }}
              className="text-slate-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {node.type === 'directory' &&
        isOpen &&
        node.children?.map((child) => (
          <TreeNode key={child.path} node={child} depth={depth + 1} />
        ))}

      {contextMenu && contextMenu.path === node.path && (
        <div
          className="fixed bg-[#1f2937] border border-slate-700 rounded shadow-xl py-1 z-50 text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={closeContext}
        >
          {node.type === 'directory' && (
            <>
              <button
                className="w-full text-left px-4 py-1 hover:bg-white/10 flex items-center gap-2 text-xs"
                onClick={() => {
                  const name = prompt('New file name:');
                  if (name) {
                    const newPath = `${node.path}/${name}`.replace('//', '/');
                    useFileStore.getState().createFile(newPath);
                    useEditorStore.getState().openFile(newPath);
                  }
                }}
              >
                <FileIcon size={14} /> New File
              </button>
              <button
                className="w-full text-left px-4 py-1 hover:bg-white/10 flex items-center gap-2 text-xs"
                onClick={() => {
                  const name = prompt('New folder name:');
                  if (name) {
                    const newPath = `${node.path}/${name}`.replace('//', '/');
                    useFileStore.getState().createDirectory(newPath);
                  }
                }}
              >
                <FolderPlus size={14} /> New Folder
              </button>
              <button
                className="w-full text-left px-4 py-1 hover:bg-white/10 flex items-center gap-2 text-xs"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      Array.from(files).forEach((file) => {
                        useFileStore.getState().uploadFile(file, node.path);
                      });
                    }
                  };
                  input.click();
                }}
              >
                <Upload size={14} /> Upload File(s)
              </button>
            </>
          )}
          <button
            className="w-full text-left px-4 py-1 hover:bg-red-500/20 text-red-400 flex items-center gap-2 text-xs"
            onClick={() => {
              if (confirm(`Delete ${node.name}?`)) deleteEntry(node.path);
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function Explorer() {
  const { tree, createFile, createDirectory, uploadFile, downloadProject, resetWorkspace } =
    useFileStore();
  const openFile = useEditorStore((s) => s.openFile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewFile = () => {
    const name = prompt('New file path (e.g. src/index.ts):', 'src/new-file.ts');
    if (!name) return;
    const path = name.startsWith('/') ? name : `${WORKSPACE_ROOT}/${name.replace(/^\.?\//, '')}`;
    createFile(path, '// Start coding here...\n');
    openFile(path);
  };

  const handleNewFolder = () => {
    const name = prompt('New folder name (e.g. components):', 'new-folder');
    if (!name) return;
    const path = `${WORKSPACE_ROOT}/${name.replace(/^\.?\//, '')}`;
    createDirectory(path);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      uploadFile(file);
    });
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#1a1f2e]">
        <span className="text-xs uppercase tracking-[0.5px] text-slate-400 font-medium">
          EXPLORER
        </span>
        <div className="flex gap-1">
          <button onClick={handleNewFile} className="text-slate-400 hover:text-white p-1" title="New File">
            <Plus size={15} />
          </button>
          <button onClick={handleNewFolder} className="text-slate-400 hover:text-white p-1" title="New Folder">
            <FolderPlus size={15} />
          </button>
          <button onClick={handleUpload} className="text-slate-400 hover:text-white p-1" title="Upload">
            <Upload size={15} />
          </button>
          <button onClick={() => downloadProject()} className="text-slate-400 hover:text-white p-1" title="Download Project as ZIP">
            <Download size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm('Reset entire workspace to empty state?')) resetWorkspace();
            }}
            className="text-slate-400 hover:text-red-400 p-1"
            title="Reset Workspace"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <div className="flex-1 overflow-auto py-1 text-sm font-light">
        {tree.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500 text-xs">
            Workspace is empty.<br />
            Use the buttons above or the terminal to create files.
          </div>
        ) : (
          tree.map((node) => <TreeNode key={node.path} node={node} depth={0} />)
        )}
      </div>

      <div className="border-t border-white/5 px-3 py-2 text-[10px] text-slate-500 flex items-center gap-2">
        <div className="bg-emerald-400/20 text-emerald-400 px-1.5 rounded">PERSISTENT</div>
        <span>localStorage</span>
      </div>
    </div>
  );
}
