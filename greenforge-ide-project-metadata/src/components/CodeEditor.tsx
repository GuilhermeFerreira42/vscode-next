import Editor from '@monaco-editor/react';
import { Save, FileCode2 } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';

export function CodeEditor() {
  const { tabs, activeTabId, updateContent, saveTab } = useEditorStore();
  const tab = tabs.find((t) => t.id === activeTabId) ?? null;

  if (!tab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-[#0f1115]">
        <FileCode2 size={56} strokeWidth={1} className="mb-4 text-slate-700" />
        <p className="text-sm">Select a file from the explorer to start editing</p>
        <p className="text-xs mt-1 text-slate-700">
          or ask the agent on the right to create one
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1115]">
      <div className="flex items-center justify-between px-3 py-1 border-b border-white/5 text-[11px] text-slate-500">
        <span className="font-mono truncate">{tab.path}</span>
        <button
          onClick={() => saveTab(tab.id)}
          disabled={!tab.isDirty}
          className={`flex items-center gap-1 px-2 py-0.5 rounded ${
            tab.isDirty
              ? 'text-emerald-400 hover:bg-white/5'
              : 'text-slate-600 cursor-default'
          }`}
        >
          <Save size={13} /> {tab.isDirty ? 'Save (unsaved)' : 'Saved'}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          theme="vs-dark"
          path={tab.path}
          language={tab.language}
          value={tab.content}
          onChange={(value) => updateContent(tab.id, value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            padding: { top: 12 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>
    </div>
  );
}
