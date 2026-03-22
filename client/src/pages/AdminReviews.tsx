import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviews() {
  const { data: reviews, isLoading, refetch } = trpc.reviews.listAllAdmin.useQuery();
  const updateStatus = trpc.reviews.updateStatusAdmin.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตสถานะสำเร็จ");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const deleteReview = trpc.reviews.deleteAdmin.useMutation({
    onSuccess: () => {
      toast.success("ลบรีวิวสำเร็จ");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">จัดการรีวิวลูกค้า</h1>
          <p className="text-muted-foreground">ดูและจัดการรีวิวจากลูกค้า</p>
        </div>

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>รีวิวทั้งหมด ({reviews?.length || 0})</CardTitle>
            <CardDescription>รายการรีวิวจากลูกค้า</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-secondary">{review.title}</h3>
                          <div className="flex gap-1">{getRatingStars(review.rating)}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          โดย: {review.customerName} {review.customerEmail && `(${review.customerEmail})`}
                        </p>
                        {review.serviceType && (
                          <p className="text-sm text-muted-foreground">บริการ: {review.serviceType}</p>
                        )}
                        {review.projectLocation && (
                          <p className="text-sm text-muted-foreground">สถานที่: {review.projectLocation}</p>
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          review.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {review.isPublished ? "เผยแพร่" : "ร่าง"}
                      </div>
                    </div>

                    <p className="text-sm text-foreground">{review.content}</p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStatus.mutate({
                            id: review.id,
                            isPublished: !review.isPublished,
                          });
                        }}
                        disabled={updateStatus.isPending}
                        className="gap-2"
                      >
                        {review.isPublished ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            ซ่อน
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            เผยแพร่
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("คุณแน่ใจว่าต้องการลบรีวิวนี้?")) {
                            deleteReview.mutate({ id: review.id });
                          }
                        }}
                        disabled={deleteReview.isPending}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">ยังไม่มีรีวิว</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
