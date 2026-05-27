const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PORT = process.env.PORT || 3000;
const EXPRESS_PORT = 4000;
const targetFolder = 'openvscode-server-v1.109.5-linux-x64';
const binaryPath = path.join(__dirname, targetFolder, 'bin', 'openvscode-server');
const extensionSourcePath = path.join(__dirname, 'greenforge-agent');
const extensionDestPath = '/root/.openvscode-server/extensions/greenforge-agent';

// Instala a extensão automaticamente se ainda não estiver instalada
function installExtension() {
  if (!fs.existsSync(extensionDestPath)) {
    console.log('Installing GreenForge Agent extension...');
    fs.mkdirSync(path.dirname(extensionDestPath), { recursive: true });
    fs.cpSync(extensionSourcePath, extensionDestPath, { recursive: true });
    console.log('GreenForge Agent extension installed at', extensionDestPath);
  } else {
    console.log('GreenForge Agent extension already installed.');
  }
}

// Sobe o servidor Express na porta 4000 com a rota POST /agent
function startExpressServer() {
  const app = express();
  app.use(express.json());

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  app.post('/agent', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message field is required' });
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `Você é um assistente de codificação. Receba a solicitação do usuário e retorne APENAS um JSON no seguinte formato exato:
{
  "message": "uma breve descrição do que será criado",
  "filePath": "caminho/relativo/do/arquivo.ext",
  "content": "conteúdo completo do arquivo"
}

Solicitação do usuário: ${message}

Importante: Retorne apenas o JSON válido, sem markdown, sem explicações adicionais.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Tenta extrair o JSON da resposta
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsedResponse = JSON.parse(jsonStr);
      
      res.json({
        message: parsedResponse.message || 'Arquivo gerado com sucesso',
        filePath: parsedResponse.filePath || 'generated-file.txt',
        content: parsedResponse.content || ''
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  });

  app.listen(EXPRESS_PORT, '0.0.0.0', () => {
    console.log(`Express server running on port ${EXPRESS_PORT}`);
  });
}

// Instala a extensão antes de subir os servidores
installExtension();

// Sobe o servidor Express
startExpressServer();

// Sobe o OpenVSCode Server
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
