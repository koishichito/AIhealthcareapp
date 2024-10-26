// src/services/quests.js
export const QuestTypes = {
    HUMIDITY: '乾燥対策',
    TEMPERATURE: '寒暖差',
    POLLEN: '花粉',
  };
  
  export class QuestService {
    static getDailyQuests() {
      const today = new Date();
      const season = this.getSeason(today);
      const weather = this.getCurrentWeather();
  
      let quests = [];
  
      if (season === 'winter') {
        quests.push({
          type: QuestTypes.HUMIDITY,
          name: '乾燥注意報',
          description: '今日は乾燥しやすい日です。加湿器を使用しましたか？',
        });
      }
  
      if (Math.abs(weather.morningTemp - weather.noonTemp) > 8) {
        quests.push({
          type: QuestTypes.TEMPERATURE,
          name: '寒暖差警報',
          description: '今日は寒暖差が大きいです。重ね着で調節しましたか？',
        });
      }
  
      if (season === 'spring' && weather.pollenCount > 100) {
        quests.push({
          type: QuestTypes.POLLEN,
          name: '花粉警報',
          description: 'マスクと眼鏡を着用して外出しましたか？',
        });
      }
  
      return quests;
    }
  
    static getSeason(date) {
      const month = date.getMonth() + 1;
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      if (month >= 9 && month <= 11) return 'autumn';
      return 'winter';
    }
  
    static getCurrentWeather() {
      return {
        morningTemp: 15,
        noonTemp: 25,
        humidity: 40,
        pollenCount: 150,
      };
    }
  
    static getTitle(completedQuests) {
      if (completedQuests >= 100) return '伝説のハンター';
      if (completedQuests >= 50) return '熟練ハンター';
      if (completedQuests >= 20) return '成長したハンター';
      return '見習いハンター';
    }
  
    static calculateHealthLevel(recentQuests) {
      const completionRate =
        recentQuests.filter((q) => q.completed).length / recentQuests.length;
      if (completionRate >= 0.8) return 3;
      if (completionRate >= 0.5) return 2;
      return 1;
    }
  }  