// ============================================
// TaskFlow — Enterprise Task Management Platform
// Complete TypeScript Type Definitions
// ============================================

// ─── Enums ────────────────────────────────────
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum Plan {
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  NEW_COMMENT = 'NEW_COMMENT',
  TEAM_INVITE = 'TEAM_INVITE',
  MENTION = 'MENTION',
}

// ─── Core Entities ────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: Plan;
  customBranding?: Record<string, unknown>;
  memberCount?: number;
  projectCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  icon?: string;
  color?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  endDate?: string;
  workspaceId: string;
  leadId?: string;
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
  members?: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: Role;
  user: User;
}

export interface Task {
  id: string;
  number: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  storyPoints?: number;
  estimatedHours?: number;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  position: number;
  projectId: string;
  parentId?: string;
  sprintId?: string;
  createdById: string;
  project?: Project;
  assignees?: TaskAssignee[];
  labels?: Label[];
  comments?: Comment[];
  attachments?: Attachment[];
  children?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  userId: string;
  taskId: string;
  user: User;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  projectId: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  memberCount: number;
  members?: TeamMember[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  user: User;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  parentId?: string;
  user: User;
  replies?: Comment[];
  reactions?: Reaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  commentId: string;
  user: User;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  taskId: string;
  uploadedById: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Activity {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  user: User;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  description?: string;
  hours: number;
  date: string;
  taskId: string;
  userId: string;
  user: User;
  task?: Task;
}

// ─── Subscription & Billing ──────────────────
export interface Subscription {
  id: string;
  workspaceId: string;
  stripeCustomerId?: string;
  stripeSubId?: string;
  plan: Plan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodEnd?: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string;
  createdAt: string;
}

// ─── Audit ────────────────────────────────────
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  workspaceId: string;
  createdAt: string;
}

// ─── API Response Types ───────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ─── Auth Types ───────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  workspace?: Workspace;
}

// ─── Dashboard Types ──────────────────────────
export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  teamMembers: number;
  productivityScore: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ─── Kanban Types ─────────────────────────────
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

export interface KanbanDragResult {
  taskId: string;
  sourceColumn: TaskStatus;
  destinationColumn: TaskStatus;
  sourceIndex: number;
  destinationIndex: number;
}

// ─── Filter & Search Types ────────────────────
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assigneeIds?: string[];
  labelIds?: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchResult {
  type: 'task' | 'project' | 'user' | 'file' | 'comment';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

// ─── Navigation Types ─────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}
