
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
  { label: 'Massive', value: 3 },
  { label: 'High', value: 2 },
  { label: 'Medium', value: 1 },
  { label: 'Low', value: 0.5 },
  { label: 'Minimal', value: 0.25 },
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
  'Warehouse': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Global Planning': 'bg-violet-50 text-violet-700 border-violet-100',
  'Service Center': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Business Control': 'bg-amber-50 text-amber-700 border-amber-100',
  'HR': 'bg-rose-50 text-rose-700 border-rose-100',
  'IT Ops': 'bg-zinc-100 text-zinc-700 border-zinc-200',
  'Product': 'bg-sky-50 text-sky-700 border-sky-100',
};

export const getStakeholderColor = (s: string) => STAKEHOLDER_COLORS[s] || 'bg-zinc-100 text-zinc-600 border-zinc-200';
