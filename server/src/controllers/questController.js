// server/src/controllers/questController.js
const { QuestValidationService } = require('../services/questValidation');

class QuestController {
  constructor() {
    this.validationService = new QuestValidationService();
  }

  async validateQuest(questData) {
    try {
      const { questType, text } = questData;
      return await this.validationService.validateQuest(questType, text);
    } catch (error) {
      console.error('Quest validation error:', error);
      throw error;
    }
  }

  async getQuestTypes() {
    return [
      {
        type: '乾燥対策',
        description: '乾燥から身を守るための対策を実施する'
      },
      {
        type: '寒暖差',
        description: '急激な温度変化に対応する'
      },
      {
        type: '花粉',
        description: '花粉症対策を実施する'
      }
    ];
  }
}

module.exports = new QuestController();