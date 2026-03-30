export type Page = 'dashboard' | 'query' | 'skills' | 'library';
export type Role = 'pm' | 'process' | 'mechanical';

export interface User {
  id: string;
  name: string;
  role: Role;
  title: string;
  avatar: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'In Progress' | 'Awaiting Review' | 'Gap Detected';
  progress: number;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  status: 'HIT' | 'PARTIAL' | 'GAP';
  file: string;
  updated: string;
  icon: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  lastAction: string;
  actionIcon: string;
}

export interface Activity {
  time: string;
  message: string;
  status: 'success' | 'warning' | 'error';
  project?: string;
}

export interface AgentStatus {
  pm: { project_context: boolean; handoff_brief: boolean };
  process: { process_output: boolean; calc_summary: boolean };
  mechanical: { mechanical_output: boolean; pump_datasheet: boolean };
}
