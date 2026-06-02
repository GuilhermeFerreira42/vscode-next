import { X } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';

export function EditorTabs() {
  const { tabs, activeTabId, setActive, closeTab } = useEditorStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-stretch bg-[#1a1d23] border-b border-white/5 overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`group flex items-center gap-2 px-3 h-9 cursor-pointer text-[13px] border-r border-white/5 whitespace-nowrap ${
              active
                ? 'bg-[#0f1115] text-white'
                : 'bg-[#1a1d23] text-slate-400 hover:text-slate-200'
            }`}
          >
            {active && (
              <span className="absolute h-[2px] bg-blue-500" style={{ marginTop: -34, width: 0 }} />
            )}
            <span>{tab.filename}</span>
            {tab.isDirty && <span className="w-2 h-2 rounded-full bg-slate-300" />}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={`rounded p-0.5 hover:bg-white/10 ${
                tab.isDirty ? '' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
