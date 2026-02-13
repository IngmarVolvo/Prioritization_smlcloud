
import React, { useState } from 'react';
import { OrgTeam, OrgProject } from '../types';

interface ConfigurationViewProps {
  stakeholders: string[];
  locations: string[];
  teams: OrgTeam[];
  projects: OrgProject[];
  onUpdateStakeholders: (list: string[]) => void;
  onUpdateLocations: (list: string[]) => void;
  onUpdateTeams: (list: OrgTeam[]) => void;
  onUpdateProjects: (list: OrgProject[]) => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({ 
  stakeholders, 
  locations, 
  teams,
  projects,
  onUpdateStakeholders, 
  onUpdateLocations,
  onUpdateTeams,
  onUpdateProjects
}) => {
  const [newItem, setNewItem] = useState({ stakeholder: '', location: '', team: '' });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    hasDataPlatformDependency: false,
    assignedTeamIds: [] as string[]
  });

  const addItem = (type: 'stakeholder' | 'location' | 'team') => {
    if (type === 'stakeholder' && newItem.stakeholder.trim()) {
      onUpdateStakeholders([...stakeholders, newItem.stakeholder.trim()]);
      setNewItem({ ...newItem, stakeholder: '' });
    } else if (type === 'location' && newItem.location.trim()) {
      onUpdateLocations([...locations, newItem.location.trim()]);
      setNewItem({ ...newItem, location: '' });
    } else if (type === 'team' && newItem.team.trim()) {
      onUpdateTeams([...teams, { id: Date.now().toString(), name: newItem.team.trim() }]);
      setNewItem({ ...newItem, team: '' });
    }
  };

  const addProject = () => {
    if (!newProject.name.trim()) return;
    
    if (editingProjectId) {
      onUpdateProjects(projects.map(p => p.id === editingProjectId ? { ...newProject, id: p.id } : p));
      setEditingProjectId(null);
    } else {
      onUpdateProjects([...projects, { ...newProject, id: Date.now().toString() }]);
    }
    
    setNewProject({ name: '', description: '', hasDataPlatformDependency: false, assignedTeamIds: [] });
  };

  const handleEditProject = (p: OrgProject) => {
    setEditingProjectId(p.id);
    setNewProject({
      name: p.name,
      description: p.description,
      hasDataPlatformDependency: p.hasDataPlatformDependency,
      assignedTeamIds: p.assignedTeamIds
    });
    // Scroll to the form
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeItem = (type: 'stakeholder' | 'location' | 'team' | 'project', idOrIdx: any) => {
    if (type === 'stakeholder') onUpdateStakeholders(stakeholders.filter((_, i) => i !== idOrIdx));
    if (type === 'location') onUpdateLocations(locations.filter((_, i) => i !== idOrIdx));
    if (type === 'team') onUpdateTeams(teams.filter(t => t.id !== idOrIdx));
    if (type === 'project') onUpdateProjects(projects.filter(p => p.id !== idOrIdx));
  };

  const toggleTeamForProject = (teamId: string) => {
    setNewProject(prev => ({
      ...prev,
      assignedTeamIds: prev.assignedTeamIds.includes(teamId)
        ? prev.assignedTeamIds.filter(id => id !== teamId)
        : [...prev.assignedTeamIds, teamId]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Stakeholder Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-users text-blue-600"></i>
            Platform Stakeholders
          </h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Finance..." value={newItem.stakeholder} onChange={e => setNewItem({ ...newItem, stakeholder: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addItem('stakeholder')}
            />
            <button onClick={() => addItem('stakeholder')} className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 font-bold">Add</button>
          </div>
          <div className="space-y-2 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {stakeholders.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">{s}</span>
                <button onClick={() => removeItem('stakeholder', idx)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-indigo-600"></i>
            Operational Hubs
          </h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Singapore..." value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addItem('location')}
            />
            <button onClick={() => addItem('location')} className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 font-bold">Add</button>
          </div>
          <div className="space-y-2 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {locations.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">{l}</span>
                <button onClick={() => removeItem('location', idx)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            ))}
          </div>
        </div>

        {/* Team Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-people-group text-emerald-600"></i>
            Org-Wide Teams
          </h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Digital Sales..." value={newItem.team} onChange={e => setNewItem({ ...newItem, team: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addItem('team')}
            />
            <button onClick={() => addItem('team')} className="bg-emerald-600 text-white px-4 rounded-lg hover:bg-emerald-700 font-bold">Add</button>
          </div>
          <div className="space-y-2 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {teams.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">{t.name}</span>
                <button onClick={() => removeItem('team', t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            ))}
          </div>
        </div>

        {/* Project Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-rocket text-orange-600"></i>
            Strategic Initiatives (Big Picture)
          </h3>
          <div id="project-form" className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 border p-6 rounded-xl transition-all ${editingProjectId ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50/50 border-slate-200'}`}>
            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-slate-400">{editingProjectId ? 'Editing Initiative' : 'New Strategic Initiative'}</p>
              <input 
                type="text" className="w-full px-4 py-2 border rounded-lg outline-none" 
                placeholder="Project Name..." value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})}
              />
              <textarea 
                className="w-full px-4 py-2 border rounded-lg outline-none h-24" 
                placeholder="Description..." value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
              />
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" className="w-5 h-5 accent-indigo-600" 
                  checked={newProject.hasDataPlatformDependency} onChange={e => setNewProject({...newProject, hasDataPlatformDependency: e.target.checked})}
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Has Data Platform Dependency</span>
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-slate-400 mb-2">Assign Teams Involved</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border bg-white rounded-lg">
                {teams.map(team => (
                  <button 
                    key={team.id} onClick={() => toggleTeamForProject(team.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${newProject.assignedTeamIds.includes(team.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
              <button 
                onClick={addProject}
                className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                {editingProjectId ? 'Update Initiative' : 'Create Initiative'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} className={`flex justify-between items-center p-4 rounded-xl border ${p.hasDataPlatformDependency ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{p.name}</span>
                    {p.hasDataPlatformDependency && <i className="fa-solid fa-database text-indigo-500 text-xs"></i>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.assignedTeamIds.map(tid => {
                      const tname = teams.find(t => t.id === tid)?.name || 'Unknown';
                      return <span key={tid} className="text-[9px] font-bold px-1.5 py-0.5 bg-white border rounded text-slate-500">{tname}</span>;
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditProject(p)} className="text-slate-400 hover:text-indigo-600 p-2 transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={() => removeItem('project', p.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationView;
