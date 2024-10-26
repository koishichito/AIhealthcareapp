// src/components/QuestHistory.js
import React from 'react';
import { Card } from './ui/card';
import { Shield } from 'lucide-react';

const QuestHistory = ({ quests }) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6" />
          <h2 className="text-xl font-bold">達成クエスト履歴</h2>
        </div>
        <div className="space-y-2">
          {quests.map((quest, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              <p className="text-gray-800">{quest.name}</p>
              <p className="text-sm text-gray-500">{quest.date}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default QuestHistory;
