
export type Stakeholder = string;
export type BusinessProcess = string;
export type Location = string;
export type RoleProfile = 
  | 'Subject Matter Expert'
  | 'Business Analyst'
  | 'Tester'
  | 'DPO'
  | 'Domain Architect'
  | 'Tech Lead'
  | 'Data Engineer'
  | 'Data Analyst';

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface RICEMetrics {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
}

export interface DataRequest {
  id: string;
  title: string;
  description: string;
  stakeholders: Stakeholder[];
  locations: Location[];
  businessProcesses: BusinessProcess[];
  dependencies: string;
  roleEfforts: Partial<Record<RoleProfile, number>>;
  neededRoles: RoleProfile[]; // Tracks which roles are required even if effort is unknown
  metrics: RICEMetrics;
  score: number;
  createdAt: number;
  // Phase-aware scheduling
  analysisQuarter: number; // 1, 2, 3, 4
  devQuarter: number;      // 1, 2, 3, 4
  priorityTier: number;   
  messages: ChatMessage[];
}

export interface OrgTeam {
  id: string;
  name: string;
}

export interface OrgProject {
  id: string;
  name: string;
  description: string;
  assignedTeamIds: string[];
  hasDataPlatformDependency: boolean;
}

export interface SynergyGroup {
  clusterTitle: string;
  requestIds: string[];
  reasoning: string;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  risks: string[];
  synergies: SynergyGroup[];
}
