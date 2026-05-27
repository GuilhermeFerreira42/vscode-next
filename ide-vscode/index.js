const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const targetFolder = 'openvscode-server-v1.109.5-linux-x64';
const binaryPath = path.join(__dirname, targetFolder, 'bin', 'openvscode-server');

console.log('Starting OpenVSCode Server on port', PORT);

const serverProcess = spawn(binaryPath, [
  '--host', '0.0.0.0',
  '--port', PORT.toString(),
  '--without-connection-token',
  '--disable-telemetry',
  '--disable-workspace-trust',
  '--locale=pt-BR'
], { stdio: 'inherit' });

serverProcess.on('exit', (code) => {
    console.log('VSCode Server exited with code', code);
    process.exit(code || 0);
});
