'use client';

import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

export default function Dashboard() {
  const { projects, tasks, teams, activityLogs, reassignTasks } = useApp();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your projects, tasks, and teams</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Team Summary</h2>
          <button
            onClick={reassignTasks}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Reassign Tasks
          </button>
        </div>

        <div className="space-y-6">
          {teamSummary.map(({ team, members }) => (
            <div key={team.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{team.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg border ${
                      member.isOverloaded
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      {member.isOverloaded && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Overloaded
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Tasks: <span className={`font-medium ${member.isOverloaded ? 'text-red-600' : 'text-gray-900'}`}>
                          {member.currentTasks} / {member.capacity}
                        </span>
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          member.isOverloaded
                            ? 'bg-red-500'
                            : member.currentTasks / member.capacity > 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((member.currentTasks / member.capacity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reassignments</h2>
        {recentReassignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent reassignments</p>
        ) : (
          <div className="space-y-3">
            {recentReassignments.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

