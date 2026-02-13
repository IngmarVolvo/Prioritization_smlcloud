
import React from 'react';
import { OrgProject, OrgTeam } from '../types';

interface OrgViewProps {
  projects: OrgProject[];
  teams: OrgTeam[];
}

const OrgView: React.FC<OrgViewProps> = ({ projects, teams }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <i className="fa-solid fa-network-wired text-indigo-600"></i>
            Organizational Big Picture
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualizing the intersection of cross-functional teams and major projects. 
            Rows highlighted in <span className="text-indigo-600 font-bold">Indigo</span> indicate a direct dependency on the Data Platform.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-4 text-left text-[10px] font-black uppercase text-slate-400 border-b border-r w-64 sticky left-0 bg-slate-50 z-10">Strategic Initiative</th>
                {teams.map(team => (
                  <th key={team.id} className="p-4 text-center text-[10px] font-black uppercase text-slate-500 border-b min-w-[120px]">
                    {team.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr 
                  key={project.id} 
                  className={`group transition-all ${project.hasDataPlatformDependency ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                >
                  <td className={`p-4 border-r border-b sticky left-0 z-10 ${project.hasDataPlatformDependency ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'bg-white'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{project.name}</span>
                      {project.hasDataPlatformDependency && (
                        <span className="text-indigo-600 text-xs" title="Requires Data Platform Integration">
                          <i className="fa-solid fa-database animate-pulse"></i>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">{project.description}</p>
                  </td>
                  {teams.map(team => {
                    const isAssigned = project.assignedTeamIds.includes(team.id);
                    return (
                      <td key={team.id} className="p-4 border-b text-center">
                        {isAssigned ? (
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${project.hasDataPlatformDependency ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-800 text-white'}`}>
                            <i className="fa-solid fa-check text-xs"></i>
                          </div>
                        ) : (
                          <span className="text-slate-100 font-black">•</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={teams.length + 1} className="p-20 text-center text-slate-400 italic">
                    No strategic initiatives mapped. Configure projects in the settings tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Platform Gravity</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">{projects.filter(p => p.hasDataPlatformDependency).length}</span>
            <span className="text-sm font-bold opacity-80">Connected Initiatives</span>
          </div>
          <p className="text-[10px] mt-4 leading-relaxed opacity-70 italic font-medium">
            "These projects require data services for success. Their deadlines are our hard constraints."
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Team Engagement Rate</p>
          <div className="flex items-baseline gap-2 text-slate-800">
            <span className="text-4xl font-black">
              {teams.length > 0 ? (teams.filter(t => projects.some(p => p.assignedTeamIds.includes(t.id))).length / teams.length * 100).toFixed(0) : 0}%
            </span>
            <span className="text-sm font-bold text-slate-400">Collaborating</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Org Surface Area</p>
          <div className="flex items-baseline gap-2 text-slate-800">
            <span className="text-4xl font-black">{projects.length}</span>
            <span className="text-sm font-bold text-slate-400">Active Strategic Streams</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgView;
