'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Users, FolderKanban, CheckSquare, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useGetTasksQuery, useReassignTasksMutation } from '../../../redux/features/taskApi';
import { useGetProjectsQuery } from '../../../redux/features/projectsApi';
import { useGetTeamsQuery } from '../../../redux/features/teamsApi';
import { useGetActivityLogsQuery } from '../../../redux/features/activityLogsApi';
import ConfirmReassignModal from './ConfirmReassignModal';

export default function Dashboard() {
  const { data: tasksData, refetch: refetchTasks } = useGetTasksQuery();
  const { data: projectsData } = useGetProjectsQuery();
  const { data: teamsData } = useGetTeamsQuery();
  const { data: activityLogsData, refetch: refetchActivityLogs } = useGetActivityLogsQuery();
  const [reassignTasks, { isLoading: isReassigning }] = useReassignTasksMutation();
  const { showToast } = useToast();
  const [showReassignModal, setShowReassignModal] = useState(false);

  const tasks = tasksData?.tasks || [];
  const projects = projectsData?.projects || [];
  const teams = teamsData?.teams || [];
  const activityLogs = activityLogsData?.activityLogs || [];

  const getTeamSummary = () => {
    return teams.map(team => {
      const teamProjects = projects.filter(p => p.teamId === team.id);
      const teamTasks = tasks.filter(t => {
        return teamProjects.some(p => p.id === t.projectId);
      });

      return {
        team,
        members: team.members.map(member => {
          const memberTasks = teamTasks.filter(t => t.assignedMemberId === member.id);
          const currentLoad = memberTasks.length;
          const isOverloaded = currentLoad > member.capacity;

          return {
            ...member,
            currentTasks: currentLoad,
            isOverloaded,
          };
        }),
      };
    });
  };

  const recentReassignments = activityLogs
    .filter(log => log.type === 'reassignment')
    .slice(0, 5);

  const teamSummary = getTeamSummary();
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const totalTeams = teams.length;
  
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
  const overloadedMembers = teamSummary.reduce((sum, { members }) => 
    sum + members.filter(m => m.isOverloaded).length, 0
  );

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  const statCards = [
    {
      title: 'Total Teams',
      value: totalTeams,
      subtitle: `${totalMembers} members`,
      color: 'border-l-4 border-l-blue-500',
      icon: Users,
    },
    {
      title: 'Total Projects',
      value: totalProjects,
      subtitle: 'Active projects',
      color: 'border-l-4 border-l-cyan-500',
      icon: FolderKanban,
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      subtitle: (
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-green-600">✓ {completedTasks}</span>
          <span className="text-orange-600">○ {inProgressTasks}</span>
          <span className="text-red-600">! {pendingTasks}</span>
        </div>
      ),
      color: 'border-l-4 border-l-sky-500',
      icon: CheckSquare,
    },
    {
      title: 'Overloaded Members',
      value: overloadedMembers,
      subtitle: 'Need attention',
      color: 'border-l-4 border-l-amber-500',
      icon: AlertTriangle,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your task management system</p>
        </div>
        <button
          onClick={() => setShowReassignModal(true)}
          disabled={isReassigning}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm ${
            isReassigning
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Reassign Tasks</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden ${card.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <div className="text-sm text-gray-500">{card.subtitle}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-slate-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Team Summary</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Member workload and capacity overview</p>
          
          <div className="space-y-4">
            {teamSummary.length === 0 && (
              <p className="text-sm text-gray-500">No teams created yet</p>
            )}
            {teamSummary.map(({ team, members }) => (
              <div key={team.id} className="border rounded-lg border-gray-100 p-4">
                <h3 className="font-medium text-gray-900 mb-3">{team.name}</h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          member.isOverloaded 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.currentTasks}/{member.capacity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-slate-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Latest task reassignments</p>
          
          {recentReassignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentReassignments.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {showReassignModal && (
        <ConfirmReassignModal
          isOpen={showReassignModal}
          onConfirm={async () => {
            try {
              const result = await reassignTasks().unwrap();
              if (result.success) {
                const count = result.count || 0;
                if (count > 0) {
                  showToast(`${count} task(s) reassigned successfully`, 'success');
                } else {
                  showToast('No tasks needed reassignment', 'info');
                }
                // Refetch tasks and activity logs to update the UI
                await refetchTasks();
                await refetchActivityLogs();
                setShowReassignModal(false);
              } else if (result.error) {
                showToast(result.error, 'error');
              }
            } catch (error: any) {
              console.error('Error reassigning tasks:', error);
              showToast(
                error?.data?.error || 'Failed to reassign tasks. Please try again.',
                'error'
              );
            }
          }}
          onCancel={() => setShowReassignModal(false)}
          isLoading={isReassigning}
        />
      )}
    </motion.div>
  );
}
