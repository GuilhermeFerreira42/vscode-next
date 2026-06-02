import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useFileStore } from '../stores/fileStore';
import { WORKSPACE_ROOT, baseName } from '../lib/vfs';

const PROMPT = '\x1b[92m❯\x1b[0m ';

export function TerminalPanel() {
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const lineRef = useRef('');

  const fileStore = useFileStore();

  const print = useCallback((text: string, color = '') => {
    const term = xtermRef.current;
    if (!term) return;
    if (color) term.write(`\x1b[${color}m${text}\x1b[0m\r\n`);
    else term.writeln(text);
  }, []);

  const runCommand = useCallback((input: string) => {
    const term = xtermRef.current;
    if (!term) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    const [cmd, ...args] = trimmed.split(/\s+/);
    const arg = args.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        print('Available commands:', '36');
        print('  ls [path]               List files');
        print('  cat <file>              Show file content');
        print('  tree                    Show directory tree');
        print('  mkdir <name>            Create directory');
        print('  touch <file>            Create empty file');
        print('  echo <text>             Print text');
        print('  rm <path>               Delete file or directory');
        print('  mv <old> <new>          Rename or move');
        print('  download <path>         Download file or directory as ZIP');
        print('  zip                     Download entire project as ZIP');
        print('  clear                   Clear terminal');
        print('  reset                   Reset workspace to empty');
        break;

      case 'ls':
        const files = Object.keys(fileStore.vfs.files)
          .filter((p) => !arg || p.includes(arg))
          .map((p) => baseName(p))
          .sort();
        const dirs = Array.from(fileStore.vfs.dirs)
          .filter((d) => d !== WORKSPACE_ROOT && (!arg || d.includes(arg)))
          .map((d) => baseName(d) + '/')
          .sort();
        [...dirs, ...files].forEach((item) => print(item));
        break;

      case 'cat':
        if (!arg) {
          print('Usage: cat <file>', '31');
          break;
        }
        let catPath = arg.startsWith('/') ? arg : `${WORKSPACE_ROOT}/${arg}`;
        const content = fileStore.readFile(catPath);
        if (content === undefined) {
          print(`cat: ${arg}: No such file or directory`, '31');
        } else {
          content.split('\n').forEach((line) => print(line));
        }
        break;

      case 'tree':
        const paths = Object.keys(fileStore.vfs.files)
          .sort()
          .map((p) => p.replace(WORKSPACE_ROOT + '/', ''));
        if (paths.length === 0) {
          print('Workspace is empty.');
        } else {
          paths.forEach((p) => {
            const depth = (p.match(/\//g) || []).length;
            print('  '.repeat(depth) + '└─ ' + baseName(p));
          });
        }
        break;

      case 'mkdir':
        if (!arg) {
          print('Usage: mkdir <name>', '31');
          break;
        }
        const dirPath = arg.startsWith('/') ? arg : `${WORKSPACE_ROOT}/${arg}`;
        fileStore.createDirectory(dirPath);
        print(`Created directory: ${arg}`);
        break;

      case 'touch':
        if (!arg) {
          print('Usage: touch <filename>', '31');
          break;
        }
        const touchPath = arg.startsWith('/') ? arg : `${WORKSPACE_ROOT}/${arg}`;
        fileStore.createFile(touchPath, '');
        print(`Created file: ${arg}`);
        break;

      case 'echo':
        print(arg || '');
        break;

      case 'rm':
        if (!arg) {
          print('Usage: rm <path>', '31');
          break;
        }
        const rmPath = arg.startsWith('/') ? arg : `${WORKSPACE_ROOT}/${arg}`;
        if (fileStore.exists(rmPath)) {
          fileStore.deleteEntry(rmPath);
          print(`Removed: ${arg}`);
        } else {
          print(`rm: cannot remove '${arg}': No such file or directory`, '31');
        }
        break;

      case 'mv':
        if (args.length < 2) {
          print('Usage: mv <old> <new>', '31');
          break;
        }
        const oldPath = args[0].startsWith('/') ? args[0] : `${WORKSPACE_ROOT}/${args[0]}`;
        const newPath = args[1].startsWith('/') ? args[1] : `${WORKSPACE_ROOT}/${args[1]}`;
        if (fileStore.exists(oldPath)) {
          fileStore.renameEntry(oldPath, newPath);
          print(`Renamed ${args[0]} → ${args[1]}`);
        } else {
          print(`mv: cannot stat '${args[0]}': No such file or directory`, '31');
        }
        break;

      case 'download':
        if (!arg) {
          print('Usage: download <path>', '31');
          break;
        }
        const downloadPath = arg.startsWith('/') ? arg : `${WORKSPACE_ROOT}/${arg}`;
        if (fileStore.vfs.files[downloadPath]) {
          fileStore.downloadFile(downloadPath);
          print(`Downloading ${arg}...`);
        } else if (fileStore.vfs.dirs.has(downloadPath)) {
          fileStore.downloadDirectory(downloadPath);
          print(`Downloading directory ${arg} as ZIP...`);
        } else {
          print(`No such file or directory: ${arg}`, '31');
        }
        break;

      case 'zip':
        fileStore.downloadProject();
        print('Downloading entire workspace as ZIP...');
        break;

      case 'clear':
        term.clear();
        break;

      case 'reset':
        if (confirm('Reset the entire workspace? This cannot be undone.')) {
          fileStore.resetWorkspace();
          print('Workspace has been reset to empty state.', '33');
        }
        break;

      default:
        print(`Command not found: ${cmd}. Type 'help' for available commands.`, '33');
    }
  }, [fileStore, print]);

  useEffect(() => {
    if (!termRef.current) return;

    const term = new Terminal({
      fontSize: 13,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      cursorBlink: true,
      theme: {
        background: '#11151c',
        foreground: '#e2e8f0',
        cursor: '#22d3ee',
        selectionBackground: '#334155',
      },
      convertEol: true,
      rows: 18,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    setTimeout(() => fitAddon.fit(), 50);

    xtermRef.current = term;

    term.writeln('\x1b[1;36mGreenForge Terminal — Persistent Virtual Filesystem\x1b[0m');
    term.writeln('The workspace is saved to localStorage. Type \x1b[33mhelp\x1b[0m for commands.\r\n');
    term.write(PROMPT);

    const onData = term.onData((data: string) => {
      const code = data.charCodeAt(0);

      if (data === '\r') {
        term.write('\r\n');
        runCommand(lineRef.current);
        lineRef.current = '';
        term.write(PROMPT);
      } else if (code === 127) {
        if (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code === 3) {
        term.write('^C\r\n');
        lineRef.current = '';
        term.write(PROMPT);
      } else if (data === '\t') {
        term.write('  ');
        lineRef.current += '  ';
      } else if (code >= 32) {
        lineRef.current += data;
        term.write(data);
      }
    });

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    if (termRef.current.parentElement) resizeObserver.observe(termRef.current.parentElement);

    return () => {
      onData.dispose();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [runCommand]);

  return <div ref={termRef} className="h-full w-full bg-[#11151c]" />;
}
