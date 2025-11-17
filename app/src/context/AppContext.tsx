'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Team, Project, Task, ActivityLog, TeamMember } from '../types';
import { demoUsers, demoTeams, demoProjects, demoTasks, demoActivityLogs } from '../data/demoData';

interface AppContextType {
  currentUser: User | null;
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string) => boolean;
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
  const [teams, setTeams] = useState<Team[]>(demoTeams);
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(demoActivityLogs);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = demoUsers.find(u => u.id === savedUser);
      if (user) setCurrentUser(user);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = demoUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = (username: string, email: string, password: string): boolean => {
    if (demoUsers.some(u => u.username === username || u.email === email)) {
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
    };
    demoUsers.push(newUser);
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', newUser.id);
    return true;
  };

  const createTeam = (name: string, members: Omit<TeamMember, 'id'>[]) => {
    if (!currentUser) return;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      createdBy: currentUser.id,
      members: members.map((m, idx) => ({ ...m, id: `member-${Date.now()}-${idx}` })),
    };
    setTeams([...teams, newTeam]);
  };

  const createProject = (name: string, description: string, teamId: string) => {
    if (!currentUser) return;
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      teamId,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTasks([...tasks, newTask]);
    addActivityLog(`Task "${newTask.title}" created`, 'task_created');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
    const task = tasks.find(t => t.id === id);
    if (task) {
      addActivityLog(`Task "${task.title}" updated`, 'task_updated');
    }
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter(t => t.id !== id));
    if (task) {
      addActivityLog(`Task "${task.title}" deleted`, 'task_deleted');
    }
  };

  const addActivityLog = (message: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message,
      type,
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  const reassignTasks = () => {
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

    setTasks(updatedTasks);

    reassignments.forEach(({ task, from, to }) => {
      addActivityLog(`Task "${task.title}" reassigned from ${from} to ${to}`, 'reassignment');
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
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

