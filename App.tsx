
import React, { useState, useMemo, useEffect } from 'react';
import { DataRequest, AIInsight, Stakeholder, BusinessProcess, Location, RoleProfile, ChatMessage, OrgTeam, OrgProject } from './types.ts';
import { DEFAULT_STAKEHOLDERS, DEFAULT_LOCATIONS, DEFAULT_TEAMS, DEFAULT_ORG_PROJECTS, getStakeholderColor } from './constants.tsx';
import RequestForm from './components/RequestForm.tsx';
import RICEChart from './components/RICEChart.tsx';
import MetricCard from './components/MetricCard.tsx';
import StakeholderMatrix from './components/StakeholderMatrix.tsx';
import TimelineRoadmap from './components/TimelineRoadmap.tsx';
import DependencyView from './components/DependencyView.tsx';
import ConfigurationView from './components/ConfigurationView.tsx';
import OrgView from './components/OrgView.tsx';
import { getAIStrategicInsights } from './services/geminiService.ts';

const INITIAL_DATA: DataRequest[] = [
  {
    id: '1',
    title: 'Real-time Stock Accuracy API',
    description: 'Provide live stock levels from Warehouse hubs to global planning.',
    stakeholders: ['Warehouse', 'Global Planning'],
    locations: ['Ghent', 'Lyon'],
    businessProcesses: ['Stock'],
    dependencies: 'SAP WMS 2.0 Integration',
    roleEfforts: { 'Data Engineer': 40, 'Tester': 10 },
    neededRoles: ['Data Engineer', 'Tester', 'Subject Matter Expert'],
    metrics: { reach: 150, impact: 3, confidence: 1, effort: 50 },
    score: 9,
    createdAt: Date.now(),
    analysisQuarter: 1,
    devQuarter: 2,
    priorityTier: 3,
    messages: []
  }
];

const App: React.FC = () => {
  // Config state
  const [stakeholders, setStakeholders] = useState<string[]>(DEFAULT_STAKEHOLDERS);
  const [locations, setLocations] = useState<string[]>(DEFAULT_LOCATIONS);
  const [teams, setTeams] = useState<OrgTeam[]>(DEFAULT_TEAMS);
  const [orgProjects, setOrgProjects] = useState<OrgProject[]>(DEFAULT_ORG_PROJECTS);

  // Roadmap states
  const [requests, setRequests] = useState<DataRequest[]>(INITIAL_DATA);
  const [draftRequests, setDraftRequests] = useState<DataRequest[]>(INITIAL_DATA);
  const [isDraftMode, setIsDraftMode] = useState(false);

  const activeRequests = isDraftMode ? draftRequests : requests;

  // View state
  const [activeTab, setActiveTab] = useState<'backlog' | 'matrix' | 'timeline' | 'org' | 'dependencies' | 'config'>('backlog');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<DataRequest | null>(null);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const handleSaveRequest = (requestData: Partial<DataRequest>) => {
    const updateFn = (prev: DataRequest[]) => {
      if (editingRequest) {
        return prev.map(r => r.id === editingRequest.id ? { ...r, ...requestData } as DataRequest : r);
      } else {
        const newReq = { ...requestData, id: Math.random().toString(36).substr(2, 9), messages: [] } as DataRequest;
        return [...prev, newReq];
      }
    };
    if (isDraftMode) setDraftRequests(updateFn);
    else setRequests(updateFn);
    closeForm();
  };

  const publishDraft = () => {
    if (confirm('Publish draft changes to the live roadmap?')) {
      setRequests(draftRequests);
      setIsDraftMode(false);
    }
  };

  const resetDraft = () => {
    if (confirm('Discard all draft changes?')) {
      setDraftRequests(requests);
    }
  };

  const updateRequest = (id: string, updates: Partial<DataRequest>) => {
    const fn = (prev: DataRequest[]) => prev.map(r => r.id === id ? { ...r, ...updates } : r);
    if (isDraftMode) setDraftRequests(fn);
    else setRequests(fn);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRequest(null);
  };

  const handleEdit = (request: DataRequest) => {
    setEditingRequest(request);
    setIsFormOpen(true);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await getAIStrategicInsights(activeRequests);
      alert("AI Analysis complete. Insights would be displayed in an AI Studio sidebar.");
    } catch (err) {
      alert("AI Service Error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Remove this initiative?')) {
      const fn = (prev: DataRequest[]) => prev.filter(r => r.id !== id);
      if (isDraftMode) setDraftRequests(fn);
      else setRequests(fn);
    }
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !chatRequestId) return;
    const msg: ChatMessage = { id: Date.now().toString(), author: 'Planner', text: chatMessage, timestamp: Date.now() };
    const fn = (prev: DataRequest[]) => prev.map(r => r.id === chatRequestId ? { ...r, messages: [...r.messages, msg] } : r);
    if (isDraftMode) setDraftRequests(fn);
    else setRequests(fn);
    setChatMessage('');
  };

  const activeChatRequest = activeRequests.find(r => r.id === chatRequestId);
  const totalEffort = activeRequests.reduce((acc, r) => acc + r.metrics.effort, 0);

  const NAV_ITEMS = [
    { id: 'backlog', label: 'Backlog', icon: 'fa-solid fa-list-check' },
    { id: 'matrix', label: 'Value Map', icon: 'fa-solid fa-layer-group' },
    { id: 'timeline', label: 'Timeline', icon: 'fa-solid fa-calendar-day' },
    { id: 'org', label: 'Big Picture', icon: 'fa-solid fa-network-wired' },
    { id: 'dependencies', label: 'Dependencies', icon: 'fa-solid fa-link' },
    { id: 'config', label: 'Configuration', icon: 'fa-solid fa-sliders' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-brain text-white text-sm"></i>
            </div>
            <div>
              <h1 className="font-bold text-zinc-900 tracking-tight leading-none text-sm">Prioritizer</h1>
              <span className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">AI Studio v2.6</span>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-100">
           <div className="bg-zinc-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Workspace</p>
              <div className="flex gap-2">
                 <button 
                   onClick={() => setIsDraftMode(false)}
                   className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${!isDraftMode ? 'bg-white shadow-sm text-zinc-900 ring-1 ring-zinc-200' : 'text-zinc-400'}`}
                 >Live</button>
                 <button 
                   onClick={() => setIsDraftMode(true)}
                   className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${isDraftMode ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400'}`}
                 >Draft</button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-widest">
               {NAV_ITEMS.find(n => n.id === activeTab)?.label}
             </h2>
             {isDraftMode && (
               <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                 Draft Mode Active
               </span>
             )}
          </div>

          <div className="flex items-center gap-4">
            {isDraftMode && (
              <div className="flex gap-2 pr-4 border-r border-zinc-200">
                <button onClick={resetDraft} className="text-xs font-bold text-zinc-400 hover:text-zinc-600">Discard</button>
                <button onClick={publishDraft} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Publish Changes</button>
              </div>
            )}
            <button 
              onClick={() => { setEditingRequest(null); setIsFormOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              New Initiative
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'backlog' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Strategic Score" value={activeRequests.reduce((a,b)=>a+b.score,0).toFixed(0)} icon="fa-solid fa-gem" color="bg-indigo-50 text-indigo-600" />
                <MetricCard label="Initiatives" value={activeRequests.length} icon="fa-solid fa-list-check" color="bg-blue-50 text-blue-600" />
                <MetricCard label="Burden" value={`${totalEffort} MD`} icon="fa-solid fa-users-gear" color="bg-emerald-50 text-emerald-600" />
                <MetricCard label="Active Hubs" value={new Set(activeRequests.flatMap(r => r.locations)).size} icon="fa-solid fa-location-dot" color="bg-rose-50 text-rose-600" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-bold text-zinc-800 text-sm">Initiative Backlog</h3>
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      {isAnalyzing ? 'Analyzing...' : 'Strategic Review (AI)'}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase text-zinc-400">
                          <th className="px-6 py-4">Workstream</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Score</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {activeRequests.map(req => (
                          <tr key={req.id} onClick={() => handleEdit(req)} className="hover:bg-zinc-50 transition-colors cursor-pointer group">
                            <td className="px-6 py-5">
                              <p className="font-semibold text-zinc-900 text-sm">{req.title}</p>
                              <div className="flex gap-1 mt-1">
                                {req.stakeholders.slice(0, 2).map(s => (
                                  <span key={s} className="text-[9px] font-medium text-zinc-400">#{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex gap-1">
                                  <span className="text-[9px] bg-zinc-100 text-zinc-600 font-bold px-2 py-0.5 rounded-full">ANLY: Q{req.analysisQuarter}</span>
                                  <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">DEV: Q{req.devQuarter}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-center font-black text-indigo-600 text-base">{req.score.toFixed(0)}</td>
                            <td className="px-6 py-5">
                               <div className="flex justify-end gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); setChatRequestId(req.id); }} className="p-2 text-zinc-300 hover:text-indigo-600 transition-colors">
                                    <i className="fa-solid fa-comment"></i>
                                  </button>
                                  <button onClick={(e) => deleteRequest(req.id, e)} className="p-2 text-zinc-200 hover:text-red-500 transition-colors group-hover:opacity-100 opacity-0">
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                   <h3 className="font-bold text-zinc-800 text-sm mb-6">Strategic Potential</h3>
                   <RICEChart data={activeRequests} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matrix' && <StakeholderMatrix requests={activeRequests} onEditRequest={handleEdit} />}
          {activeTab === 'timeline' && <TimelineRoadmap requests={activeRequests} onUpdateRequest={updateRequest} onEditRequest={handleEdit} />}
          {activeTab === 'org' && <OrgView projects={orgProjects} teams={teams} />}
          {activeTab === 'dependencies' && <DependencyView requests={activeRequests} />}
          {activeTab === 'config' && (
            <ConfigurationView 
              stakeholders={stakeholders} locations={locations} teams={teams} projects={orgProjects}
              onUpdateStakeholders={setStakeholders} onUpdateLocations={setLocations} onUpdateTeams={setTeams} onUpdateProjects={setOrgProjects}
            />
          )}
        </div>
      </main>

      {/* Chat Sidebar Modal */}
      {chatRequestId && activeChatRequest && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/10 backdrop-blur-sm">
          <div className="bg-white w-full max-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-zinc-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-900">Initiative Chat</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{activeChatRequest.title}</p>
              </div>
              <button onClick={() => setChatRequestId(null)} className="p-2 text-zinc-400 hover:text-zinc-900">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar bg-zinc-50/30">
              {activeChatRequest.messages.map(msg => (
                <div key={msg.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{msg.author}</span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white border-t border-zinc-100 flex gap-2">
              <input 
                type="text" className="flex-1 px-4 py-2 bg-zinc-50 rounded-xl outline-none text-sm border border-zinc-100 focus:border-indigo-300 transition-colors" 
                placeholder="Share a thought..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()} 
              />
              <button onClick={handleSendChatMessage} className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Large Modal for Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/20 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">{editingRequest ? 'Edit Initiative' : 'New Roadmap Item'}</h2>
              <button onClick={closeForm} className="text-zinc-400 hover:text-zinc-900 p-2">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
              <RequestForm initialData={editingRequest} onSubmit={handleSaveRequest} onCancel={closeForm} stakeholders={stakeholders} locations={locations} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
