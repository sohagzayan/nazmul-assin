'use client';

import AppLayout from '../src/components/layout/AppLayout';
import ProjectList from '../src/components/projects/ProjectList';

export default function ProjectsPage() {
  // Middleware handles authentication server-side, so if we reach here, user is authenticated
  return (
    <AppLayout>
      <ProjectList />
    </AppLayout>
  );
}
