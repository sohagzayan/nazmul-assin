'use client';

import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { Task, Priority, TaskStatus } from '../../types';
import { CheckSquare, Filter, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

export default function TaskList() {
  const { tasks, projects, teams, deleteTask } = useApp();
  const { showToast } = useToast();
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
        return 'bg-orange-100 text-orange-700';
      case 'Pending':
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage and track all your tasks</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
        >
          <span>+</span>
          <span>Create Task</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          >
            <option value="" className="text-gray-500">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id} className="text-gray-900">
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
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

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <CheckSquare 
                    className={`w-5 h-5 ${
                      task.status === 'Done' ? 'text-green-600' : 'text-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                      {task.status.toLowerCase()}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {getProjectName(task.projectId)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {getMemberName(task.assignedMemberId)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      deleteTask(task.id);
                      showToast('Task deleted', 'info');
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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
    </motion.div>
  );
}
