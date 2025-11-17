'use client';

import { useApp } from '../src/context/AppContext';
import LoginForm from '../src/components/auth/LoginForm';
import Navbar from '../src/components/layout/Navbar';
import TeamList from '../src/components/teams/TeamList';

export default function TeamsPage() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <>
      <Navbar />
      <TeamList />
    </>
  );
}

