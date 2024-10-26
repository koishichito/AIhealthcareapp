// src/App.js
import React, { useState, useEffect } from 'react';
import HealthStatus from './components/HealthStatus';
import HunterTitle from './components/HunterTitle';
import QuestHistory from './components/QuestHistory';
import DailyQuests from './components/DailyQuests';
import { OpenAIService } from './services/openai';
import { QuestService } from './services/quests';

function App() {
  const [healthLevel, setHealthLevel] = useState(1);
  const [title, setTitle] = useState('見習いハンター');
  const [questHistory, setQuestHistory] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);

  useEffect(() => {
    // 日次クエストの設定
    const quests = QuestService.getDailyQuests().map((quest) => ({
      ...quest,
      onComplete: async (userResponse) => {
        const isValid = await OpenAIService.validateQuest(
          quest.type,
          userResponse
        );
        return isValid;
      },
    }));
    setDailyQuests(quests);
  }, []);

  useEffect(() => {
    // 健康レベルと称号の更新
    setHealthLevel(QuestService.calculateHealthLevel(questHistory));
    setTitle(QuestService.getTitle(questHistory.length));
  }, [questHistory]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="text-center p-4">
          <h1 className="text-3xl font-bold text-gray-800">HealthHunter</h1>
        </div>

        {/* メインコンテンツグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左カラム */}
          <div className="space-y-4">
            <HealthStatus level={healthLevel} />
            <HunterTitle title={title} />
          </div>

          {/* 右カラム */}
          <div className="space-y-4">
            <QuestHistory quests={questHistory} />
            <DailyQuests
              quests={dailyQuests.map((quest) => ({
                ...quest,
                onComplete: async (userResponse) => {
                  const isValid = await quest.onComplete(userResponse);
                  if (isValid) {
                    setQuestHistory([
                      {
                        name: quest.name,
                        date: new Date().toLocaleDateString(),
                        completed: true,
                      },
                      ...questHistory,
                    ]);
                  }
                  return isValid;
                },
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
