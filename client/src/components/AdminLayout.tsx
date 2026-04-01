import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAdmin } from "@/contexts/AdminContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { LogOut, Menu, X, LayoutDashboard, FileText, Image, BarChart3, Star, Calendar, File, FileCheck } from "lucide-react";

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
    { label: "เอกสาร", icon: File, href: "/admin/documents" },
    { label: "สร้างเอกสาร", icon: FileCheck, href: "/admin/document-generator" },
    { label: "สถิติ", icon: BarChart3, href: "/admin/stats" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-secondary text-white transition-all duration-300 flex flex-col border-r-4 border-primary`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center w-full"}`}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">ท</span>
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Admin</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/20 space-y-2">
          {sidebarOpen && (
            <div className="text-sm text-white/80 px-2">
              <p className="font-semibold">{adminName}</p>
              <p className="text-xs text-white/60">{adminEmail}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-white hover:bg-white/10 gap-2 justify-start"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && "ออกจากระบบ"}
          </Button>
        </div>

        {/* Toggle Sidebar */}
        <div className="p-2 border-t border-white/20">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="sm"
            className="w-full text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b-4 border-primary sticky top-0 z-40 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">บริษัท ท่อทองการเจริญ - ระบบแอดมิน</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">ยินดีต้อนรับ, {adminName}</span>
              <NotificationCenter />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
