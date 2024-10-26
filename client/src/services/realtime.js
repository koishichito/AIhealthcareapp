import { RealtimeClient } from '@openai/realtime-api-beta';

export class RealtimeService {
  constructor() {
    this.client = new RealtimeClient({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    });

    // セッション設定の初期化
    this.client.updateSession({
      instructions: `
        あなたは健康管理アプリ「ヘルスハンター」のアシスタントです。
        ユーザーの健康管理をサポートし、クエストの達成を判定します。
        ユーザーの回答を聞き、クエストの要件を満たしているかを判断してください。
        
        判断基準:
        1. 乾燥対策クエスト: 加湿器の使用や水分摂取など、具体的な対策を取っているか
        2. 寒暖差対策クエスト: 適切な重ね着や温度調節を行っているか
        3. 花粉対策クエスト: マスクや眼鏡の着用、外出後の対策などを行っているか
        
        回答は簡潔に、かつフレンドリーな口調でお願いします。
      `,
      modalities: ['text', 'audio'],
      voice: 'shimmer',
    });
  }

  async connect() {
    await this.client.connect();
    await this.client.waitForSessionCreated();
  }

  disconnect() {
    this.client.disconnect();
  }

  async validateQuest(questType, userResponse) {
    return new Promise((resolve) => {
      let isValid = false;

      // 会話の更新をリッスン
      this.client.on('conversation.updated', ({ item }) => {
        if (item.role === 'assistant' && item.formatted.text) {
          // AIの回答に基づいて判定
          isValid = item.formatted.text.toLowerCase().includes('達成');
        }
      });

      // クエスト完了時の処理
      this.client.on('conversation.item.completed', () => {
        resolve(isValid);
      });

      // クエストタイプと回答を送信
      this.client.sendUserMessageContent([
        {
          type: 'input_text',
          text: `クエストタイプ: ${questType}\nユーザーの回答: ${userResponse}\nこのクエストは達成されましたか？`,
        },
      ]);
    });
  }
}

export default new RealtimeService();