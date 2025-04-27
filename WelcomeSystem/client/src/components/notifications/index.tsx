import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

const NotificationsPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: open,
    staleTime: 1000 * 60, // 1 minute
  });

  const hasUnread = notifications?.some(notification => !notification.read);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative p-1 rounded-full text-gray-400 hover:text-gray-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
          {hasUnread && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications && notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary"
              onClick={() => {
                // Mark all as read
                apiRequest("POST", "/api/notifications/read-all");
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel;