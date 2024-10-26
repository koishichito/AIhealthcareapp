// src/components/HunterTitle.js
import React from 'react';
import { Card } from './ui/card';
import { Shield } from 'lucide-react';

const HunterTitle = ({ title }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <Shield className="w-16 h-16 text-yellow-500" />
        <div>
          <h2 className="text-xl font-bold">称号</h2>
          <p className="text-gray-600">{title}</p>
        </div>
      </div>
    </Card>
  );
};

export default HunterTitle;
