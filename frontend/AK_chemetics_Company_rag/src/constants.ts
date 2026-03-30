import { Project, Skill, TeamMember, Activity } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'AE-2024-081',
    name: 'Brine System Expansion',
    status: 'In Progress',
    progress: 75,
    icon: 'Droplets',
  },
  {
    id: 'AE-2024-114',
    name: 'AVC Vent Upgrades',
    status: 'Awaiting Review',
    progress: 92,
    icon: 'Wind',
  },
  {
    id: 'AE-2024-009',
    name: 'Turbine Grid Integration',
    status: 'Gap Detected',
    progress: 45,
    icon: 'Zap',
  },
];

export const SKILLS: Skill[] = [
  {
    id: '1',
    name: 'Corrosion Allowance',
    description: 'Automated calculation of wall thickness reduction over 25-year lifespan based on API 570 standards.',
    status: 'HIT',
    file: 'corrosion_allowance.py',
    updated: 'OCT 12, 2023',
    icon: 'Waves',
  },
  {
    id: '2',
    name: 'Fluid Scope',
    description: 'Dynamic scoping of Newtonian and Non-Newtonian fluid behaviors in high-pressure vessels.',
    status: 'HIT',
    file: 'fluid_scope.py',
    updated: 'NOV 02, 2023',
    icon: 'Droplet',
  },
  {
    id: '3',
    name: 'Pressure Test',
    description: 'Hydrostatic and pneumatic testing procedures validation against ASME Section VIII.',
    status: 'PARTIAL',
    file: 'pressure_test.py',
    updated: 'DEC 14, 2023',
    icon: 'Gauge',
  },
];

export const TEAM: TeamMember[] = [
  {
    name: 'Erik Hoffmann',
    role: 'Lead Compliance Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    lastAction: 'Approved Brine System schematic',
    actionIcon: 'History',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    lastAction: 'Modified AVC Vent flow logs',
    actionIcon: 'Edit',
  },
  {
    name: 'Marcus Thorne',
    role: 'Safety Inspector',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    lastAction: 'Flagged turbine sync error',
    actionIcon: 'AlertTriangle',
  },
];

export const ACTIVITIES: Activity[] = [
  {
    time: '10:42 AM',
    message: 'New audit report generated for',
    project: 'Brine System',
    status: 'success',
  },
  {
    time: '09:15 AM',
    message: 'SARAH J. completed the forensic check on',
    project: 'AVC Vents',
    status: 'success',
  },
  {
    time: 'Yesterday',
    message: 'Structural gap identified in Turbine Grid module.',
    status: 'error',
  },
];
