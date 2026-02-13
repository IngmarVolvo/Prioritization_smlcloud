
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { DataRequest } from '../types';

interface RICEChartProps {
  data: DataRequest[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl">
        <p className="font-bold text-slate-800 text-sm mb-1">{item.title}</p>
        <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">{item.stakeholders.join(' • ')}</p>
        <hr className="my-2 border-slate-100" />
        <p className="text-sm font-black text-indigo-600 mb-1">Score: {item.score.toFixed(1)}</p>
        <p className="text-[10px] text-slate-500">Effort: <span className="font-bold">{item.metrics.effort} Mandays</span></p>
        <p className="text-[10px] text-slate-500">Reach: <span className="font-bold">{item.metrics.reach.toLocaleString()}</span></p>
      </div>
    );
  }
  return null;
};

const RICEChart: React.FC<RICEChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    ...d,
    x: d.metrics.effort,
    y: (d.metrics.reach * d.metrics.impact * d.metrics.confidence) / 100, // Normalized for visual scale
  }));

  return (
    <div className="w-full h-[350px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
          <XAxis type="number" dataKey="x" name="Effort" unit=" MD" stroke="#94a3b8" fontSize={10}>
            <Label value="Effort (Mandays)" position="bottom" offset={20} fill="#64748b" fontSize={10} fontWeight="bold" />
          </XAxis>
          <YAxis type="number" dataKey="y" name="Impact Potential" stroke="#94a3b8" fontSize={10}>
            <Label value="Strategic Value Potential" angle={-90} position="left" style={{ textAnchor: 'middle' }} fill="#64748b" fontSize={10} fontWeight="bold" />
          </YAxis>
          <ZAxis type="number" dataKey="score" range={[100, 1000]} name="RICE Score" />
          <Tooltip content={<CustomTooltip />} />
          <Scatter name="Requests" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.score > 40 ? '#4f46e5' : '#94a3b8'} fillOpacity={0.7} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RICEChart;
