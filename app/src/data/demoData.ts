import { User, Team, Project, Task, ActivityLog } from '../types';

const demoAdminUser: User = {
  id: 'user-1',
  username: process.env.NEXT_PUBLIC_DEMO_ADMIN_USERNAME ?? 'admin',
  email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? 'admin@taskmanager.com',
  password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? 'admin123',
};

const demoStandardUser: User = {
  id: 'user-2',
  username: process.env.NEXT_PUBLIC_DEMO_USER_USERNAME ?? 'john',
  email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? 'john@taskmanager.com',
  password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD ?? 'john123',
};

export const demoUsers: User[] = [demoAdminUser, demoStandardUser];

export const demoTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Development Team',
    createdBy: 'user-1',
    members: [
      { id: 'member-1', name: 'Riya', role: 'Frontend Developer', capacity: 3 },
      { id: 'member-2', name: 'Farhan', role: 'Backend Developer', capacity: 4 },
      { id: 'member-3', name: 'Sarah', role: 'Full Stack Developer', capacity: 5 },
      { id: 'member-4', name: 'Alex', role: 'UI/UX Designer', capacity: 2 },
    ],
  },
  {
    id: 'team-2',
    name: 'Marketing Team',
    createdBy: 'user-1',
    members: [
      { id: 'member-5', name: 'Emma', role: 'Content Writer', capacity: 4 },
      { id: 'member-6', name: 'Mike', role: 'SEO Specialist', capacity: 3 },
    ],
  },
];

export const demoProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    teamId: 'team-1',
    createdBy: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Build new mobile application',
    teamId: 'team-1',
    createdBy: 'user-1',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'project-3',
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign launch',
    teamId: 'team-2',
    createdBy: 'user-1',
    createdAt: '2024-01-25T10:00:00Z',
  },
];

export const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'UI Design',
    description: 'Create new UI mockups for homepage',
    projectId: 'project-1',
    assignedMemberId: 'member-1',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'task-2',
    title: 'API Integration',
    description: 'Integrate backend APIs with frontend',
    projectId: 'project-1',
    assignedMemberId: 'member-2',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Database Setup',
    description: 'Set up database schema and migrations',
    projectId: 'project-2',
    assignedMemberId: 'member-2',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: 'task-4',
    title: 'User Authentication',
    description: 'Implement login and registration',
    projectId: 'project-2',
    assignedMemberId: 'member-3',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Responsive Design',
    description: 'Make website responsive for mobile devices',
    projectId: 'project-1',
    assignedMemberId: 'member-1',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Testing',
    description: 'Write unit tests for components',
    projectId: 'project-2',
    assignedMemberId: 'member-3',
    priority: 'Low',
    status: 'Pending',
    createdAt: '2024-01-23T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
  },
  {
    id: 'task-7',
    title: 'Content Writing',
    description: 'Write blog posts for marketing campaign',
    projectId: 'project-3',
    assignedMemberId: 'member-5',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2024-01-26T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
  },
  {
    id: 'task-8',
    title: 'SEO Optimization',
    description: 'Optimize website for search engines',
    projectId: 'project-3',
    assignedMemberId: 'member-6',
    priority: 'Low',
    status: 'Pending',
    createdAt: '2024-01-27T10:00:00Z',
    updatedAt: '2024-01-27T10:00:00Z',
  },
  {
    id: 'task-9',
    title: 'Logo Design',
    description: 'Design new company logo',
    projectId: 'project-1',
    assignedMemberId: 'member-4',
    priority: 'Medium',
    status: 'Done',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
  {
    id: 'task-10',
    title: 'Bug Fixes',
    description: 'Fix reported bugs in production',
    projectId: 'project-2',
    assignedMemberId: 'member-1',
    priority: 'High',
    status: 'Pending',
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
  },
];

export const demoActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-01-28T10:30:00Z',
    message: 'Task "UI Design" reassigned from Riya to Farhan',
    type: 'reassignment',
  },
  {
    id: 'log-2',
    timestamp: '2024-01-28T09:15:00Z',
    message: 'Task "Responsive Design" reassigned from Riya to Sarah',
    type: 'reassignment',
  },
];

