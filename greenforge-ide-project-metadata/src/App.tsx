import { useState } from 'react';
import {
  Files,
  Hexagon,
  PanelBottomClose,
  PanelBottomOpen,
  ScrollText,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import { Explorer } from './components/Explorer';
import { WalPanel } from './components/WalPanel';
import { EditorTabs } from './components/EditorTabs';
import { CodeEditor } from './components/CodeEditor';
import { TerminalPanel } from './components/TerminalPanel';
import { AgentChat } from './components/AgentChat';
import { ApprovalModal } from './components/ApprovalModal';
import { StatusBar } from './components/StatusBar';

type SidebarView = 'explorer' | 'wal';

export default function App() {
  const [sidebar, setSidebar] = useState<SidebarView>('explorer');
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f1115] text-slate-200 overflow-hidden">
      {/* Title bar */}
      <div className="h-9 flex items-center px-3 border-b border-white/5 bg-[#13161c] shrink-0">
        <div className="flex items-center gap-2">
          <Hexagon size={18} className="text-emerald-400" fill="currentColor" />
          <span className="text-sm font-semibold tracking-tight">GreenForge</span>
          <span className="text-[11px] text-slate-500">IDE</span>
        </div>
        <div className="mx-auto text-[12px] text-slate-500">
          agent-oriented workspace · adversarial debate · HITL gates
        </div>
        <button
          onClick={() => setAgentOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-md border ${
            agentOpen
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'text-slate-400 border-white/10 hover:bg-white/5'
          }`}
        >
          <Sparkles size={13} /> Agent
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Activity bar */}
        <div className="w-12 flex flex-col items-center py-2 gap-1 bg-[#13161c] border-r border-white/5 shrink-0">
          <ActivityButton
            active={sidebar === 'explorer'}
            onClick={() => setSidebar('explorer')}
            title="Explorer"
          >
            <Files size={20} />
          </ActivityButton>
          <ActivityButton
            active={sidebar === 'wal'}
            onClick={() => setSidebar('wal')}
            title="WAL Intent Log"
          >
            <ScrollText size={20} />
          </ActivityButton>
          <div className="flex-1" />
          <ActivityButton
            active={terminalOpen}
            onClick={() => setTerminalOpen((v) => !v)}
            title="Toggle Terminal"
          >
            <TerminalSquare size={20} />
          </ActivityButton>
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-[#161a21] border-r border-white/5 shrink-0 overflow-hidden">
          {sidebar === 'explorer' ? <Explorer /> : <WalPanel />}
        </div>

        {/* Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          <EditorTabs />
          <div className="flex-1 flex flex-col min-h-0">
            <CodeEditor />
            {terminalOpen && (
              <div className="h-56 border-t border-white/10 flex flex-col shrink-0">
                <div className="flex items-center justify-between px-3 h-7 bg-[#13161c] border-b border-white/5">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <TerminalSquare size={13} /> Terminal
                  </div>
                  <button
                    onClick={() => setTerminalOpen(false)}
                    className="text-slate-500 hover:text-slate-200"
                    title="Close terminal"
                  >
                    <PanelBottomClose size={15} />
                  </button>
                </div>
                <div className="flex-1 min-h-0 bg-[#0f1115]">
                  <TerminalPanel />
                </div>
              </div>
            )}
          </div>
          {!terminalOpen && (
            <button
              onClick={() => setTerminalOpen(true)}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1 border-t border-white/5 text-slate-500 hover:text-slate-200"
            >
              <PanelBottomOpen size={13} /> Show terminal
            </button>
          )}
        </div>

        {/* Agent panel */}
        {agentOpen && (
          <div className="w-96 border-l border-white/5 shrink-0">
            <AgentChat />
          </div>
        )}
      </div>

      <StatusBar />
      <ApprovalModal />
    </div>
  );
}

function ActivityButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 rounded-lg flex items-center justify-center relative ${
        active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-r" />
      )}
      {children}
    </button>
  );
}
