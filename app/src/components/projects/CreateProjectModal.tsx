'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCreateProjectMutation, useGetProjectsQuery } from '../../../redux/features/projectsApi';
import { useGetTeamsQuery } from '../../../redux/features/teamsApi';

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const { refetch } = useGetProjectsQuery();
  const { data: teamsData } = useGetTeamsQuery();
  const teams = teamsData?.teams || [];
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && teamId) {
      try {
        const result = await createProject({
          name,
          description,
          teamId,
        }).unwrap();

        if (result.project) {
          showToast('Project created successfully', 'success');
          // Reset form
          setName('');
          setDescription('');
          setTeamId('');
          // Refetch projects to update the list
          await refetch();
          // Close modal after a brief delay to show the toast
          setTimeout(() => {
            onClose();
          }, 300);
        } else if (result.error) {
          showToast(result.error, 'error');
        }
      } catch (error: any) {
        console.error('Error creating project:', error);
        showToast(
          error?.data?.error || 'Failed to create project. Please try again.',
          'error'
        );
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-sm text-gray-500 mt-1">Add project details and assign a team</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400 resize-none"
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Team <span className="text-red-500">*</span>
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            >
              <option value="" className="text-gray-500">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} className="text-gray-900">
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm w-full ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
