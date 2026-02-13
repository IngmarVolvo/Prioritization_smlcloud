
import React, { useState, useMemo } from 'react';
import { DataRequest } from '../types';
import { getStakeholderColor } from '../constants';

interface TimelineRoadmapProps {
  requests: DataRequest[];
  onUpdateRequest: (id: string, updates: Partial<DataRequest>) => void;
  onEditRequest: (request: DataRequest) => void;
}

const QUARTERS = [1, 2, 3, 4];
const TIERS = [
  { id: 3, label: 'Critical', color: 'border-l-red-500' },
  { id: 2, label: 'High', color: 'border-l-orange-500' },
  { id: 1, label: 'Medium', color: 'border-l-blue-500' },
  { id: 0, label: 'Low', color: 'border-l-slate-400' },
];

const TimelineRoadmap: React.FC<TimelineRoadmapProps> = ({ requests, onUpdateRequest, onEditRequest }) => {
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string, phase: 'analysis' | 'dev') => {
    e.dataTransfer.setData('requestId', id);
    e.dataTransfer.setData('phase', phase);
  };

  const handleDrop = (e: React.DragEvent, quarter: number, tier: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('requestId');
    const phase = e.dataTransfer.getData('phase');
    
    const updates: Partial<DataRequest> = { priorityTier: tier };
    if (phase === 'analysis') updates.analysisQuarter = quarter;
    else updates.devQuarter = quarter;

    onUpdateRequest(id, updates);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Timeline Strategy Canvas</h3>
            <p className="text-sm text-slate-500">Drag <span className="text-blue-600 font-bold">Analysis (A)</span> and <span className="text-indigo-600 font-bold">Dev (D)</span> phases to schedule. Click for details.</p>
          </div>
        </div>

        <div className="grid grid-cols-5 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
          <div className="p-4 bg-slate-100 font-black text-[10px] uppercase text-slate-400 border-r border-b border-white">Priority \ Timing</div>
          {QUARTERS.map(q => (
            <div key={q} className="p-4 bg-slate-100 font-black text-[10px] uppercase text-slate-500 text-center border-b border-white">Quarter {q}</div>
          ))}

          {TIERS.map(tier => (
            <React.Fragment key={tier.id}>
              <div className="p-4 flex flex-col justify-center border-r border-b border-white bg-slate-50/50">
                <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{tier.label}</span>
              </div>
              {QUARTERS.map(q => (
                <div 
                  key={q} 
                  onDrop={(e) => handleDrop(e, q, tier.id)}
                  onDragOver={handleDragOver}
                  className="p-3 border-r border-b border-white min-h-[160px] transition-colors hover:bg-white/50"
                >
                  <div className="flex flex-col gap-2">
                    {requests
                      .filter(r => (r.analysisQuarter === q || r.devQuarter === q) && r.priorityTier === tier.id)
                      .map(req => {
                        const isAnalysis = req.analysisQuarter === q;
                        const isDev = req.devQuarter === q;
                        
                        return (
                          <div key={req.id + (isAnalysis ? '-a' : '-d')} className="space-y-1">
                            {isAnalysis && (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, req.id, 'analysis')}
                                onClick={() => setSelectedRequest(req)}
                                className={`p-2 bg-white rounded-lg border-l-4 shadow-sm cursor-move hover:shadow-md transition-all border border-slate-200 border-l-blue-500 ${selectedRequest?.id === req.id ? 'ring-2 ring-blue-400' : ''}`}
                              >
                                <p className="text-[10px] font-bold text-slate-800 leading-tight truncate mb-1" title={req.title}>{req.title}</p>
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1 rounded">Analysis</span>
                                   <span className="text-[8px] font-bold text-slate-400">#{req.id.slice(0,4)}</span>
                                </div>
                              </div>
                            )}
                            {isDev && (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, req.id, 'dev')}
                                onClick={() => setSelectedRequest(req)}
                                className={`p-2 bg-white rounded-lg border-l-4 shadow-sm cursor-move hover:shadow-md transition-all border border-slate-200 border-l-indigo-500 ${selectedRequest?.id === req.id ? 'ring-2 ring-indigo-400' : ''}`}
                              >
                                <p className="text-[10px] font-bold text-slate-800 leading-tight truncate mb-1" title={req.title}>{req.title}</p>
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1 rounded">Dev</span>
                                   <span className="text-[8px] font-bold text-slate-400">#{req.id.slice(0,4)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details Sidebar */}
      <div className="xl:w-80 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        <div className="p-4 bg-white border-b flex justify-between items-center">
          <h4 className="font-bold text-slate-800">Initiative Context</h4>
          {selectedRequest && (
            <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
          )}
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {selectedRequest ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Selected Workstream</p>
                <h5 className="font-bold text-slate-800 mb-2">{selectedRequest.title}</h5>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 italic">"{selectedRequest.description}"</p>
                
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Phase Workflow</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 p-2 bg-blue-50 rounded border border-blue-100 text-[10px] text-center">
                          <span className="block font-black text-blue-600 uppercase">Analysis</span>
                          Q{selectedRequest.analysisQuarter}
                       </div>
                       <i className="fa-solid fa-chevron-right text-slate-300 text-[10px]"></i>
                       <div className="flex-1 p-2 bg-indigo-50 rounded border border-indigo-100 text-[10px] text-center">
                          <span className="block font-black text-indigo-600 uppercase">Dev</span>
                          Q{selectedRequest.devQuarter}
                       </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Stakeholders</p>
                    <div className="flex flex-wrap gap-1">
                       {selectedRequest.stakeholders.map(s => (
                         <span key={s} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getStakeholderColor(s)}`}>{s}</span>
                       ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onEditRequest(selectedRequest)}
                  className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  Modify Strategy
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
               <i className="fa-solid fa-hand-pointer text-4xl mb-4"></i>
               <p className="text-sm font-bold">Select a Phase Card</p>
               <p className="text-xs mt-1">To view full strategic alignment and resource requirements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineRoadmap;
