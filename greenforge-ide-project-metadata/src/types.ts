export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  size?: number;
  modified?: string;
}

export interface EditorTab {
  id: string;
  path: string;
  filename: string;
  content: string;
  isDirty: boolean;
  language: string;
  cursorPosition?: { line: number; column: number };
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: number;
  streaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'done' | 'error';
}

export interface ToolResult {
  id: string;
  name: string;
  output: unknown;
  error?: string;
}

export interface WALEntry {
  id: number;
  timestamp: number;
  agentId: string;
  action: string;
  target: string;
  payload: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  gate: 0 | 1 | 2 | null;
}

export type WSMessageType =
  | 'terminal.input'
  | 'terminal.output'
  | 'terminal.resize'
  | 'terminal.ready'
  | 'file.change'
  | 'file.create'
  | 'file.delete'
  | 'agent.message'
  | 'agent.stream'
  | 'agent.tool_call'
  | 'approval.request'
  | 'approval.response'
  | 'debate.update';

export interface WSMessage {
  type: WSMessageType;
  data: unknown;
  id?: string;
  timestamp?: number;
}
