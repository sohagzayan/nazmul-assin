'use client';

import AppLayout from '../src/components/layout/AppLayout';
import TaskList from '../src/components/tasks/TaskList';

export default function TasksPage() {
  // Middleware handles authentication server-side, so if we reach here, user is authenticated
  return (
    <AppLayout>
      <TaskList />
    </AppLayout>
  );
}
