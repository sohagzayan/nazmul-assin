'use client';

import { useState } from 'react';
import CreateProjectModal from './CreateProjectModal';
import ConfirmDeleteModal from '../teams/ConfirmDeleteModal';
import { FolderKanban, Users, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetProjectsQuery, useDeleteProjectMutation } from '../../../redux/features/projectsApi';
import { useGetTeamsQuery } from '../../../redux/features/teamsApi';
import { useGetTasksQuery } from '../../../redux/features/taskApi';
import { useToast } from '../../context/ToastContext';

export default function ProjectList() {
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch } = useGetProjectsQuery();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const { showToast } = useToast();
  const { data: teamsData } = useGetTeamsQuery();
  const { data: tasksData } = useGetTasksQuery();
  
  const projects = projectsData?.projects || [];
  const teams = teamsData?.teams || [];
  const tasks = tasksData?.tasks || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Show empty state if no projects
  const showEmptyState = !projectsLoading && projects.length === 0;

  const handleDeleteClick = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const result = await deleteProject(projectToDelete.id).unwrap();

      if (result.success) {
        showToast('Project deleted successfully', 'success');
        setProjectToDelete(null);
        // Refetch will happen automatically via cache invalidation
      } else if (result.error) {
        showToast(result.error, 'error');
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      showToast(
        error?.data?.error || 'Failed to delete project. Please try again.',
        'error'
      );
    }
  };

  const handleCancelDelete = () => {
    setProjectToDelete(null);
  };

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
          {teams.length === 0 && (
            <p className="text-sm text-amber-600 mt-2 flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Create a team first to assign projects</span>
            </p>
          )}
        </div>
        <button
          onClick={() => {
            if (teams.length > 0) {
              setIsModalOpen(true);
            }
          }}
          disabled={teams.length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
            teams.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title={teams.length === 0 ? 'Create a team first to create projects' : ''}
        >
          <span>+</span>
          <span>Create Project</span>
        </button>
      </div>

      {projectsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500">Loading projects...</div>
        </div>
      ) : projectsError ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-red-500">Failed to load projects. Please try again.</div>
        </div>
      ) : showEmptyState ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FolderKanban className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Projects Yet</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            {teams.length === 0
              ? 'You need to create a team first before you can create projects. Teams are required to assign projects.'
              : 'Get started by creating your first project. Organize your work, assign teams, and track progress all in one place.'}
          </p>
          <button
            onClick={() => {
              if (teams.length > 0) {
                setIsModalOpen(true);
              }
            }}
            disabled={teams.length === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm ${
              teams.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={teams.length === 0 ? 'Create a team first to create projects' : ''}
          >
            <span className="text-xl">+</span>
            <span>{teams.length === 0 ? 'Create a Team First' : 'Create Your First Project'}</span>
          </button>
        </motion.div>
      ) : (
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
                  <button 
                    onClick={() => handleDeleteClick(project.id, project.name)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete project"
                  >
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
      )}

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => {
            setIsModalOpen(false);
            // Refetch projects after modal closes (in case a project was created)
            refetch();
          }}
        />
      )}

      {projectToDelete && (
        <ConfirmDeleteModal
          isOpen={!!projectToDelete}
          teamName={projectToDelete.name}
          itemType="project"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isDeleting}
        />
      )}
    </motion.div>
  );
}
