"use client";

import AdminDashboard from '@/components/admin/AdminDashboard';
import Header from '@/components/layout/Header';

export default function AdminPage() {

  return (
    <div className="h-screen flex flex-col text-white">
      <Header />
      <main className="flex-1 overflow-y-auto container mx-auto pt-24 pb-12 px-4 no-scrollbar">
        <div className="w-full max-w-4xl mx-auto">
          <AdminDashboard />
        </div>
      </main>
    </div>
  );
}
