
import React, { useMemo, useState } from 'react';
import { DataRequest, RoleProfile, Location, Stakeholder } from '../types';
import { ALL_PROFILES, BUSINESS_PROFILES, IT_PROFILES, getStakeholderColor } from '../constants';

interface StakeholderMatrixProps {
  requests: DataRequest[];
  onEditRequest?: (request: DataRequest) => void;
}

const StakeholderMatrix: React.FC<StakeholderMatrixProps> = ({ requests, onEditRequest }) => {
  const [selectedCell, setSelectedCell] = useState<{ loc: Location; stake: Stakeholder } | null>(null);

  // Dynamic axis from current data and config would be better, but we'll use active requests' scopes
  const currentLocations = useMemo(() => Array.from(new Set(requests.flatMap(r => r.locations))).sort(), [requests]);
  const currentStakeholders = useMemo(() => Array.from(new Set(requests.flatMap(r => r.stakeholders))).sort(), [requests]);

  const matrix = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    currentLocations.forEach(loc => {
      m[loc] = {};
      currentStakeholders.forEach(stake => m[loc][stake] = 0);
    });

    requests.forEach(req => {
      req.locations.forEach(loc => {
        req.stakeholders.forEach(stake => {
          if (m[loc] && m[loc][stake] !== undefined) m[loc][stake] += req.score;
        });
      });
    });
    return m;
  }, [requests, currentLocations, currentStakeholders]);

  const profileWorkload = useMemo(() => {
    const workload: Record<RoleProfile, number> = {} as Record<RoleProfile, number>;
    ALL_PROFILES.forEach(p => workload[p] = 0);
    requests.forEach(req => {
      (Object.entries(req.roleEfforts) as [RoleProfile, number][]).forEach(([role, md]) => workload[role] += (md || 0));
    });
    return workload;
  }, [requests]);

  const maxVal = Math.max(...Object.values(matrix).flatMap(s => Object.values(s)), 1);

  const getIntensity = (val: number, isSelected: boolean) => {
    if (val === 0) return 'bg-slate-50 text-slate-300';
    const opacity = (val / maxVal);
    let base = 'bg-blue-100 text-blue-800';
    if (opacity > 0.8) base = 'bg-blue-700 text-white';
    else if (opacity > 0.6) base = 'bg-blue-500 text-white';
    else if (opacity > 0.4) base = 'bg-blue-400 text-white';
    else if (opacity > 0.2) base = 'bg-blue-200 text-blue-900';
    
    return isSelected ? `${base} ring-4 ring-indigo-400 ring-inset` : base;
  };

  const filteredRequests = useMemo(() => {
    if (!selectedCell) return [];
    return requests.filter(r => r.locations.includes(selectedCell.loc) && r.stakeholders.includes(selectedCell.stake))
      .sort((a, b) => b.score - a.score);
  }, [selectedCell, requests]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex-1">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Stakeholder Value Matrix</h3>
            <p className="text-sm text-slate-500">Total projected strategic score distributed by node and persona.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b">Location</th>
                  {currentStakeholders.map(stake => (
                    <th key={stake} className="p-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter border-b min-w-[80px]">{stake}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentLocations.map(loc => (
                  <tr key={loc}>
                    <td className="p-3 border-r border-b text-sm font-bold text-slate-700 bg-slate-50">{loc}</td>
                    {currentStakeholders.map(stake => {
                      const val = matrix[loc][stake];
                      const isSelected = selectedCell?.loc === loc && selectedCell?.stake === stake;
                      return (
                        <td 
                          key={stake} 
                          onClick={() => setSelectedCell({ loc, stake })}
                          className={`p-3 border-b text-center text-xs font-mono cursor-pointer transition-all ${getIntensity(val, isSelected)}`}
                        >
                          {val > 0 ? val.toFixed(0) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:w-96 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          <div className="p-4 bg-white border-b flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Cell Alignment</h4>
            {selectedCell && <button onClick={() => setSelectedCell(null)} className="text-slate-400"><i className="fa-solid fa-xmark"></i></button>}
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {selectedCell ? (
              <div className="space-y-3">
                {filteredRequests.map(req => (
                  <div key={req.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{req.title}</p>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{req.score.toFixed(0)}</span>
                    </div>
                    {onEditRequest && (
                      <button onClick={() => onEditRequest(req)} className="w-full py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded text-[10px] font-bold transition-all mt-2">
                        View/Edit Initiative
                      </button>
                    )}
                  </div>
                ))}
                {filteredRequests.length === 0 && <p className="text-xs text-slate-400 text-center py-10">No items found for this cell.</p>}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-6"><i className="fa-solid fa-mouse-pointer text-4xl mb-4"></i><p className="text-sm font-bold">Select a Value Cell</p></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Workload summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest border-b pb-2">Business Readiness Requirement</h4>
          {BUSINESS_PROFILES.map(p => (
            <div key={p} className="flex justify-between items-center mb-2 text-xs font-bold">
               <span className="text-slate-600">{p}</span>
               <span className="text-indigo-600">{profileWorkload[p]} MD</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest border-b pb-2">Technical Delivery Requirement</h4>
          {IT_PROFILES.map(p => (
            <div key={p} className="flex justify-between items-center mb-2 text-xs font-bold">
               <span className="text-slate-600">{p}</span>
               <span className="text-blue-600">{profileWorkload[p]} MD</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StakeholderMatrix;
