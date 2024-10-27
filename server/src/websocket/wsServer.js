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
          console.log('Received event:', event.type); // イベントタイプをログ出力
          await this.handleEvent(ws, event);
        } catch (error) {
          console.error('Error handling message:', error);
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

      case 'analyze_health':
        await this.handleHealthAnalysis(ws, event);
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

  // 新しいメソッドを追加
  async handleHealthAnalysis(ws, event) {
    try {
      const { audioData } = event;
      
      if (!audioData) {
        throw new Error('Audio data is missing');
      }

      // 音声データをバイナリ形式に変換
      const audioBuffer = Buffer.from(audioData, 'base64');

      // 音声の文字起こしを実行
      const transcription = await this.audioTranscriptionService.transcribeAudio(audioBuffer);

      // クエストの検証を実行
      const questData = {
        questType: '乾燥対策', // クエストタイプを適切に設定してください
        text: transcription
      };
      const validationResult = await this.questValidationService.validateQuest(questData.questType, questData.text);

      // 健康レベルとアドバイスを決定
      const healthLevel = validationResult.isValid ? 3 : 1; // 例: 有効ならレベル3、無効ならレベル1
      const healthAdvice = validationResult.isValid ? '素晴らしい対策です！引き続き健康管理を頑張りましょう。' : 'もう一度クエストに取り組んでみてください。';

      // クライアントに結果を送信
      const response = {
        event_id: this.generateEventId(),
        type: 'health_assessment',
        payload: {
          level: healthLevel,
          advice: healthAdvice
        }
      };

      ws.send(JSON.stringify(response));
    } catch (error) {
      this.sendError(ws, error.message);
    }
  }
}

module.exports = WebSocketServer;
