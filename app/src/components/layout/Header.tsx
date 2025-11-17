'use client';

import { useApp } from '../../context/AppContext';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { currentUser, logout } = useApp();

  if (!currentUser) return null;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between sticky top-0 z-40 pl-16 pr-4 md:pl-6 md:pr-6">
      <span className="text-sm text-gray-600">
        Welcome back,{' '}
        <span className="font-medium text-gray-900">{currentUser.email || currentUser.username}</span>
      </span>
      <button
        onClick={logout}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
      >
        <span>Logout</span>
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}

