"use client";

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAdmin } from "@/contexts/AdminContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { LogOut, Menu, X, LayoutDashboard, FileText, Image, BarChart3, Star, Calendar, File, FileCheck, LineChart } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { isAdminLoggedIn, adminSession, logout: adminLogout } = useAdmin();

  const handleLogout = async () => {
    if (isAdminLoggedIn) {
      adminLogout();
    } else {
      await logout();
    }
    navigate("/");
  };

  // Check if user is logged in via admin login or Manus OAuth
  const isAdmin = isAdminLoggedIn || user?.role === "admin";
  const adminName = adminSession?.username || user?.name || "Admin";
  const adminEmail = user?.email || "";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้าแอดมิน</p>
          <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90 text-white">
            กลับไปหน้าแรก
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: "แดชบอร์ด", icon: LayoutDashboard, href: "/admin" },
    { label: "ใบขอเสนอราคา", icon: FileText, href: "/admin/inquiries" },
    { label: "ผลงาน", icon: Image, href: "/admin/portfolio" },
    { label: "รีวิว", icon: Star, href: "/admin/reviews" },
    { label: "การจอง", icon: Calendar, href: "/admin/bookings" },
    { label: "จัดการเอกสาร", icon: FileCheck, href: "/admin/documents-list" },
    { label: "รายงานเอกสาร", icon: LineChart, href: "/admin/document-reports" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-700`}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className={`${!sidebarOpen && "hidden"} font-bold text-lg`}>
            ท่อทองการเจริญ
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800"
              onClick={() => navigate(item.href)}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <div className={`${!sidebarOpen && "hidden"} text-sm`}>
            <p className="font-semibold truncate">{adminName}</p>
            <p className="text-slate-400 text-xs truncate">{adminEmail}</p>
          </div>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">ออกจากระบบ</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <NotificationCenter />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
