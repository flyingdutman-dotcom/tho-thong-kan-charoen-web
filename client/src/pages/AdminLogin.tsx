import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const { setAdminSession } = useAdmin();

  const login = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      setAdminSession({
        adminId: data.adminId,
        username: username,
        loginTime: Date.now(),
      });
      toast.success("ล็อคอินสำเร็จ!");
      navigate("/admin");
    },
    onError: (error: any) => {
      toast.error(error.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    await login.mutateAsync({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-white text-2xl font-bold">ท</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ระบบแอดมิน</h1>
          <p className="text-muted-foreground mt-2">บริษัท ท่อทองการเจริญ จำกัด</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl border-2 border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                <User className="w-4 h-4 inline mr-2" />
                ชื่อผู้ใช้
              </label>
              <Input
                type="text"
                placeholder="กรุณาระบุชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={login.isPending}
                className="border-2 border-secondary/30 focus:border-primary"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                <Lock className="w-4 h-4 inline mr-2" />
                รหัสผ่าน
              </label>
              <Input
                type="password"
                placeholder="กรุณาระบุรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={login.isPending}
                className="border-2 border-secondary/30 focus:border-primary"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {login.isPending ? "กำลังล็อคอิน..." : "ล็อคอิน"}
            </Button>

            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full border-2 border-secondary/30 hover:bg-secondary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าแรก
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ นี่คือหน้าล็อคอินสำหรับแอดมินเท่านั้น
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            © 2026 บริษัท ท่อทองการเจริญ จำกัด
          </p>
        </div>
      </div>
    </div>
  );
}
