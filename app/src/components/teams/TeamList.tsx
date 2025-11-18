'use client';

import { useState } from 'react';
import CreateTeamModal from './CreateTeamModal';
import { Trash2, Users, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetTeamsQuery } from '../../../redux/features/teamsApi';

export default function TeamList() {
  const { data, isLoading, error, refetch } = useGetTeamsQuery();
  const teams = data?.teams || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Show empty state if no teams (even if there was an error, we'll show empty state)
  const showEmptyState = !isLoading && teams.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
          <p className="text-gray-600">Manage your teams and members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
        >
          <span>+</span>
          <span>Create Team</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500">Loading teams...</div>
        </div>
      ) : showEmptyState ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Teams Created Yet</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Get started by creating your first team. Add team members, assign roles, and set their capacity to manage workloads effectively.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Your First Team</span>
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 p-6 relative shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">{team.name}</h2>
                </div>
                <button className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{team.members.length} members</p>
              <div className="space-y-2">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold">
                      0/{member.capacity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateTeamModal
          onClose={() => {
            setIsModalOpen(false);
            // Refetch teams after modal closes (in case a team was created)
            refetch();
          }}
        />
      )}
    </motion.div>
  );
}
