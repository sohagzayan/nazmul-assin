'use client';

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CreateProjectModal from './CreateProjectModal';

export default function ProjectList() {
  const { projects, teams } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Manage your projects and link them to teams</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Create Project
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h2>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getTeamName(project.teamId)}
              </span>
            </div>
          </div>
        ))}
      </div>

        {isModalOpen && (
          <CreateProjectModal
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

