import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Image, TrendingUp, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: inquiries, isLoading: inquiriesLoading } = trpc.inquiries.list.useQuery();
  const { data: portfolio, isLoading: portfolioLoading } = trpc.portfolio.list.useQuery();

  const newInquiries = inquiries?.filter((i) => i.status === "new").length || 0;
  const totalInquiries = inquiries?.length || 0;
  const totalPortfolio = portfolio?.length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">แดชบอร์ด</h1>
          <p className="text-muted-foreground">ข้อมูลสรุปของระบบบริหารจัดการ</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Inquiries */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ใบขอใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {inquiriesLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <div className="text-3xl font-bold text-secondary">{newInquiries}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">ต้องการตอบกลับ</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Total Inquiries */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ใบขอทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {inquiriesLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <div className="text-3xl font-bold text-secondary">{totalInquiries}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">ใบขอเสนอราคา</p>
                </div>
                <FileText className="w-8 h-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Items */}
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ผลงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {portfolioLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <div className="text-3xl font-bold text-secondary">{totalPortfolio}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">โครงการทั้งหมด</p>
                </div>
                <Image className="w-8 h-8 text-secondary opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">อัตราการตอบสนอง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {inquiriesLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <div className="text-3xl font-bold text-secondary">
                      {totalInquiries > 0 ? Math.round(((totalInquiries - newInquiries) / totalInquiries) * 100) : 0}%
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">ได้รับการตอบกลับ</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>การดำเนินการอย่างรวดเร็ว</CardTitle>
            <CardDescription>ไปยังหน้าจัดการต่างๆ</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/admin/inquiries")}
              className="bg-primary hover:bg-primary/90 text-white gap-2 justify-start"
            >
              <FileText className="w-4 h-4" />
              จัดการใบขอเสนอราคา
            </Button>
            <Button
              onClick={() => navigate("/admin/portfolio")}
              className="bg-secondary hover:bg-secondary/90 text-white gap-2 justify-start"
            >
              <Image className="w-4 h-4" />
              จัดการผลงาน
            </Button>
          </CardContent>
        </Card>

        {/* Recent Inquiries Preview */}
        {inquiries && inquiries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ใบขอล่าสุด</CardTitle>
              <CardDescription>ใบขอเสนอราคา 5 รายการล่าสุด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold text-secondary">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          inquiry.status === "new"
                            ? "bg-orange-100 text-orange-700"
                            : inquiry.status === "contacted"
                              ? "bg-blue-100 text-blue-700"
                              : inquiry.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inquiry.status === "new"
                          ? "ใหม่"
                          : inquiry.status === "contacted"
                            ? "ติดต่อแล้ว"
                            : inquiry.status === "completed"
                              ? "เสร็จสิ้น"
                              : "ปฏิเสธ"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => navigate("/admin/inquiries")}
                variant="outline"
                className="w-full mt-4"
              >
                ดูทั้งหมด
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
