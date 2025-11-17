"use client";

import LoginForm from "./src/components/auth/LoginForm";

export default function Home() {
  // Middleware handles redirects server-side, so if we reach here, user is not authenticated
  // Just show the login form
  return <LoginForm />;
}
