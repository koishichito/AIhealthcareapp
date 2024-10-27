// server/src/websocket/wsServer.js
const WebSocket = require('ws');
const { QuestValidationService } = require('../services/questValidation');
const { AudioTranscriptionService } = require('../services/audioTranscription');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/v1/realtime',
      headers: {
        'OpenAI-Beta': 'realtime=v1'
      }
    });
    this.questValidationService = new QuestValidationService();
    this.audioTranscriptionService = new AudioTranscriptionService();
    this.setupWebSocket();
  }

  // この setupWebSocket メソッド全体を以下のコードに置き換え
  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateId('client_');
      console.log(`New client connected: ${clientId}`);

      // クライアントの状態を追跡
      ws.isAlive = true;
      ws.clientId = clientId;

      // Pingによる接続監視
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // 通常の接続処理
      this.sendSessionCreated(ws);
      this.sendConversationCreated(ws);

      ws.on('message', async (message) => {
        try {
          const event = JSON.parse(message);
          await this.handleEvent(ws, event);
        } catch (error) {
          this.sendError(ws, error.message);
        }
      });

      ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    // 定期的な接続チェック
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log(`Terminating inactive client: ${ws.clientId}`);
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  sendSessionCreated(ws) {
    const event = {
      event_id: this.generateEventId(),
      type: 'session.created',
      session: {
        id: this.generateId('session_'),
        status: 'created'
      }
    };
    ws.send(JSON.stringify(event));
  }

  sendConversationCreated(ws) {
    const event = {
      event_id: this.generateEventId(),
      type: 'conversation.created',
      conversation: {
        id: this.generateId('conv_'),
        status: 'created'
      }
    };
    ws.send(JSON.stringify(event));
  }

  async handleEvent(ws, event) {
    switch (event.type) {
      case 'input_audio_buffer.append':
        await this.handleAudioAppend(ws, event);
        break;

      case 'conversation.item.create':
        await this.handleItemCreate(ws, event);
        break;

      case 'response.create':
        await this.handleResponseCreate(ws, event);
        break;

      default:
        console.warn('Unknown event type:', event.type);
    }
  }

  async handleAudioAppend(ws, event) {
    try {
      const audioData = event.audio;
      // 音声データの処理と音声認識
      // VADによる発話検出
      this.sendSpeechStarted(ws);
    } catch (error) {
      this.sendError(ws, error.message);
    }
  }

  sendSpeechStarted(ws) {
    const event = {
      event_id: this.generateEventId(),
      type: 'input_audio_buffer.speech_started',
      audio_start_ms: Date.now(),
      item_id: this.generateId('msg_')
    };
    ws.send(JSON.stringify(event));
  }

  async handleItemCreate(ws, event) {
    const item = {
      id: this.generateId('msg_'),
      object: 'realtime.item',
      type: event.item.type,
      status: 'completed',
      role: event.item.role,
      content: event.item.content
    };

    const response = {
      event_id: this.generateEventId(),
      type: 'conversation.item.created',
      item
    };
    ws.send(JSON.stringify(response));
  }

  generateEventId() {
    return `evt_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  sendError(ws, message) {
    const errorEvent = {
      event_id: this.generateEventId(),
      type: 'error',
      error: {
        type: 'server_error',
        message
      }
    };
    ws.send(JSON.stringify(errorEvent));
  }
}

module.exports = WebSocketServer;
