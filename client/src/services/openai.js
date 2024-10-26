// src/services/openai.js
import axios from 'axios';

export class OpenAIService {
  static async validateQuest(questType, userResponse) {
    const prompt = `
    あなたは健康管理アプリのアシスタントです。
    クエストタイプ: ${questType}
    ユーザーの回答: ${userResponse}
    このクエストが達成されたかを true か false で返してください。理由の説明は不要です。
    `;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const result = response.data.choices[0].message.content.trim().toLowerCase();
      return result.includes('true');
    } catch (error) {
      console.error('OpenAI API error:', error);
      return false;
    }
  }
}
