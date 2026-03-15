import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV, downloadExcel } from "@/lib/export";

export default function AdminInquiries() {
  const { data: inquiries, isLoading, refetch } = trpc.inquiries.list.useQuery();
  const updateStatus = trpc.inquiries.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตสถานะสำเร็จ");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredInquiries =
    selectedStatus === "all" ? inquiries : inquiries?.filter((i) => i.status === selectedStatus);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "ใหม่";
      case "contacted":
        return "ติดต่อแล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "rejected":
        return "ปฏิเสธ";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-orange-100 text-orange-700";
      case "contacted":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">จัดการใบขอเสนอราคา</h1>
          <p className="text-muted-foreground">ดูและจัดการใบขอเสนอราคาจากลูกค้า</p>
        </div>

        {/* Filter & Export */}
        <Card>
          <CardHeader>
            <CardTitle>ตัวกรองและส่งออก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="space-y-2 flex-1 min-w-48">
                <label className="text-sm font-semibold text-secondary">สถานะ</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="new">ใหม่</SelectItem>
                    <SelectItem value="contacted">ติดต่อแล้ว</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (filteredInquiries && filteredInquiries.length > 0) {
                      downloadCSV(filteredInquiries as any, `inquiries-${new Date().toISOString().split('T')[0]}.csv`);
                      toast.success("ดาวน์โหลด CSV สำเร็จ");
                    } else {
                      toast.error("ไม่มีข้อมูลให้ส่งออก");
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (filteredInquiries && filteredInquiries.length > 0) {
                      downloadExcel(filteredInquiries as any, `inquiries-${new Date().toISOString().split('T')[0]}.xlsx`);
                      toast.success("ดาวน์โหลด Excel สำเร็จ");
                    } else {
                      toast.error("ไม่มีข้อมูลให้ส่งออก");
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>ใบขอเสนอราคา ({filteredInquiries?.length || 0})</CardTitle>
                <CardDescription>รายการใบขอเสนอราคาทั้งหมด</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredInquiries && filteredInquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-primary/20">
                      <th className="text-left py-3 px-4 font-semibold text-secondary">ชื่อ</th>
                      <th className="text-left py-3 px-4 font-semibold text-secondary">เบอร์โทร</th>
                      <th className="text-left py-3 px-4 font-semibold text-secondary">อีเมล</th>
                      <th className="text-left py-3 px-4 font-semibold text-secondary">บริการ</th>
                      <th className="text-left py-3 px-4 font-semibold text-secondary">สถานะ</th>
                      <th className="text-left py-3 px-4 font-semibold text-secondary">วันที่</th>
                      <th className="text-left py-3 px-4 font-semibold text-secondary">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-muted hover:bg-muted/50">
                        <td className="py-3 px-4">{inquiry.name}</td>
                        <td className="py-3 px-4">{inquiry.phone}</td>
                        <td className="py-3 px-4">{inquiry.email || "-"}</td>
                        <td className="py-3 px-4 text-sm">{inquiry.serviceType}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={inquiry.status}
                            onValueChange={(newStatus) => {
                              updateStatus.mutate({
                                id: inquiry.id,
                                status: newStatus as any,
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">ใหม่</SelectItem>
                              <SelectItem value="contacted">ติดต่อแล้ว</SelectItem>
                              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                              <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(inquiry.createdAt).toLocaleDateString("th-TH")}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">ไม่มีใบขอเสนอราคา</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
