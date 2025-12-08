"use client";

import { useState } from 'react';
import LoginForm from '@/components/admin/LoginForm';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Header from '@/components/layout/Header';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <div className="w-full max-w-4xl mx-auto">
          {!isAuthenticated ? (
            <div className="flex justify-center">
              <LoginForm onLogin={handleLogin} />
            </div>
          ) : (
            <AdminDashboard />
          )}
        </div>
      </main>
    </div>
  );
}
