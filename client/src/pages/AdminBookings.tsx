import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  pending: "รอการยืนยัน",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export default function AdminBookings() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data: bookings, isLoading, refetch } = trpc.bookings.list.useQuery();
  const updateStatus = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตสถานะสำเร็จ");
      refetch();
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาด");
    },
  });

  const deleteBooking = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบการจองสำเร็จ");
      refetch();
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาด");
    },
  });

  const filteredBookings = selectedStatus
    ? bookings?.filter((b: any) => b.status === selectedStatus)
    : bookings;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการการจอง</h1>
          <p className="text-muted-foreground mt-2">
            จำนวนการจองทั้งหมด: {bookings?.length || 0}
          </p>
        </div>

        {/* Filter */}
        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">ฟิลเตอร์ตามสถานะ:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทั้งหมด</SelectItem>
                <SelectItem value="pending">รอการยืนยัน</SelectItem>
                <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">กำลังโหลด...</p>
          </div>
        ) : filteredBookings && filteredBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredBookings.map((booking: any) => (
              <Card key={booking.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {booking.customerName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.customerPhone}
                    </p>
                    {booking.customerEmail && (
                      <p className="text-sm text-muted-foreground">
                        {booking.customerEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">บริการ:</span>
                      <span className="text-sm">{booking.serviceType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">วันที่:</span>
                      <span className="text-sm">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "th-TH"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">เวลา:</span>
                      <span className="text-sm">{booking.timeSlot}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    {booking.location && (
                      <div>
                        <span className="text-sm font-medium">สถานที่:</span>
                        <p className="text-sm text-muted-foreground">
                          {booking.location}
                        </p>
                      </div>
                    )}

                    {booking.notes && (
                      <div>
                        <span className="text-sm font-medium">หมายเหตุ:</span>
                        <p className="text-sm text-muted-foreground">
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_COLORS[
                              booking.status as keyof typeof STATUS_COLORS
                            ]
                          }`}
                        >
                          {
                            STATUS_LABELS[
                              booking.status as keyof typeof STATUS_LABELS
                            ]
                          }
                        </span>
                      </div>

                      <Select
                        value={booking.status}
                        onValueChange={(newStatus) => {
                          updateStatus.mutate({
                            id: booking.id,
                            status: newStatus as any,
                          });
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">รอการยืนยัน</SelectItem>
                          <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                          <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                          <SelectItem value="cancelled">ยกเลิก</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "คุณแน่ใจหรือว่าต้องการลบการจองนี้?"
                            )
                          ) {
                            deleteBooking.mutate({ id: booking.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">ไม่มีการจองในขณะนี้</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
