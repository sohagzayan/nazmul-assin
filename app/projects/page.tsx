'use client';

import { useApp } from '../src/context/AppContext';
import LoginForm from '../src/components/auth/LoginForm';
import Navbar from '../src/components/layout/Navbar';
import ProjectList from '../src/components/projects/ProjectList';

export default function ProjectsPage() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <>
      <Navbar />
      <ProjectList />
    </>
  );
}

