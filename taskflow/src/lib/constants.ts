// ============================================
// TaskFlow — Design Token Constants
// ============================================

export const colors = {
  primary: '#2563EB',
  secondary: '#3B82F6',
  accent: '#60A5FA',
  background: '#050816',
  card: '#0F172A',
  cardHover: '#1E293B',
  surface: '#0B1120',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.15)',
  text: '#FFFFFF',
  muted: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#60A5FA',
} as const;

export const priorityColors = {
  LOW: { bg: 'rgba(96,165,250,0.1)', text: '#60A5FA', border: 'rgba(96,165,250,0.2)' },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
  HIGH: { bg: 'rgba(249,115,22,0.1)', text: '#F97316', border: 'rgba(249,115,22,0.2)' },
  CRITICAL: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' },
} as const;

export const statusColors = {
  BACKLOG: { bg: 'rgba(148,163,184,0.1)', text: '#94A3B8', label: 'Backlog' },
  TODO: { bg: 'rgba(96,165,250,0.1)', text: '#60A5FA', label: 'To Do' },
  IN_PROGRESS: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', label: 'In Progress' },
  IN_REVIEW: { bg: 'rgba(167,139,250,0.1)', text: '#A78BFA', label: 'In Review' },
  TESTING: { bg: 'rgba(249,115,22,0.1)', text: '#F97316', label: 'Testing' },
  COMPLETED: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E', label: 'Completed' },
} as const;

export const chartColors = [
  '#2563EB', '#3B82F6', '#60A5FA', '#22C55E', '#F59E0B',
  '#A78BFA', '#F97316', '#EC4899', '#14B8A6', '#8B5CF6',
];
