
import React, { useState, useMemo } from 'react';
import { DataRequest, Stakeholder, BusinessProcess, Location, RoleProfile } from '../types';
// Fixed: Added ALL_PROFILES to imports to resolve the missing name error
import { IMPACT_LEVELS, CONFIDENCE_LEVELS, BUSINESS_PROCESSES, BUSINESS_PROFILES, IT_PROFILES, ALL_PROFILES, calculateRICEScore } from '../constants';

interface RequestFormProps {
  initialData?: DataRequest | null;
  onSubmit: (request: Partial<DataRequest>) => void;
  onCancel: () => void;
  stakeholders: string[];
  locations: string[];
}

const RequestForm: React.FC<RequestFormProps> = ({ initialData, onSubmit, onCancel, stakeholders, locations }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    stakeholders: initialData?.stakeholders || [],
    businessProcesses: initialData?.businessProcesses || ['General'],
    locations: initialData?.locations || [],
    dependencies: initialData?.dependencies || '',
    roleEfforts: initialData?.roleEfforts || {} as Partial<Record<RoleProfile, number>>,
    neededRoles: initialData?.neededRoles || [] as RoleProfile[],
    reach: initialData?.metrics.reach || 50,
    impact: initialData?.metrics.impact || 1,
    confidence: initialData?.metrics.confidence || 0.8,
    analysisQuarter: initialData?.analysisQuarter || 1,
    devQuarter: initialData?.devQuarter || 1,
    priorityTier: initialData?.priorityTier || 1,
  });

  const totalEffort = useMemo(() => {
    return Object.values(formData.roleEfforts).reduce<number>((acc, val) => acc + (val as number || 0), 0);
  }, [formData.roleEfforts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = calculateRICEScore({
      reach: formData.reach,
      impact: formData.impact,
      confidence: formData.confidence,
      effort: totalEffort || 1, 
    });

    onSubmit({
      ...formData,
      metrics: {
        reach: formData.reach,
        impact: formData.impact,
        confidence: formData.confidence,
        effort: totalEffort || 1,
      },
      score,
      createdAt: initialData?.createdAt || Date.now(),
    });
  };

  const toggleItem = (list: any[], item: any, key: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: list.includes(item)
        ? list.filter(i => i !== item)
        : [...list, item]
    }));
  };

  const updateRoleEffort = (role: RoleProfile, value: number) => {
    setFormData(prev => {
      const newNeeded = [...prev.neededRoles];
      if (value > 0 && !newNeeded.includes(role)) {
        newNeeded.push(role);
      }
      return {
        ...prev,
        roleEfforts: { ...prev.roleEfforts, [role]: value },
        neededRoles: newNeeded
      };
    });
  };

  const renderRoleRow = (role: RoleProfile) => (
    <div key={role} className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center h-5">
        <input
          id={`check-${role}`}
          type="checkbox"
          className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
          checked={formData.neededRoles.includes(role)}
          onChange={() => toggleItem(formData.neededRoles, role, 'neededRoles')}
        />
      </div>
      <div className="flex-1">
        <label htmlFor={`check-${role}`} className="block text-[10px] font-bold text-slate-700 cursor-pointer uppercase tracking-tighter">
          {role}
        </label>
        <div className="relative mt-1">
          <input
            type="number"
            min="0"
            step="0.5"
            className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-indigo-400 pr-7"
            placeholder="0"
            value={formData.roleEfforts[role] || ''}
            onChange={e => updateRoleEffort(role, parseFloat(e.target.value) || 0)}
          />
          <span className="absolute right-2 top-1.5 text-[9px] font-bold text-slate-400">MD</span>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Request Title</label>
            <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" placeholder="Initiative name..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea required className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none h-20" placeholder="Value description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Analysis Phase</label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.analysisQuarter} onChange={e => setFormData({ ...formData, analysisQuarter: parseInt(e.target.value) })}>
                {[1,2,3,4].map(q => <option key={q} value={q}>Quarter {q}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Development Phase</label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.devQuarter} onChange={e => setFormData({ ...formData, devQuarter: parseInt(e.target.value) })}>
                {[1,2,3,4].map(q => <option key={q} value={q}>Quarter {q}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Stakeholders</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-dashed rounded-lg">
              {stakeholders.map(s => (
                <button key={s} type="button" onClick={() => toggleItem(formData.stakeholders, s, 'stakeholders')} className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${formData.stakeholders.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Locations</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-dashed rounded-lg">
              {locations.map(loc => (
                <button key={loc} type="button" onClick={() => toggleItem(formData.locations, loc, 'locations')} className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${formData.locations.includes(loc) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><i className="fa-solid fa-calculator text-blue-600"></i> RICE Core</h3>
            <div>
              <label className="flex justify-between text-sm font-semibold text-slate-700 mb-1">Reach <span>{formData.reach} users/mo</span></label>
              <input type="range" min="1" max="500" step="5" className="w-full" value={formData.reach} onChange={e => setFormData({ ...formData, reach: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Impact</label>
              <div className="grid grid-cols-3 gap-2">
                {IMPACT_LEVELS.map(lvl => (
                  <button key={lvl.value} type="button" onClick={() => setFormData({ ...formData, impact: lvl.value })} className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all ${formData.impact === lvl.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>{lvl.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><i className="fa-solid fa-users-gear text-indigo-600"></i> Resource Estimate</h3>
            <p className="text-[10px] text-slate-500 italic -mt-2">Check the box to flag a role as required, even with 0 MD.</p>
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 border-b border-indigo-100">Business</p>
                {BUSINESS_PROFILES.map(renderRoleRow)}
              </div>
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 border-b border-indigo-100">IT & Data</p>
                {IT_PROFILES.map(renderRoleRow)}
              </div>
            </div>
            <div className="pt-2 border-t border-indigo-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 uppercase">Total Effort:</span>
              <span className="text-lg font-black text-indigo-600">{totalEffort} MD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
        <button type="submit" className="px-8 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
          {initialData ? 'Update Initiative' : 'Add to Roadmap'}
        </button>
      </div>
    </form>
  );
};

export default RequestForm;
