"use client";

import AdminDashboard from '@/components/admin/AdminDashboard';
import Header from '@/components/layout/Header';

export default function AdminPage() {

  return (
    <div className="min-h-screen text-white">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <AdminDashboard />
        </div>
      </main>
    </div>
  );
}
