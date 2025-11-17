"use client";

import Dashboard from "../src/components/dashboard/Dashboard";
import AppLayout from "../src/components/layout/AppLayout";

export default function DashboardPage() {
  // Middleware handles authentication server-side, so if we reach here, user is authenticated
  // Just show the dashboard
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

