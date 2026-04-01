import React, { useState, useEffect } from "react";
import { Bell, X, Check, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem("notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
      } catch (e) {
        console.error("Failed to load notifications:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>แจ้งเตือน</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              ไม่มีแจ้งเตือน
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b last:border-b-0 ${getBackgroundColor(notification.type)} ${
                    !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp.toLocaleTimeString("th-TH")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export the addNotification function for global use */}
      {typeof window !== "undefined" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.notificationCenter = ${JSON.stringify({ addNotification })}`,
          }}
        />
      )}
    </>
  );
}

// Export a hook to use notifications
export function useNotification() {
  return {
    notify: (title: string, message: string, type?: "success" | "error" | "warning" | "info") => {
      const event = new CustomEvent("notification", {
        detail: { title, message, type: type || "info" },
      });
      window.dispatchEvent(event);
    },
  };
}
