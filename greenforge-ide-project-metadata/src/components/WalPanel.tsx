import { ScrollText } from 'lucide-react';
import { useAgentStore } from '../stores/agentStore';
import type { WALEntry } from '../types';

const statusColor: Record<WALEntry['status'], string> = {
  pending: 'text-amber-300 bg-amber-500/15',
  approved: 'text-blue-300 bg-blue-500/15',
  rejected: 'text-red-300 bg-red-500/15',
  executed: 'text-emerald-300 bg-emerald-500/15',
};

export function WalPanel() {
  const walLog = useAgentStore((s) => s.walLog);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <ScrollText size={15} className="text-slate-400" />
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          WAL Intent Log
        </span>
        <span className="ml-auto text-[10px] text-slate-600">{walLog.length} entries</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {walLog.length === 0 && (
          <p className="text-[12px] text-slate-600 px-2 py-3 text-center">
            No intents logged yet. Agent write operations are recorded here for
            auditability.
          </p>
        )}
        {walLog.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2 text-[11px]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-slate-500">#{entry.id}</span>
              <span className={`px-1.5 py-0.5 rounded-full ${statusColor[entry.status]}`}>
                {entry.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-purple-300">{entry.action}</span>
              {entry.gate !== null && (
                <span className="px-1 rounded bg-slate-600/30 text-slate-400">
                  gate {entry.gate}
                </span>
              )}
            </div>
            <div className="font-mono text-slate-400 truncate mt-0.5">{entry.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
