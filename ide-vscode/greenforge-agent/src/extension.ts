import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('GreenForge Agent extension is now active!');

    const provider = new GreenForgeAgentPanelProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(GreenForgeAgentPanelProvider.viewType, provider)
    );
}

export function deactivate() {}

class GreenForgeAgentPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'greenforgeAgentView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this._handleSendMessage(data.message);
                    break;
            }
        });
    }

    private async _handleSendMessage(message: string) {
        if (!this._view) {
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const result = await response.json() as { error?: string; message?: string; filePath?: string; content?: string };

            if (result.error) {
                this._view.webview.postMessage({
                    type: 'error',
                    message: result.error
                });
                return;
            }

            // Cria o arquivo no workspace
            if (result.filePath && result.content !== undefined) {
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    const rootPath = workspaceFolders[0].uri;
                    const filePath = vscode.Uri.joinPath(rootPath, result.filePath);
                    
                    // Garante que o diretório pai existe
                    const parentDir = filePath.with({ path: filePath.path.substring(0, filePath.path.lastIndexOf('/')) });
                    try {
                        await vscode.workspace.fs.createDirectory(parentDir);
                    } catch (e) {
                        // Diretório já existe ou não foi possível criar
                    }

                    // Escreve o arquivo
                    const contentBytes = Buffer.from(result.content, 'utf-8');
                    await vscode.workspace.fs.writeFile(filePath, contentBytes);

                    this._view.webview.postMessage({
                        type: 'fileCreated',
                        message: result.message,
                        filePath: result.filePath
                    });
                } else {
                    this._view.webview.postMessage({
                        type: 'error',
                        message: 'No workspace folder open'
                    });
                }
            }
        } catch (error) {
            this._view.webview.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GreenForge Agent</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 10px;
            background-color: var(--vscode-sideBar-background);
            color: var(--vscode-foreground);
        }
        .chat-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 60px);
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
            background-color: var(--vscode-input-background);
        }
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 4px;
        }
        .message.user {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .message.agent {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-input-border);
        }
        .message.error {
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
        }
        .message.success {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
        }
        .input-container {
            display: flex;
            gap: 5px;
        }
        textarea {
            flex: 1;
            resize: none;
            height: 60px;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
        }
        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            opacity: 0.9;
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .file-link {
            color: var(--vscode-textLink-foreground);
            text-decoration: underline;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="messages" id="messages"></div>
        <div class="input-container">
            <textarea id="messageInput" placeholder="Digite sua ordem para o agente..."></textarea>
            <button id="sendButton" onclick="sendMessage()">Enviar</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(content, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + type;
            messageDiv.innerHTML = content;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            messageInput.value = '';
            sendButton.disabled = true;

            vscode.postMessage({
                type: 'sendMessage',
                message: message
            });
        }

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        window.addEventListener('message', (event) => {
            const data = event.data;
            sendButton.disabled = false;

            switch (data.type) {
                case 'error':
                    addMessage('Erro: ' + data.message, 'error');
                    break;
                case 'fileCreated':
                    let fileMsg = data.message + '<br>';
                    fileMsg += 'Arquivo criado: <span class="file-link" onclick="openFile(\'' + data.filePath + '\')">' + data.filePath + '</span>';
                    addMessage(fileMsg, 'success');
                    break;
            }
        });

        function openFile(filePath) {
            vscode.postMessage({
                type: 'openFile',
                filePath: filePath
            });
        }
    </script>
</body>
</html>`;
    }
}
