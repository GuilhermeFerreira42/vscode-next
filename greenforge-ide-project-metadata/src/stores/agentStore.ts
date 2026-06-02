import { create } from 'zustand';
import type { AgentMessage, WALEntry } from '../types';
import { useFileStore } from './fileStore';
import { useEditorStore } from './editorStore';
import { WORKSPACE_ROOT, baseName } from '../lib/vfs';

export interface ApprovalRequest {
  id: string;
  agentId: string;
  action: 'write_file' | 'delete_file' | 'execute_command';
  target: string;
  description: string;
  original: string;
  proposed: string;
  language: string;
  walId: number;
}

interface AgentState {
  messages: AgentMessage[];
  walLog: WALEntry[];
  pendingApproval: ApprovalRequest | null;
  thinking: boolean;
  walCounter: number;

  sendMessage: (text: string) => void;
  resolveApproval: (approved: boolean, editedContent?: string) => void;
  clearChat: () => void;
}

let msgCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${msgCounter++}`;

function logWal(
  set: (fn: (s: AgentState) => Partial<AgentState>) => void,
  get: () => AgentState,
  entry: Omit<WALEntry, 'id' | 'timestamp'>
): number {
  const id = get().walCounter + 1;
  const walEntry: WALEntry = { ...entry, id, timestamp: Date.now() };
  set((s) => ({ walLog: [walEntry, ...s.walLog], walCounter: id }));
  return id;
}

function updateWalStatus(
  set: (fn: (s: AgentState) => Partial<AgentState>) => void,
  id: number,
  status: WALEntry['status']
) {
  set((s) => ({
    walLog: s.walLog.map((w) => (w.id === id ? { ...w, status } : w)),
  }));
}

export const useAgentStore = create<AgentState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 Welcome to **GreenForge IDE**.\n\nWorkspace is **empty**. Use the terminal (try `help`) or the buttons in Explorer to create files and folders.\n\nI support real file operations with **HITL approval gates** and **Monaco diff**.\n\nTry:\n• \"create src/components/Button.tsx with a React button component\"\n• \"add debounce to src/utils.ts\"\n• \"mkdir src/hooks\"",
      timestamp: Date.now(),
    },
  ],
  walLog: [],
  pendingApproval: null,
  thinking: false,
  walCounter: 0,

  clearChat: () =>
    set({
      messages: [],
    }),

  sendMessage: (text) => {
    const userMsg: AgentMessage = {
      id: nextId('user'),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], thinking: true }));

    // Simulated agent reasoning + tool-use loop.
    setTimeout(() => {
      runAgent(text, set, get);
    }, 500);
  },

  resolveApproval: (approved, editedContent) => {
    const req = get().pendingApproval;
    if (!req) return;

    if (approved) {
      const content =
        editedContent !== undefined ? editedContent : req.proposed;
      if (req.action === 'write_file') {
        useFileStore.getState().writeFile(req.target, content);
        useEditorStore.getState().openFile(req.target);
        useEditorStore.getState().syncFromVfs(req.target);
      } else if (req.action === 'delete_file') {
        useFileStore.getState().deleteEntry(req.target);
      }
      updateWalStatus(set, req.walId, 'executed');

      const okMsg: AgentMessage = {
        id: nextId('assistant'),
        role: 'assistant',
        content: `✅ Approved — applied changes to \`${baseName(
          req.target
        )}\`. The Intent Log entry #${req.walId} is now marked **executed**.`,
        timestamp: Date.now(),
      };
      set((s) => ({ messages: [...s.messages, okMsg], pendingApproval: null }));
    } else {
      updateWalStatus(set, req.walId, 'rejected');
      const noMsg: AgentMessage = {
        id: nextId('assistant'),
        role: 'assistant',
        content: `🚫 Rejected — no changes were written. Intent Log entry #${req.walId} marked **rejected**. Let me know how you'd like to proceed differently.`,
        timestamp: Date.now(),
      };
      set((s) => ({ messages: [...s.messages, noMsg], pendingApproval: null }));
    }
  },
}));

// ---- Mock agent logic -----------------------------------------------------

function pushAssistant(
  set: (fn: (s: AgentState) => Partial<AgentState>) => void,
  content: string,
  extra: Partial<AgentMessage> = {}
) {
  const msg: AgentMessage = {
    id: nextId('assistant'),
    role: 'assistant',
    content,
    timestamp: Date.now(),
    ...extra,
  };
  set((s) => ({ messages: [...s.messages, msg] }));
}

function runAgent(
  text: string,
  set: (fn: (s: AgentState) => Partial<AgentState>) => void,
  get: () => AgentState
) {
  const lower = text.toLowerCase();
  const fileStore = useFileStore.getState();

  // list files
  if (/(list|show).*(files|tree|workspace)/.test(lower) || lower.trim() === 'ls') {
    const paths = Object.keys(fileStore.vfs.files)
      .map((p) => p.replace(WORKSPACE_ROOT + '/', ''))
      .sort();
    pushAssistant(
      set,
      `🔧 \`list_directory("${WORKSPACE_ROOT}")\`\n\nWorkspace files:\n${paths
        .map((p) => `• ${p}`)
        .join('\n')}`,
      {
        toolCalls: [
          {
            id: nextId('tc'),
            name: 'list_directory',
            arguments: { path: WORKSPACE_ROOT },
            status: 'done',
          },
        ],
      }
    );
    set(() => ({ thinking: false }));
    return;
  }

  // read file
  const readMatch = lower.match(/read\s+([^\s]+)/);
  if (readMatch) {
    const target = resolvePath(readMatch[1]);
    const content = fileStore.readFile(target);
    if (content === undefined) {
      pushAssistant(set, `⚠️ I couldn't find \`${target}\` in the workspace.`);
    } else {
      useEditorStore.getState().openFile(target);
      const preview =
        content.length > 600 ? content.slice(0, 600) + '\n…(truncated)' : content;
      pushAssistant(
        set,
        `🔧 \`read_file("${target}")\` → opened in editor.\n\n\`\`\`\n${preview}\n\`\`\``,
        {
          toolCalls: [
            {
              id: nextId('tc'),
              name: 'read_file',
              arguments: { path: target },
              status: 'done',
            },
          ],
        }
      );
    }
    set(() => ({ thinking: false }));
    return;
  }

  // write / create / add -> propose change through approval gate
  const proposal = planWrite(text, lower, fileStore);
  if (proposal) {
    const walId = logWal(set, get, {
      agentId: 'agent-propositor',
      action: 'write_file',
      target: proposal.target,
      payload: JSON.stringify({ bytes: proposal.proposed.length }),
      status: 'pending',
      gate: 0,
    });

    pushAssistant(
      set,
      `🔧 \`write_file("${proposal.target}")\` requested.\n\n${proposal.reason}\n\n⏸️ **HITL Gate 0** — awaiting your approval. Review the diff and approve or reject.`,
      {
        toolCalls: [
          {
            id: nextId('tc'),
            name: 'write_file',
            arguments: { path: proposal.target },
            status: 'pending',
          },
        ],
      }
    );

    set(() => ({
      thinking: false,
      pendingApproval: {
        id: nextId('appr'),
        agentId: 'agent-propositor',
        action: 'write_file',
        target: proposal.target,
        description: proposal.reason,
        original: proposal.original,
        proposed: proposal.proposed,
        language: proposal.language,
        walId,
      },
    }));
    return;
  }

  // fallback
  pushAssistant(
    set,
    "I can help with the workspace files. Try things like:\n• \"create a file src/math.ts with an add function\"\n• \"read src/utils.ts\"\n• \"add a debounce function to src/utils.ts\"\n• \"list files\"\n\nEvery write goes through the approval gate so you stay in control."
  );
  set(() => ({ thinking: false }));
}

function resolvePath(raw: string): string {
  let p = raw.replace(/[`"',]/g, '').trim();
  if (!p.startsWith('/')) {
    p = `${WORKSPACE_ROOT}/${p.replace(/^\.?\//, '')}`;
  }
  return p;
}

interface WritePlan {
  target: string;
  original: string;
  proposed: string;
  language: string;
  reason: string;
}

function planWrite(
  text: string,
  lower: string,
  fileStore: ReturnType<typeof useFileStore.getState>
): WritePlan | null {
  const isWrite = /(create|add|write|make|generate|append|insert)/.test(lower);
  if (!isWrite) return null;

  // Try to find a path token
  const pathMatch =
    text.match(/(?:in|to|file|named?)\s+([\w./-]+\.[\w]+)/i) ||
    text.match(/([\w./-]+\.[\w]+)/);
  let target = pathMatch ? resolvePath(pathMatch[1]) : `${WORKSPACE_ROOT}/src/generated.ts`;

  const original = fileStore.readFile(target) ?? '';
  const ext = (target.split('.').pop() ?? 'ts').toLowerCase();
  const language =
    ext === 'md' ? 'markdown' : ext === 'json' ? 'json' : ext === 'css' ? 'css' : 'typescript';

  // Generate plausible content based on keywords.
  let snippet = '';
  let reason = '';

  if (/debounce/.test(lower)) {
    snippet = `\nexport function debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  delay = 250\n): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n`;
    reason = 'Adds a generic `debounce` utility.';
  } else if (/throttle/.test(lower)) {
    snippet = `\nexport function throttle<T extends (...args: any[]) => void>(\n  fn: T,\n  limit = 250\n): (...args: Parameters<T>) => void {\n  let last = 0;\n  return (...args: Parameters<T>) => {\n    const now = Date.now();\n    if (now - last >= limit) {\n      last = now;\n      fn(...args);\n    }\n  };\n}\n`;
    reason = 'Adds a generic `throttle` utility.';
  } else if (/add\b|sum|math/.test(lower)) {
    snippet = `\nexport function add(a: number, b: number): number {\n  return a + b;\n}\n\nexport function multiply(a: number, b: number): number {\n  return a * b;\n}\n`;
    reason = 'Adds basic math helpers (`add`, `multiply`).';
  } else if (/hello|greet/.test(lower)) {
    snippet = `\nexport function hello(name = 'world'): string {\n  return \`Hello, \${name}!\`;\n}\n`;
    reason = 'Adds a `hello` greeting function.';
  } else if (language === 'markdown') {
    snippet = `\n## License\n\nReleased under the MIT License.\n`;
    reason = 'Appends a License section.';
  } else {
    const fnName = baseName(target).replace(/\.[\w]+$/, '') || 'run';
    snippet = `\nexport function ${sanitizeIdent(fnName)}(): void {\n  // TODO: implement\n  console.log('${fnName} called');\n}\n`;
    reason = `Scaffolds a \`${sanitizeIdent(fnName)}\` function.`;
  }

  const proposed = original
    ? original.replace(/\s*$/, '\n') + snippet
    : `// ${baseName(target)} — generated by GreenForge agent\n${snippet}`;

  return { target, original, proposed, language, reason };
}

function sanitizeIdent(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[0-9]/.test(cleaned) ? '_' + cleaned : cleaned || 'run';
}
