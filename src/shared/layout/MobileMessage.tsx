"use client";

import { MonitorSmartphone } from 'lucide-react';

export default function MobileMessage() {
  return (
    <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center text-white">
      <div className="bg-black/20 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg max-w-sm">
        <MonitorSmartphone className="w-16 h-16 mx-auto mb-6 text-red-500" />
        <h1 className="text-2xl font-bold mb-2 text-red-500">Desktop Only</h1>
        <p className="text-white/80">
          Liorea is designed exclusively for desktop. Mobile access is blocked to ensure the best study experience.
        </p>
      </div>
    </div>
  );
}
