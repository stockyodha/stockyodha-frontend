import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDesktopCollapse = () => setIsDesktopCollapsed(!isDesktopCollapsed);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar
        className="hidden md:block"
        isCollapsed={isDesktopCollapsed}
        onToggleCollapse={toggleDesktopCollapse}
      />

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar isMobile={true} className="block border-r-0" onLinkClick={toggleSidebar} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <Topbar onMobileMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 