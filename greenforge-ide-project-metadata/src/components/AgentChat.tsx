import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, User, Wrench } from 'lucide-react';
import { useAgentStore } from '../stores/agentStore';
import type { AgentMessage } from '../types';

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'items-end flex flex-col' : ''}`}>
        {message.toolCalls?.map((tc) => (
          <div
            key={tc.id}
            className="inline-flex items-center gap-1.5 mb-1.5 text-[11px] px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
          >
            <Wrench size={11} />
            <span className="font-mono">{tc.name}</span>
            <span
              className={`px-1.5 rounded-full text-[10px] ${
                tc.status === 'done'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : tc.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-500/20 text-slate-300'
              }`}
            >
              {tc.status}
            </span>
          </div>
        ))}
        <div
          className={`inline-block text-[13px] leading-relaxed rounded-xl px-3 py-2 whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-slate-200 border border-white/5'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

export function AgentChat() {
  const { messages, sendMessage, thinking, pendingApproval } = useAgentStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const submit = () => {
    const text = input.trim();
    if (!text || thinking || pendingApproval) return;
    sendMessage(text);
    setInput('');
  };

  const suggestions = [
    'list files',
    'add a debounce helper to src/utils.ts',
    'read src/App.tsx',
    'add a License section to README.md',
  ];

  return (
    <div className="flex flex-col h-full bg-[#13161c]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <Sparkles size={16} className="text-emerald-400" />
        <span className="text-sm font-semibold text-slate-200">Agent</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 ml-1">
          HITL
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {thinking && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-300">
              <Bot size={15} />
            </div>
            <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-[11px] px-2 py-1 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2 bg-[#0f1115] rounded-xl border border-white/10 px-3 py-2 focus-within:border-blue-500/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              pendingApproval ? 'Resolve the approval gate first…' : 'Ask the agent…'
            }
            disabled={!!pendingApproval}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[13px] text-slate-200 placeholder:text-slate-600 max-h-32"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || thinking || !!pendingApproval}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500 text-white disabled:opacity-30 hover:bg-blue-400"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
