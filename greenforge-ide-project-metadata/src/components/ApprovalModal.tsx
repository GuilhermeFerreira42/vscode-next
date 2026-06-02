import { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Check, ShieldAlert, X } from 'lucide-react';
import { useAgentStore } from '../stores/agentStore';

export function ApprovalModal() {
  const pending = useAgentStore((s) => s.pendingApproval);
  const resolveApproval = useAgentStore((s) => s.resolveApproval);
  const [edited, setEdited] = useState<string | null>(null);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col rounded-xl border border-amber-500/30 bg-[#11141a] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-amber-500/10">
          <ShieldAlert size={20} className="text-amber-400" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-amber-200">
              HITL Gate 0 — Approval Required
            </h2>
            <p className="text-[12px] text-slate-400">
              {pending.description}{' '}
              <span className="font-mono text-slate-300">{pending.target}</span>
            </p>
          </div>
          <span className="text-[11px] px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono">
            WAL #{pending.walId}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-1.5 text-[11px] text-slate-500 border-b border-white/5">
          <span>● Original</span>
          <span>Proposed (editable) ●</span>
        </div>

        <div className="flex-1 min-h-0">
          <DiffEditor
            height="100%"
            theme="vs-dark"
            language={pending.language}
            original={pending.original}
            modified={pending.proposed}
            onMount={(editor) => {
              const modModel = editor.getModifiedEditor();
              modModel.onDidChangeModelContent(() => {
                setEdited(modModel.getValue());
              });
            }}
            options={{
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 12,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/10 bg-[#0d1014]">
          <p className="text-[11px] text-slate-500">
            You can edit the proposed side before approving. Nothing is written
            until you approve.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => resolveApproval(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30"
            >
              <X size={15} /> Reject
            </button>
            <button
              onClick={() => resolveApproval(true, edited ?? undefined)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400"
            >
              <Check size={15} /> Approve & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
