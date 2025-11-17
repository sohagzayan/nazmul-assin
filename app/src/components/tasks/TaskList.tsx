'use client';

import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { Task, Priority, TaskStatus } from '../../types';

export default function TaskList() {
  const { tasks, projects, teams, deleteTask } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterMember, setFilterMember] = useState<string>('');

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'Unassigned';
    for (const team of teams) {
      const member = team.members.find(m => m.id === memberId);
      if (member) return member.name;
    }
    return 'Unknown Member';
  };

  const getAllMembers = () => {
    const allMembers: Array<{ id: string; name: string; teamName: string }> = [];
    teams.forEach(team => {
      team.members.forEach(member => {
        allMembers.push({ id: member.id, name: member.name, teamName: team.name });
      });
    });
    return allMembers;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterProject && task.projectId !== filterProject) return false;
      if (filterMember) {
        if (filterMember === 'unassigned') {
          if (task.assignedMemberId !== null) return false;
        } else {
          if (task.assignedMemberId !== filterMember) return false;
        }
      }
      return true;
    });
  }, [tasks, filterProject, filterMember]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage and track your tasks</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Create Task
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Project
              </label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
              >
                <option value="" className="text-gray-500">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id} className="text-gray-900">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Member
              </label>
              <select
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
              >
                <option value="" className="text-gray-500">All Members</option>
                <option value="unassigned" className="text-gray-900">Unassigned</option>
                {getAllMembers().map((member) => (
                  <option key={member.id} value={member.id} className="text-gray-900">
                    {member.name} ({member.teamName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Project: <span className="font-medium">{getProjectName(task.projectId)}</span></span>
                      <span>Assigned to: <span className="font-medium">{getMemberName(task.assignedMemberId)}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isCreateModalOpen && (
          <CreateTaskModal
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}

        {editingTask && (
          <EditTaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </div>
  );
}

