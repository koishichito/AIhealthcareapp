// src/components/HealthStatus.js
import React from 'react';
import { Card } from './ui/card';
import { Shield } from 'lucide-react';

const HealthStatus = ({ level }) => {
  const getHealthIcon = () => {
    switch (level) {
      case 3:
        return <Shield className="w-16 h-16 text-green-500" />;
      case 2:
        return <Shield className="w-16 h-16 text-yellow-500" />;
      default:
        return <Shield className="w-16 h-16 text-red-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        {getHealthIcon()}
        <div>
          <h2 className="text-xl font-bold">健康レベル</h2>
          <p className="text-gray-600">レベル {level}</p>
        </div>
      </div>
    </Card>
  );
};

export default HealthStatus;
