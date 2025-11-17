'use client';

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CreateTeamModal from './CreateTeamModal';
import { TeamMember } from '../../types';

export default function TeamList() {
  const { teams } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
            <p className="text-gray-600">Manage your teams and members</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Create Team
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{team.name}</h2>
            <div className="space-y-3">
              {team.members.map((member) => (
                <div key={member.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                  <p className="text-xs text-gray-500">Capacity: {member.capacity} tasks</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

        {isModalOpen && (
          <CreateTeamModal
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

