const OpenAI = require('openai');

class QuestValidationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async validateQuest(questType, text) {
    const validationRules = this.getValidationRules(questType);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `あなたは健康管理アプリ「ヘルスハンター」のアシスタントです。
                     以下の基準に基づいてユーザーの回答を評価してください：
                     ${validationRules}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const result = this.analyzeResponse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('クエストの検証中にエラーが発生しました');
    }
  }

  getValidationRules(questType) {
    const rules = {
      '乾燥対策': `
        - 加湿器の使用について言及があるか
        - 適切な水分摂取について述べているか
        - 室内の湿度管理について触れているか
      `,
      '寒暖差': `
        - 適切な衣服の選択について言及があるか
        - 温度変化への具体的な対策が述べられているか
        - 体温管理の方法が示されているか
      `,
      '花粉': `
        - マスクの着用について言及があるか
        - 外出後の対策（着替えや洗顔など）が述べられているか
        - 室内対策について触れているか
      `
    };

    return rules[questType] || '基本的な健康管理の基準に基づいて評価してください';
  }

  analyzeResponse(content) {
    // 肯定的な表現を探す
    const positiveIndicators = [
      '適切', '十分', '効果的', '良い', '完璧', 
      'できている', '実施している', '対策している'
    ];

    const hasPositiveIndicator = positiveIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );

    return {
      isValid: hasPositiveIndicator,
      message: content
    };
  }
}

module.exports = { QuestValidationService };
