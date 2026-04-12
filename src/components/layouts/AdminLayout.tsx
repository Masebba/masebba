import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  SettingsIcon,
  BriefcaseIcon,
  FileTextIcon,
  MessageSquareIcon,
  LogOutIcon,
  MenuIcon,
  LayoutGridIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      name: "Projects",
      path: "/admin/projects",
      icon: BriefcaseIcon,
    },
    {
      name: "Services",
      path: "/admin/services",
      icon: LayoutGridIcon,
    },
    {
      name: "Blog Posts",
      path: "/admin/blog",
      icon: FileTextIcon,
    },
    {
      name: "Messages",
      path: "/admin/messages",
      icon: MessageSquareIcon,
    },
    {
      name: "Site Settings",
      path: "/admin/settings",
      icon: SettingsIcon,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin" && location.pathname !== "/admin") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border
          transform transition-transform duration-200 ease-in-out
          overflow-y-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link
            to="/admin"
            className="text-xl font-bold text-main tracking-tight"
          >
            Admin<span className="text-primary">Panel</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 px-2">
            Menu
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:bg-background hover:text-main"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex h-full min-w-0 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-surface border-b border-border sticky top-0 z-10 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-muted hover:text-main"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-end items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline-block">
              {currentUser?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
