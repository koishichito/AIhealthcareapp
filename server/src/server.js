require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocketServer = require('./websocket/wsServer');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS設定
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// WebSocketサーバーの設定
const wsServer = new WebSocketServer(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}/v1/realtime`);
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});
