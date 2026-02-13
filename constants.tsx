
import { Stakeholder, BusinessProcess, Location, RoleProfile, OrgTeam, OrgProject } from './types';

export const DEFAULT_STAKEHOLDERS: Stakeholder[] = [
  'Warehouse', 'Global Planning', 'Service Center', 'Business Control', 'HR', 'IT Ops', 'Product'
];

export const DEFAULT_LOCATIONS: Location[] = [
  'Ghent', 'Lyon', 'Byhalia', 'RDS NA', 'Curitiba', 'SDC Europe', 'RDC APAC', 'AfterMarket Technology', 'Global'
];

export const DEFAULT_TEAMS: OrgTeam[] = [
  { id: 't1', name: 'Digital Sales' },
  { id: 't2', name: 'Supply Chain Ops' },
  { id: 't3', name: 'Customer Experience' },
  { id: 't4', name: 'Finance & Control' },
  { id: 't5', name: 'Infrastructure' }
];

export const DEFAULT_ORG_PROJECTS: OrgProject[] = [
  { 
    id: 'p1', 
    name: 'Omnichannel Expansion', 
    description: 'Scaling digital sales across 15 new regions.', 
    assignedTeamIds: ['t1', 't3'], 
    hasDataPlatformDependency: true 
  },
  { 
    id: 'p2', 
    name: 'Smart Warehouse 2.0', 
    description: 'IOT implementation for automated picking.', 
    assignedTeamIds: ['t2', 't5'], 
    hasDataPlatformDependency: true 
  }
];

export const BUSINESS_PROCESSES: BusinessProcess[] = [
  'Inbound', 'Delivery Schedule', 'Stock', 'Planning', 'Outbound Delivery', 'Transport', 'General'
];

export const BUSINESS_PROFILES: RoleProfile[] = ['Subject Matter Expert', 'Business Analyst', 'Tester'];
export const IT_PROFILES: RoleProfile[] = ['DPO', 'Domain Architect', 'Tech Lead', 'Data Engineer', 'Data Analyst'];
export const ALL_PROFILES = [...BUSINESS_PROFILES, ...IT_PROFILES];

export const IMPACT_LEVELS = [
  { label: 'Massive (3x)', value: 3 },
  { label: 'High (2x)', value: 2 },
  { label: 'Medium (1x)', value: 1 },
  { label: 'Low (0.5x)', value: 0.5 },
  { label: 'Minimal (0.25x)', value: 0.25 },
];

export const CONFIDENCE_LEVELS = [
  { label: 'High (100%)', value: 1 },
  { label: 'Medium (80%)', value: 0.8 },
  { label: 'Low (50%)', value: 0.5 },
];

export const calculateRICEScore = (metrics: { reach: number; impact: number; confidence: number; effort: number }) => {
  if (metrics.effort <= 0) return 0;
  return (metrics.reach * metrics.impact * metrics.confidence) / metrics.effort;
};

export const STAKEHOLDER_COLORS: Record<string, string> = {
  'Warehouse': 'bg-blue-100 text-blue-800 border-blue-200',
  'Global Planning': 'bg-purple-100 text-purple-800 border-purple-200',
  'Service Center': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Business Control': 'bg-orange-100 text-orange-800 border-orange-200',
  'HR': 'bg-pink-100 text-pink-800 border-pink-200',
  'IT Ops': 'bg-slate-100 text-slate-800 border-slate-200',
  'Product': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export const getStakeholderColor = (s: string) => STAKEHOLDER_COLORS[s] || 'bg-slate-100 text-slate-600 border-slate-200';
