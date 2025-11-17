'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, Team, Project, Task, ActivityLog, TeamMember } from '../types';
import { demoTeams, demoProjects, demoTasks, demoActivityLogs } from '../data/demoData';
import {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetSessionQuery,
} from '../../redux/features/authApi';
import {
  useGetTeamsQuery,
  useCreateTeamMutation,
} from '../../redux/features/teamsApi';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
} from '../../redux/features/projectsApi';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../../redux/features/taskApi';

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

interface AuthResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

interface AppContextType {
  currentUser: User | null;
  isSessionLoading: boolean;
  hasCheckedSession: boolean;
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  login: (identifier: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  createTeam: (name: string, members: Omit<TeamMember, 'id'>[]) => void;
  createProject: (name: string, description: string, teamId: string) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reassignTasks: () => void;
  addActivityLog: (message: string, type: ActivityLog['type']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(demoActivityLogs);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // RTK Query hooks - this runs automatically on mount
  // Skip the automatic query, we'll trigger it manually to ensure it runs
  const { data: sessionData, isLoading: isSessionLoading, refetch: refetchSession } = useGetSessionQuery(undefined, {
    // Don't skip - let it run automatically AND we'll also refetch
  });
  const [registerMutation] = useRegisterMutation();
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const { data: teamsData } = useGetTeamsQuery();
  const [createTeamMutation] = useCreateTeamMutation();
  const { data: projectsData } = useGetProjectsQuery();
  const [createProjectMutation] = useCreateProjectMutation();
  const { data: tasksData } = useGetTasksQuery();
  const [createTaskMutation] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  // Derive state from RTK Query data (fallback to demo data if API not available)
  const teams = teamsData?.teams ?? demoTeams;
  const projects = projectsData?.projects ?? demoProjects;
  const tasks = tasksData?.tasks ?? demoTasks;

  // Sync session data to currentUser IMMEDIATELY when it changes
  React.useEffect(() => {
    // This is the PRIMARY way we set currentUser - from RTK Query data
    if (sessionData !== undefined) {
      console.log('[AUTH] Session data received:', sessionData);
      if (sessionData?.authenticated && sessionData.user) {
        console.log('[AUTH] Setting currentUser:', sessionData.user.username);
        setCurrentUser(sessionData.user);
        setHasCheckedSession(true);
      } else {
        console.log('[AUTH] No authenticated user');
        setCurrentUser(null);
        setHasCheckedSession(true);
      }
    }
  }, [sessionData]);

  // Force refetch session on mount - CRITICAL for checking token on page load
  React.useEffect(() => {
    // Always check session on mount - this ensures we get fresh data
    const checkSession = async () => {
      try {
        console.log('[AUTH] Checking session on mount...');
        const result = await refetchSession();
        console.log('[AUTH] Session refetch result:', result);
        
        // RTK Query refetch returns { data, error, ... }
        const sessionResponse = result.data;
        if (sessionResponse) {
          if (sessionResponse?.authenticated && sessionResponse.user) {
            console.log('[AUTH] User authenticated from refetch:', sessionResponse.user.username);
            setCurrentUser(sessionResponse.user);
            setHasCheckedSession(true);
          } else {
            console.log('[AUTH] User not authenticated from refetch');
            setCurrentUser(null);
            setHasCheckedSession(true);
          }
        } else if (result.error) {
          console.error('[AUTH] Session refetch error:', result.error);
          setCurrentUser(null);
          setHasCheckedSession(true);
        } else {
          console.log('[AUTH] No data in refetch result, waiting for sessionData...');
          // Don't set hasCheckedSession yet - wait for sessionData from the query
        }
      } catch (error) {
        console.error('[AUTH] Session check failed:', error);
        setCurrentUser(null);
        setHasCheckedSession(true);
      }
    };
    checkSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (identifier: string, password: string): Promise<AuthResult> => {
    try {
      const result = await loginMutation({ identifier, password }).unwrap();
      if (result.user) {
        // Set user directly from login response
        setCurrentUser(result.user);
        // Force refetch session to ensure cookie is read
        setTimeout(() => {
          refetchSession().catch(console.error);
        }, 100);
        return { success: true };
      }
      return {
        success: false,
        message: result.error ?? 'Unable to sign in.',
        fieldErrors: result.errors,
      };
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; errors?: Record<string, string> } };
      return {
        success: false,
        message: err?.data?.error ?? 'Unable to sign in.',
        fieldErrors: err?.data?.errors,
      };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      setCurrentUser(null);
      // Immediately redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed', error);
      setCurrentUser(null);
      // Redirect even if logout API call fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const result = await registerMutation({ username, email, password }).unwrap();
      return { success: true, message: result.message };
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; errors?: Record<string, string> } };
      return {
        success: false,
        message: err?.data?.error ?? 'Unable to create account.',
        fieldErrors: err?.data?.errors,
      };
    }
  };

  const createTeam = async (name: string, members: Omit<TeamMember, 'id'>[]) => {
    if (!currentUser) return;
    try {
      await createTeamMutation({ name, members }).unwrap();
      // Teams will be refetched via RTK Query
    } catch (error) {
      console.error('Failed to create team', error);
    }
  };

  const createProject = async (name: string, description: string, teamId: string) => {
    if (!currentUser) return;
    try {
      await createProjectMutation({ name, description, teamId }).unwrap();
      // Projects will be refetched via RTK Query
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await createTaskMutation(taskData).unwrap();
      if (result.task) {
        addActivityLog(`Task "${result.task.title}" created`, 'task_created');
      }
      // Tasks will be refetched via RTK Query
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const result = await updateTaskMutation({ id, updates }).unwrap();
      if (result.task) {
        addActivityLog(`Task "${result.task.title}" updated`, 'task_updated');
      }
      // Tasks will be refetched via RTK Query
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskMutation(id).unwrap();
      const task = tasks.find(t => t.id === id);
      if (task) {
        addActivityLog(`Task "${task.title}" deleted`, 'task_deleted');
      }
      // Tasks will be refetched via RTK Query
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const addActivityLog = (message: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      message,
      type,
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  const reassignTasks = async () => {
    const reassignments: Array<{ task: Task; from: string; to: string }> = [];
    const updatedTasks = [...tasks];
    const now = new Date().toISOString();

    teams.forEach(team => {
      const teamTasks = updatedTasks.filter(t => {
        const project = projects.find(p => p.id === t.projectId);
        return project?.teamId === team.id;
      });

      team.members.forEach(member => {
        const memberTasks = teamTasks.filter(t => t.assignedMemberId === member.id);
        const currentLoad = memberTasks.length;

        if (currentLoad > member.capacity) {
          const overloadedTasks = memberTasks
            .filter(t => t.priority !== 'High')
            .sort((a, b) => {
              const priorityOrder = { Low: 0, Medium: 1, High: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

          const tasksToMove = overloadedTasks.slice(0, currentLoad - member.capacity);

          tasksToMove.forEach(task => {
            const availableMembers = team.members
              .filter(m => {
                const mTasks = teamTasks.filter(t => t.assignedMemberId === m.id);
                return mTasks.length < m.capacity;
              })
              .sort((a, b) => {
                const aTasks = teamTasks.filter(t => t.assignedMemberId === a.id).length;
                const bTasks = teamTasks.filter(t => t.assignedMemberId === b.id).length;
                return aTasks - bTasks;
              });

            if (availableMembers.length > 0) {
              const newAssignee = availableMembers[0];
              const fromMember = team.members.find(m => m.id === task.assignedMemberId);
              
              if (fromMember && newAssignee.id !== task.assignedMemberId) {
                const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                  updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    assignedMemberId: newAssignee.id,
                    updatedAt: now,
                  };
                  
                  reassignments.push({
                    task: updatedTasks[taskIndex],
                    from: fromMember.name,
                    to: newAssignee.name,
                  });
                }
              }
            }
          });
        }
      });
    });

    // Update tasks via API
    for (const { task, from, to } of reassignments) {
      try {
        // Find the updated task with new assignee
        const updatedTask = updatedTasks.find(t => t.id === task.id);
        if (updatedTask) {
          await updateTaskMutation({
            id: task.id,
            updates: { assignedMemberId: updatedTask.assignedMemberId },
          }).unwrap();
          addActivityLog(`Task "${task.title}" reassigned from ${from} to ${to}`, 'reassignment');
        }
      } catch (error) {
        console.error(`Failed to reassign task ${task.id}`, error);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isSessionLoading: isSessionLoading || !hasCheckedSession,
        hasCheckedSession,
        teams,
        projects,
        tasks,
        activityLogs,
        login,
        logout,
        register,
        createTeam,
        createProject,
        createTask,
        updateTask,
        deleteTask,
        reassignTasks,
        addActivityLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
