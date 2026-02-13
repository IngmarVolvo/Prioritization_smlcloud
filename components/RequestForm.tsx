
import React, { useState, useMemo } from 'react';
import { DataRequest, Stakeholder, BusinessProcess, Location, RoleProfile } from '../types';
import { IMPACT_LEVELS, CONFIDENCE_LEVELS, BUSINESS_PROFILES, IT_PROFILES, calculateRICEScore } from '../constants';

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
      metrics: { reach: formData.reach, impact: formData.impact, confidence: formData.confidence, effort: totalEffort || 1 },
      score,
      createdAt: initialData?.createdAt || Date.now(),
    });
  };

  const toggleItem = (list: any[], item: any, key: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: list.includes(item) ? list.filter(i => i !== item) : [...list, item]
    }));
  };

  const updateRoleEffort = (role: RoleProfile, value: number) => {
    setFormData(prev => {
      const newNeeded = [...prev.neededRoles];
      if (value > 0 && !newNeeded.includes(role)) newNeeded.push(role);
      return { ...prev, roleEfforts: { ...prev.roleEfforts, [role]: value }, neededRoles: newNeeded };
    });
  };

  const renderRoleRow = (role: RoleProfile) => (
    <div key={role} className="flex items-center gap-3 mb-4 bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100">
      <input
        type="checkbox"
        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 accent-indigo-600"
        checked={formData.neededRoles.includes(role)}
        onChange={() => toggleItem(formData.neededRoles, role, 'neededRoles')}
      />
      <div className="flex-1">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{role}</label>
        <div className="relative mt-1">
          <input
            type="number" min="0" step="0.5"
            className="w-full bg-white px-3 py-1.5 rounded-xl border border-zinc-200 text-xs outline-none focus:border-indigo-400 pr-10"
            placeholder="0" value={formData.roleEfforts[role] || ''}
            onChange={e => updateRoleEffort(role, parseFloat(e.target.value) || 0)}
          />
          <span className="absolute right-3 top-2 text-[9px] font-bold text-zinc-300">DAYS</span>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Initiative Identity</label>
            <input 
              required type="text" className="w-full px-5 py-3 rounded-2xl border border-zinc-200 outline-none focus:border-indigo-400 transition-colors text-zinc-800 font-medium" 
              placeholder="What are we building?" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
            <textarea 
              required className="w-full mt-4 px-5 py-4 rounded-2xl border border-zinc-200 outline-none focus:border-indigo-400 transition-colors h-32 text-zinc-700 leading-relaxed" 
              placeholder="Describe the strategic value and scope..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Analysis Phase</label>
              <select className="w-full bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100 text-sm font-medium" value={formData.analysisQuarter} onChange={e => setFormData({ ...formData, analysisQuarter: parseInt(e.target.value) })}>
                {[1,2,3,4].map(q => <option key={q} value={q}>Quarter {q}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Delivery Phase</label>
              <select className="w-full bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100 text-sm font-medium" value={formData.devQuarter} onChange={e => setFormData({ ...formData, devQuarter: parseInt(e.target.value) })}>
                {[1,2,3,4].map(q => <option key={q} value={q}>Quarter {q}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Target Stakeholders</label>
            <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              {stakeholders.map(s => (
                <button 
                  key={s} type="button" onClick={() => toggleItem(formData.stakeholders, s, 'stakeholders')} 
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all border ${formData.stakeholders.includes(s) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-zinc-500 border-zinc-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-widest">
              <i className="fa-solid fa-chart-line text-indigo-600"></i> RICE Drivers
            </h3>
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Reach <span>{formData.reach.toLocaleString()} users</span></label>
                <input type="range" min="1" max="1000" step="10" className="w-full accent-indigo-600" value={formData.reach} onChange={e => setFormData({ ...formData, reach: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Strategic Impact</label>
                <div className="grid grid-cols-3 gap-2">
                  {IMPACT_LEVELS.map(lvl => (
                    <button key={lvl.value} type="button" onClick={() => setFormData({ ...formData, impact: lvl.value })} className={`py-2 text-[10px] font-bold rounded-xl transition-all border ${formData.impact === lvl.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-400 border-zinc-200'}`}>{lvl.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50/50 p-8 rounded-[2rem] border border-zinc-200 space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-widest">
              <i className="fa-solid fa-user-gear text-indigo-600"></i> Resource Matrix
            </h3>
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-200 pb-1">Business</p>
                {BUSINESS_PROFILES.map(renderRoleRow)}
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-200 pb-1">Engineering</p>
                {IT_PROFILES.map(renderRoleRow)}
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200 flex justify-between items-center">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Projected Effort:</span>
              <span className="text-xl font-black text-indigo-600 tracking-tight">{totalEffort} Mandays</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-12 border-t border-zinc-100">
        <button type="button" onClick={onCancel} className="px-8 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</button>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 transition-all">
          {initialData ? 'Update Initiative' : 'Confirm Roadmap Addition'}
        </button>
      </div>
    </form>
  );
};

export default RequestForm;
