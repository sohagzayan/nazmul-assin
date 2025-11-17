'use client';

import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSessionLoading, hasCheckedSession } = useApp();

  // Since middleware ensures authentication, we should always show the layout
  // But show loading state while session is being checked
  if (isSessionLoading || !hasCheckedSession) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between sticky top-0 z-40 pl-16 pr-4 md:pl-6 md:pr-6">
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
          <main className="p-6">
            <div className="text-gray-600">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  // Always show layout structure - middleware ensures user is authenticated
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
