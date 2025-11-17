"use client";

import LoginForm from "./src/components/auth/LoginForm";
import Dashboard from "./src/components/dashboard/Dashboard";
import AppLayout from "./src/components/layout/AppLayout";
import { useApp } from "./src/context/AppContext";

export default function Home() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
