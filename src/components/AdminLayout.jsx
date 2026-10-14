import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Dynamic Nav Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto animate-fade-in min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
