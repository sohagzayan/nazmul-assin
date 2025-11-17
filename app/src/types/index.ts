export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  capacity: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamId: string;
  createdBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedMemberId: string | null;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'reassignment' | 'task_created' | 'task_updated' | 'task_deleted';
}

