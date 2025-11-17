'use client';

import { useApp } from '../src/context/AppContext';
import LoginForm from '../src/components/auth/LoginForm';
import AppLayout from '../src/components/layout/AppLayout';
import TaskList from '../src/components/tasks/TaskList';

export default function TasksPage() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <TaskList />
    </AppLayout>
  );
}
