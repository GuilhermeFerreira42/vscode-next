import { Cpu, GitBranch, Wifi } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';
import { useAgentStore } from '../stores/agentStore';

export function StatusBar() {
  const { tabs, activeTabId } = useEditorStore();
  const tab = tabs.find((t) => t.id === activeTabId);
  const walCount = useAgentStore((s) => s.walLog.length);

  return (
    <div className="h-6 flex items-center justify-between px-3 text-[11px] bg-blue-600 text-white shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <GitBranch size={12} /> main
        </span>
        <span className="flex items-center gap-1">
          <Wifi size={12} /> local
        </span>
        <span className="flex items-center gap-1">
          <Cpu size={12} /> WAL: {walCount}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {tab && (
          <>
            <span className="uppercase">{tab.language}</span>
            <span>{tab.isDirty ? '● unsaved' : 'saved'}</span>
          </>
        )}
        <span>GreenForge IDE 0.1.0-mvp</span>
      </div>
    </div>
  );
}
