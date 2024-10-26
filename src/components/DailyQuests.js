// src/components/DailyQuests.js
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Shield } from 'lucide-react';

const DailyQuests = ({ quests }) => {
  const [completedQuests, setCompletedQuests] = useState([]);

  const handleComplete = async (quest) => {
    const userResponse = prompt(quest.description);
    const isValid = await quest.onComplete(userResponse);
    if (isValid) {
      setCompletedQuests([...completedQuests, quest.name]);
    } else {
      alert('クエスト達成条件を満たしていません。');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">本日の緊急クエスト</h2>
        </div>
        <div className="space-y-2">
          {quests.map((quest, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded">
              <h3 className="font-bold">{quest.name}</h3>
              <p className="text-sm text-gray-600">{quest.description}</p>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleComplete(quest)}
                disabled={completedQuests.includes(quest.name)}
              >
                {completedQuests.includes(quest.name)
                  ? 'クエスト完了済み'
                  : 'クエスト完了'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DailyQuests;
