// client/src/services/websocket.js
class WebSocketService {
  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    WebSocketService.instance = this;
    
    this.ws = null;
    this.handlers = new Map();
    this.baseUrl = process.env.REACT_APP_WEBSOCKET_URL;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:4000';
        this.ws = new WebSocket(`${wsUrl}/v1/realtime`);

        this.ws.onopen = () => {
          console.log('WebSocket Connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        // 他のイベントハンドラは同じ
      } catch (error) {
        reject(error);
      }
    });
  }

  handleServerEvent(event) {
    if (event.type) {
      const handlers = this.handlers.get(event.type) || [];
      handlers.forEach(handler => handler(event));
      
      // 全イベントハンドラーにも通知
      const allHandlers = this.handlers.get('*') || [];
      allHandlers.forEach(handler => handler(event));
    }
  }

  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  off(eventType, handler) {
    if (this.handlers.has(eventType)) {
      const handlers = this.handlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, ...data });
      this.ws.send(message);
    }
  }

  generateEventId() {
    return `evt_${Math.random().toString(36).substr(2, 9)}`;
  }

  async attemptReconnect(maxAttempts = 5, delay = 5000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        await this.connect();
        console.log('Reconnected successfully');
        return;
      } catch (error) {
        attempts++;
        console.log(`Reconnection attempt ${attempts} failed`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    console.error('Failed to reconnect after maximum attempts');
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log('WebSocket disconnected');
    }
  }

  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketService();
    }
    return this.instance;
  }
}

// シングルトンインスタンスをエクスポート
const websocketService = new WebSocketService();
export default websocketService;
