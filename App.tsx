
import React, { useState, useMemo, useEffect } from 'react';
import { DataRequest, AIInsight, Stakeholder, BusinessProcess, Location, RoleProfile, ChatMessage, OrgTeam, OrgProject } from './types';
import { DEFAULT_STAKEHOLDERS, DEFAULT_LOCATIONS, DEFAULT_TEAMS, DEFAULT_ORG_PROJECTS, getStakeholderColor } from './constants';
import RequestForm from './components/RequestForm';
import RICEChart from './components/RICEChart';
import MetricCard from './components/MetricCard';
import StakeholderMatrix from './components/StakeholderMatrix';
import TimelineRoadmap from './components/TimelineRoadmap';
import DependencyView from './components/DependencyView';
import ConfigurationView from './components/ConfigurationView';
import OrgView from './components/OrgView';
import { getAIStrategicInsights } from './services/geminiService';

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
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
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
    if (confirm('Overwrite saved roadmap with your draft version?')) {
      setRequests(draftRequests);
      setIsDraftMode(false);
    }
  };

  const resetDraft = () => {
    if (confirm('Discard all draft changes and sync with saved roadmap?')) {
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
      const insights = await getAIStrategicInsights(activeRequests);
      setAiInsight(insights);
    } catch (err) {
      alert("AI Service Error. Check console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this request?')) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-4 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <i className="fa-solid fa-microchip text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Data Platform Roadmap</h1>
              <div className="flex items-center gap-2">
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Priority Console v2.6</p>
                {isDraftMode && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Draft Workspace</span>}
              </div>
            </div>
          </div>
          
          <nav className="flex bg-slate-800 rounded-lg p-1">
            {[
              { id: 'backlog', label: 'Backlog' },
              { id: 'matrix', label: 'Value Map' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'org', label: 'Big Picture' },
              { id: 'dependencies', label: 'Links' },
              { id: 'config', label: 'Config' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-tighter ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex gap-3">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button 
                onClick={() => setIsDraftMode(false)}
                className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${!isDraftMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
              >Live</button>
              <button 
                onClick={() => setIsDraftMode(true)}
                className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${isDraftMode ? 'bg-amber-500 text-white shadow' : 'text-slate-400'}`}
              >Draft</button>
            </div>
            <button onClick={() => { setEditingRequest(null); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all text-xs shadow-lg">
              <i className="fa-solid fa-plus"></i> New
            </button>
          </div>
        </div>
        
        {isDraftMode && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 py-2 mt-4 -mx-6 px-6 flex justify-between items-center text-amber-200 text-[10px] font-bold uppercase">
             <span>You are working on a DRAFT version. Changes are NOT permanent until published.</span>
             <div className="flex gap-4">
                <button onClick={resetDraft} className="hover:text-white border-b border-transparent hover:border-white">Discard Draft</button>
                <button onClick={publishDraft} className="bg-amber-500 text-white px-3 py-1 rounded shadow-lg hover:bg-amber-600">Publish Roadmap</button>
             </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {activeTab === 'backlog' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Strategic Value" value={activeRequests.reduce((a,b)=>a+b.score,0).toFixed(0)} icon="fa-solid fa-gem" color="bg-indigo-100 text-indigo-600" />
              <MetricCard label="Initiatives" value={activeRequests.length} icon="fa-solid fa-list-check" color="bg-blue-100 text-blue-600" />
              <MetricCard label="Resource Burden" value={`${totalEffort} MD`} icon="fa-solid fa-person-digging" color="bg-emerald-100 text-emerald-600" />
              <MetricCard label="Node Presence" value={new Set(activeRequests.flatMap(r => r.locations)).size} icon="fa-solid fa-map-location-dot" color="bg-orange-100 text-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Master Backlog</h3>
                  <button onClick={handleAnalyze} disabled={isAnalyzing} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                    {isAnalyzing ? 'Running AI...' : 'Optimize Strategy'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-500">
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeRequests.map(req => (
                        <tr key={req.id} onClick={() => handleEdit(req)} className="hover:bg-slate-50 cursor-pointer group">
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800 text-sm leading-tight">{req.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{req.description}</p>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex gap-1">
                                <span className="text-[8px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase">A: Q{req.analysisQuarter}</span>
                                <span className="text-[8px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded uppercase">D: Q{req.devQuarter}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-center font-black text-indigo-600 text-lg">{req.score.toFixed(0)}</td>
                          <td className="px-6 py-5">
                             <div className="flex justify-end items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setChatRequestId(req.id); }} className="p-2 text-slate-400 hover:text-indigo-600 relative">
                                  <i className="fa-solid fa-comment-dots"></i>
                                  {req.messages.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-indigo-600 text-white text-[7px] flex items-center justify-center rounded-full">{req.messages.length}</span>}
                                </button>
                                <button onClick={(e) => deleteRequest(req.id, e)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><i className="fa-solid fa-trash-can"></i></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Strategic Balance</h3>
                  <RICEChart data={activeRequests} />
                </div>
              </div>
            </div>
          </>
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
      </main>

      {/* Modals */}
      {chatRequestId && activeChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div><h2 className="text-xl font-bold">Initiative Chat</h2><p className="text-xs opacity-75">{activeChatRequest.title}</p></div>
              <button onClick={() => setChatRequestId(null)} className="p-2 hover:bg-white/10 rounded-full"><i className="fa-solid fa-xmark text-2xl"></i></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
              {activeChatRequest.messages.map(msg => (
                <div key={msg.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">{msg.author}</p>
                  <p className="text-sm text-slate-700">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input type="text" className="flex-1 px-4 py-2 bg-slate-100 rounded-full outline-none text-sm" placeholder="Type an idea..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()} />
              <button onClick={handleSendChatMessage} className="w-10 h-10 bg-indigo-600 text-white rounded-full"><i className="fa-solid fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingRequest ? 'Modify Initiative' : 'New Roadmap Item'}</h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark text-2xl"></i></button>
            </div>
            <div className="p-8">
              <RequestForm initialData={editingRequest} onSubmit={handleSaveRequest} onCancel={closeForm} stakeholders={stakeholders} locations={locations} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
