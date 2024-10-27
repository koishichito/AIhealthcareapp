class WebSocketService {
  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    WebSocketService.instance = this;
    
    this.ws = null;
    this.handlers = new Map();
    this.baseUrl = process.env.REACT_APP_WEBSOCKET_URL;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:4000';
        this.ws = new WebSocket(`${wsUrl}/v1/realtime`);

        this.ws.onopen = () => {
          console.log('WebSocket Connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleServerEvent(data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  handleServerEvent(event) {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
    
    // 特定のイベントタイプに対する処理を追加
    if (event.type === 'health_analysis_result') {
      console.log('Health analysis result received:', event.result);
      // 必要に応じて追加の処理を実装
    }
  }

  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, ...data });
      this.ws.send(message);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
