import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { cn } from "@/lib/utils"

export default function MainLayout() {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar className="hidden md:block" /> {/* Hide sidebar on small screens */}
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Main content area where nested routes will render */}
        <Outlet />
        </main>
      </div>
    </div>
  );
} 