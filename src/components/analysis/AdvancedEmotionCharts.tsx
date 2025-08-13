'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  AreaChart,
  Area
} from 'recharts';

export const TrendChart: React.FC<{
  selectedChart: 'line' | 'radar' | 'area';
  chartData: Array<{ index: number; valence: number; arousal: number; dominance: number }>;
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
}> = ({ selectedChart, chartData, radarData }) => {
  return (
    <div className="h-80">
      {selectedChart === 'line' && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="valence" stroke="#10B981" strokeWidth={2} name="긍정성" />
            <Line type="monotone" dataKey="arousal" stroke="#3B82F6" strokeWidth={2} name="각성도" />
            <Line type="monotone" dataKey="dominance" stroke="#8B5CF6" strokeWidth={2} name="지배성" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {selectedChart === 'radar' && (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <RechartsRadar name="VAD 점수" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {selectedChart === 'area' && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="valence" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="긍정성" />
            <Area type="monotone" dataKey="arousal" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="각성도" />
            <Area type="monotone" dataKey="dominance" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="지배성" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const EmotionPie: React.FC<{
  data: Array<{ name: string; value: number; color: string }>;
}> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};


