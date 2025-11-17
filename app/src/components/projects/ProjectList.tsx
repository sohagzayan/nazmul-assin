'use client';

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CreateProjectModal from './CreateProjectModal';
import { FolderKanban, Users, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectList() {
  const { projects, teams, tasks } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  };

  const getCompletedTasks = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId && t.status === 'Done').length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage your projects and deliverables</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
        >
          <span>+</span>
          <span>Create Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = getProjectTasks(project.id);
          const completedTasks = getCompletedTasks(project.id);
          const totalTasks = projectTasks.length;
          
          return (
            <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FolderKanban className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
                </div>
                <button className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Users className="w-4 h-4" />
                <span>{getTeamName(project.teamId)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{completedTasks}/{totalTasks}</span>
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
