"use client";

import LoginForm from "./src/components/auth/LoginForm";
import Dashboard from "./src/components/dashboard/Dashboard";
import Navbar from "./src/components/layout/Navbar";
import { useApp } from "./src/context/AppContext";

export default function Home() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  );
}
