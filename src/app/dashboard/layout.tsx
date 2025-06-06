"use client"
import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  useEffect(() => {

    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener('sidebarStateChange' as any, handleSidebarChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handleSidebarChange as EventListener);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 overflow-auto`}>
       {children}
      </main>
    </div>
  );
}