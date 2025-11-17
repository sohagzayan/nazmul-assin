'use client';

import AppLayout from '../src/components/layout/AppLayout';
import TeamList from '../src/components/teams/TeamList';

export default function TeamsPage() {
  // Middleware handles authentication server-side, so if we reach here, user is authenticated
  return (
    <AppLayout>
      <TeamList />
    </AppLayout>
  );
}
