export class WebSocketService {
    constructor() {
      this.ws = null;
      this.messageHandlers = new Map();
      this.baseUrl = process.env.REACT_APP_WEBSOCKET_URL || 'wss://your-websocket-server.com';
    }
  
    async connect() {
      return new Promise((resolve, reject) => {
        try {
          this.ws = new WebSocket(this.baseUrl);
          
          this.ws.onopen = () => {
            console.log('WebSocket Connected');
            resolve();
          };
  
          this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          };
  
          this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            reject(error);
          };
  
          this.ws.onclose = () => {
            console.log('WebSocket Disconnected');
            this.reconnect();
          };
        } catch (error) {
          reject(error);
        }
      });
    }
  
    async reconnect() {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        try {
          await this.connect();
        } catch (error) {
          console.error('Reconnection failed:', error);
          // 5秒後に再試行
          setTimeout(() => this.reconnect(), 5000);
        }
      }
    }
  
    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
  
    subscribe(type, handler) {
      if (!this.messageHandlers.has(type)) {
        this.messageHandlers.set(type, []);
      }
      this.messageHandlers.get(type).push(handler);
    }
  
    unsubscribe(type, handler) {
      if (this.messageHandlers.has(type)) {
        const handlers = this.messageHandlers.get(type);
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    }
  
    handleMessage(data) {
      const { type, payload } = data;
      if (this.messageHandlers.has(type)) {
        this.messageHandlers.get(type).forEach(handler => handler(payload));
      }
    }
  
    send(type, payload) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, payload }));
      } else {
        console.error('WebSocket is not connected');
      }
    }
  }
  
  export default new WebSocketService();