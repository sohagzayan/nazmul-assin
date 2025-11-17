'use client';

import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Priority, TaskStatus } from '../../types';
import { X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CreateTaskModalProps {
  onClose: () => void;
}

export default function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const { createTask, projects, teams, tasks } = useApp();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMember, setWarningMember] = useState<{ id: string; name: string; current: number; capacity: number } | null>(null);
  const [autoAssign, setAutoAssign] = useState(false);

  const selectedProject = projects.find(p => p.id === projectId);
  const selectedTeam = selectedProject ? teams.find(t => t.id === selectedProject.teamId) : null;

  const availableMembers = useMemo(() => {
    if (!selectedTeam) return [];
    return selectedTeam.members.map(member => {
      const teamProjects = projects.filter(p => p.teamId === selectedTeam.id);
      const teamTasks = tasks.filter(t => teamProjects.some(p => p.id === t.projectId));
      const memberTasks = teamTasks.filter(t => t.assignedMemberId === member.id);
      return {
        ...member,
        currentTasks: memberTasks.length,
      };
    });
  }, [selectedTeam, projects, tasks]);

  const handleMemberChange = (memberId: string) => {
    const member = availableMembers.find(m => m.id === memberId);
    if (member && member.currentTasks >= member.capacity) {
      setWarningMember({
        id: member.id,
        name: member.name,
        current: member.currentTasks,
        capacity: member.capacity,
      });
      setShowWarning(true);
    } else {
      setAssignedMemberId(memberId);
      setShowWarning(false);
    }
  };

  const handleAssignAnyway = () => {
    if (warningMember) {
      setAssignedMemberId(warningMember.id);
      setShowWarning(false);
      setWarningMember(null);
    }
  };

  const handleAutoAssign = () => {
    if (availableMembers.length === 0) return;
    const bestMember = availableMembers
      .filter(m => m.currentTasks < m.capacity)
      .sort((a, b) => a.currentTasks - b.currentTasks)[0];
    
    if (bestMember) {
      setAssignedMemberId(bestMember.id);
      setAutoAssign(true);
    } else {
      const leastLoaded = availableMembers.sort((a, b) => a.currentTasks - b.currentTasks)[0];
      setAssignedMemberId(leastLoaded.id);
      setAutoAssign(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && projectId) {
      createTask({
        title,
        description,
        projectId,
        assignedMemberId,
        priority,
        status,
      });
      showToast('Task created successfully');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
            <p className="text-sm text-gray-500 mt-1">Add task details and assign to a team member</p>
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
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400"
              placeholder="Enter task title"
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
              rows={3}
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400 resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setAssignedMemberId(null);
                setAutoAssign(false);
              }}
              required
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            >
              <option value="" className="text-gray-500">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="text-gray-900">
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTeam && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Assign To
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={(e) => {
                      setAutoAssign(e.target.checked);
                      if (e.target.checked) {
                        handleAutoAssign();
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Auto-assign</span>
                </label>
              </div>
              <select
                value={assignedMemberId || ''}
                onChange={(e) => {
                  handleMemberChange(e.target.value);
                  setAutoAssign(false);
                }}
                disabled={!projectId}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="" className="text-gray-500">
                  {projectId ? 'Unassigned' : 'Select project first'}
                </option>
                {availableMembers.map((member) => {
                  const isOverloaded = member.currentTasks >= member.capacity;
                  return (
                    <option key={member.id} value={member.id} className="text-gray-900">
                      {member.name} ({member.currentTasks}/{member.capacity})
                      {isOverloaded ? ' ⚠️' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {showWarning && warningMember && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-3">
                <strong>{warningMember.name}</strong> has {warningMember.current} tasks but capacity is {warningMember.capacity}. Assign anyway?
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAssignAnyway}
                  className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 active:bg-yellow-800 transition-all duration-200"
                >
                  Assign Anyway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWarning(false);
                    setWarningMember(null);
                    setAssignedMemberId(null);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-all duration-200"
                >
                  Choose Another
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              >
                <option value="Low" className="text-gray-900">Low</option>
                <option value="Medium" className="text-gray-900">Medium</option>
                <option value="High" className="text-gray-900">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              >
                <option value="Pending" className="text-gray-900">Pending</option>
                <option value="In Progress" className="text-gray-900">In Progress</option>
                <option value="Done" className="text-gray-900">Done</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-sm w-full"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
