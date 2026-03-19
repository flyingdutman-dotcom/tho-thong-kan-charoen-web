import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAdmin } from "@/contexts/AdminContext";
import { Loader2, TrendingUp, Users, FileText, Star, Calendar } from "lucide-react";

export default function AdminStats() {
  const { isAdminLoggedIn } = useAdmin();

  // Fetch data for statistics
  const { data: inquiries, isLoading: inquiriesLoading } = trpc.inquiries.listAdmin.useQuery();
  const { data: reviews, isLoading: reviewsLoading } = trpc.reviews.listAllAdmin.useQuery();
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.listAdmin.useQuery();

  if (!isAdminLoggedIn) {
    return <div>กำลังเปลี่ยนเส้นทาง...</div>;
  }

  const isLoading = inquiriesLoading || reviewsLoading || bookingsLoading;

  // Calculate statistics
  const totalInquiries = inquiries?.length || 0;
  const newInquiries = inquiries?.filter((i) => i.status === "new").length || 0;
  const completedInquiries = inquiries?.filter((i) => i.status === "completed").length || 0;

  const totalReviews = reviews?.length || 0;
  const publishedReviews = reviews?.filter((r) => r.isPublished).length || 0;
  const averageRating = reviews && reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter((b: any) => b.status === "confirmed").length || 0;
  const completedBookings = bookings?.filter((b: any) => b.status === "completed").length || 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: { icon: any; title: string; value: string | number; subtitle?: string; color: string }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">สถิติและการวิเคราะห์</h2>
          <p className="text-muted-foreground">ภาพรวมของกิจกรรมและประสิทธิภาพของบริษัท</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={FileText} title="ใบขอเสนอราคา" value={totalInquiries} subtitle={`${newInquiries} ใหม่`} color="bg-blue-500" />
              <StatCard icon={TrendingUp} title="ใบขอที่เสร็จสิ้น" value={completedInquiries} subtitle={`จาก ${totalInquiries} ใบ`} color="bg-green-500" />
              <StatCard icon={Users} title="ลูกค้า" value={totalInquiries} subtitle="จากใบขอเสนอราคา" color="bg-purple-500" />

              <StatCard icon={Star} title="รีวิวทั้งหมด" value={totalReviews} subtitle={`${publishedReviews} เผยแพร่`} color="bg-yellow-500" />
              <StatCard icon={Star} title="คะแนนเฉลี่ย" value={`${averageRating} / 5`} subtitle={`จาก ${totalReviews} รีวิว`} color="bg-orange-500" />
              <StatCard icon={Calendar} title="การจองทั้งหมด" value={totalBookings} subtitle={`${confirmedBookings} ยืนยัน`} color="bg-red-500" />
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inquiries Status */}
              <Card>
                <CardHeader>
                  <CardTitle>สถานะใบขอเสนอราคา</CardTitle>
                  <CardDescription>การกระจายตามสถานะ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ใหม่</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${totalInquiries > 0 ? (newInquiries / totalInquiries) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{newInquiries}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ติดต่อแล้ว</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${totalInquiries > 0 ? ((inquiries?.filter((i: any) => i.status === "contacted").length || 0) / totalInquiries) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{inquiries?.filter((i) => i.status === "contacted").length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">เสร็จสิ้น</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${totalInquiries > 0 ? (completedInquiries / totalInquiries) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{completedInquiries}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ปฏิเสธ</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${totalInquiries > 0 ? ((inquiries?.filter((i) => i.status === "rejected").length || 0) / totalInquiries) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{inquiries?.filter((i: any) => i.status === "rejected").length || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bookings Status */}
              <Card>
                <CardHeader>
                  <CardTitle>สถานะการจอง</CardTitle>
                  <CardDescription>การกระจายตามสถานะ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">รอดำเนินการ</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${totalBookings > 0 ? ((bookings?.filter((b: any) => b.status === "pending").length || 0) / totalBookings) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{bookings?.filter((b: any) => b.status === "pending").length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ยืนยัน</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{confirmedBookings}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">เสร็จสิ้น</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{completedBookings}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ยกเลิก</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${totalBookings > 0 ? ((bookings?.filter((b: any) => b.status === "cancelled").length || 0) / totalBookings) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{bookings?.filter((b: any) => b.status === "cancelled").length || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>สรุปข้อมูล</CardTitle>
                <CardDescription>ข้อมูลรวมของระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalInquiries}</p>
                    <p className="text-xs text-muted-foreground mt-1">ใบขอทั้งหมด</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalReviews}</p>
                    <p className="text-xs text-muted-foreground mt-1">รีวิวทั้งหมด</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalBookings}</p>
                    <p className="text-xs text-muted-foreground mt-1">การจองทั้งหมด</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{publishedReviews}</p>
                    <p className="text-xs text-muted-foreground mt-1">รีวิวเผยแพร่</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
