
import React from 'react';
import { OrgProject, OrgTeam } from '../types';

interface OrgViewProps {
  projects: OrgProject[];
  teams: OrgTeam[];
}

const OrgView: React.FC<OrgViewProps> = ({ projects, teams }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="mb-10">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
            <i className="fa-solid fa-network-wired text-indigo-600"></i>
            Strategic Cross-Reference
          </h2>
          <p className="text-xs text-zinc-500 mt-2 max-w-2xl leading-relaxed">
            Mapping major organizational workstreams against cross-functional teams.
            Workstreams requiring <span className="font-bold text-indigo-600">Data Platform Integration</span> are highlighted to indicate dependencies.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="p-5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-r w-72 sticky left-0 bg-zinc-50 z-10">Strategic Initiative</th>
                {teams.map(team => (
                  <th key={team.id} className="p-5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b min-w-[140px]">
                    {team.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {projects.map(project => (
                <tr 
                  key={project.id} 
                  className={`group transition-all ${project.hasDataPlatformDependency ? 'bg-indigo-50/20' : 'hover:bg-zinc-50/40'}`}
                >
                  <td className={`p-6 border-r border-zinc-50 sticky left-0 z-10 transition-colors ${project.hasDataPlatformDependency ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-900 text-sm tracking-tight">{project.name}</span>
                      {project.hasDataPlatformDependency && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-300"></div>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">{project.description}</p>
                  </td>
                  {teams.map(team => {
                    const isAssigned = project.assignedTeamIds.includes(team.id);
                    return (
                      <td key={team.id} className="p-6 text-center">
                        {isAssigned ? (
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${project.hasDataPlatformDependency ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-800 text-white'}`}>
                            <i className="fa-solid fa-check text-[10px]"></i>
                          </div>
                        ) : (
                          <div className="w-1 h-1 bg-zinc-200 rounded-full mx-auto"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-xl">
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Ecosystem Influence</p>
           <div className="flex items-baseline gap-2">
             <span className="text-4xl font-bold tracking-tight">{projects.filter(p => p.hasDataPlatformDependency).length}</span>
             <span className="text-zinc-500 text-xs font-medium">Critical Dependencies</span>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col justify-center">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Org Integration</p>
           <p className="text-3xl font-bold text-zinc-800">
             {teams.length > 0 ? (teams.filter(t => projects.some(p => p.assignedTeamIds.includes(t.id))).length / teams.length * 100).toFixed(0) : 0}%
           </p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col justify-center">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Strategic Stream Count</p>
           <p className="text-3xl font-bold text-zinc-800">{projects.length}</p>
        </div>
      </div>
    </div>
  );
};

export default OrgView;
