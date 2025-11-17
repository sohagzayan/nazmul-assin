'use client';

import { useApp } from '../src/context/AppContext';
import LoginForm from '../src/components/auth/LoginForm';
import Navbar from '../src/components/layout/Navbar';
import TaskList from '../src/components/tasks/TaskList';

export default function TasksPage() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <>
      <Navbar />
      <TaskList />
    </>
  );
}

