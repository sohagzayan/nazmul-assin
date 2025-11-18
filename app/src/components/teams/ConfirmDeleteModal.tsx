'use client';

import { X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  teamName: string; // Can be used for team, project, or task name
  itemType?: string; // 'team', 'project', or 'task', defaults to 'team'
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  teamName,
  itemType = 'team',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                Delete {itemType === 'project' ? 'Project' : itemType === 'task' ? 'Task' : 'Team'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{teamName}"</span>? 
            {itemType === 'project' 
              ? ' This will permanently delete the project and all its data.'
              : itemType === 'task'
              ? ' This will permanently delete the task and all its data.'
              : ' This will permanently delete the team and all its members.'}
          </p>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-red-300 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Deleting...' : `Delete ${itemType === 'project' ? 'Project' : itemType === 'task' ? 'Task' : 'Team'}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

