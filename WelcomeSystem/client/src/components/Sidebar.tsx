import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  Lightbulb, 
  BarChart2, 
  BookOpen, 
  CheckSquare, 
  FileOutput, 
  Settings, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, current: location === "/" },
    { name: "My Startups", href: "/", icon: Lightbulb, current: location === "/my-startups" },
    { name: "Progress", href: "/", icon: BarChart2, current: location === "/progress" },
    { name: "Resource Library", href: "/resources", icon: BookOpen, current: location === "/resources" },
    { name: "Task Planner", href: "/tasks", icon: CheckSquare, current: location === "/tasks" },
    { name: "Export Materials", href: "/export", icon: FileOutput, current: location === "/export" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col z-40 w-64 bg-white transform transition-transform ease-in-out duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo.svg"
              alt="StartupLaunchpad"
            />
            <span className="ml-2 text-lg font-semibold">StartupLaunchpad</span>
          </div>
          <button
            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 h-0 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    item.current
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-6 w-6",
                      item.current ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.fullName?.split(' ').map(n => n[0]).join('') || ''}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
              <Button 
                variant="link" 
                className="text-xs font-medium text-gray-500 hover:text-gray-700 p-0"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex items-center h-16 px-4 bg-white border-b border-gray-200">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo.svg"
                alt="StartupLaunchpad"
              />
              <span className="ml-2 text-lg font-semibold">StartupLaunchpad</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        item.current
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-6 w-6",
                          item.current ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt={user?.fullName || ""} />
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map(n => n[0]).join('') || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                  <Button 
                    variant="link" 
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 p-0"
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
