
import React from 'react';
import { DataRequest } from '../types';
import { STAKEHOLDER_COLORS } from '../constants';

interface DependencyViewProps {
  requests: DataRequest[];
}

const DependencyView: React.FC<DependencyViewProps> = ({ requests }) => {
  const initiativesWithDependencies = requests.filter(r => r.dependencies && r.dependencies.trim().length > 0);
  const totalBlocked = initiativesWithDependencies.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Critical Path Depth</p>
          <p className="text-3xl font-black text-red-600">{totalBlocked}</p>
          <p className="text-xs text-slate-500 mt-1">Initiatives with external/internal blockers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Cross-Workstream Links</p>
          <p className="text-3xl font-black text-blue-600">
            {requests.reduce((acc, r) => acc + (r.dependencies.split(',').length), 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Unique dependency constraints mapped</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unblocked Value</p>
          <p className="text-3xl font-black text-emerald-600">
            {requests.filter(r => !r.dependencies).reduce((acc, r) => acc + r.score, 0).toFixed(0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Ready for immediate execution</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Dependency Map</h3>
          <p className="text-sm text-slate-500">Mapping critical relationships between data initiatives and external system upgrades.</p>
        </div>
        
        <div className="p-6">
          {initiativesWithDependencies.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {initiativesWithDependencies.map(req => (
                <div key={req.id} className="flex flex-col md:flex-row gap-6 p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`w-2 h-2 rounded-full ${STAKEHOLDER_COLORS[req.stakeholders[0]]?.split(' ')[0] || 'bg-slate-400'}`}></span>
                       <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{req.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                       {req.locations.map(loc => (
                         <span key={loc} className="text-[8px] font-bold bg-white border px-1 py-0.5 rounded text-slate-500">
                           {loc}
                         </span>
                       ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">RICE: {req.score.toFixed(0)}</span>
                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Effort: {req.metrics.effort} MD</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-slate-200 relative">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 border border-slate-200 rounded-full shadow-sm">
                         <i className="fa-solid fa-link text-slate-400 text-xs"></i>
                       </div>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
                    </div>
                  </div>

                  <div className="md:w-1/3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      Dependent On
                    </p>
                    <div className="space-y-2">
                      {req.dependencies.split(',').map((dep, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-amber-900 font-bold bg-white/50 p-2 rounded-lg border border-amber-200 shadow-sm">
                           <i className="fa-solid fa-database text-[10px]"></i>
                           {dep.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
               <i className="fa-solid fa-link-slash text-5xl text-slate-300 mb-4"></i>
               <h4 className="text-lg font-bold text-slate-700">No dependencies mapped yet</h4>
               <p className="text-sm text-slate-500">Add dependencies to your initiatives in the backlog to see them visualized here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DependencyView;
