
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => (
  <div className="bg-white px-5 py-6 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg`}>
      <i className={icon}></i>
    </div>
    <div>
      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-zinc-800 tracking-tight">{value}</p>
    </div>
  </div>
);

export default MetricCard;
