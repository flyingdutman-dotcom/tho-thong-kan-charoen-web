import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Reviews() {
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery();
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("ส่งรีวิวสำเร็จ รอการอนุมัติจากแอดมิน");
      setFormData({
        customerName: "",
        customerEmail: "",
        rating: 5,
        title: "",
        content: "",
        serviceType: "",
        projectLocation: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    rating: 5,
    title: "",
    content: "",
    serviceType: "",
    projectLocation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReview.mutate(formData as any);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-primary py-12">
        <div className="container">
          <Link href="/">
            <a className="text-white hover:opacity-80 mb-4 inline-block">← กลับไปหน้าแรก</a>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">รีวิวจากลูกค้า</h1>
          <p className="text-white/80">แบ่งปันประสบการณ์ของคุณกับเรา</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-secondary mb-6">รีวิวทั้งหมด</h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-secondary">{review.title}</h3>
                          <div className="flex gap-1">{getRatingStars(review.rating)}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          โดย: {review.customerName}
                        </p>
                      </div>
                    </div>

                    <p className="text-foreground mb-3">{review.content}</p>

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {review.serviceType && <span>{review.serviceType}</span>}
                      {review.projectLocation && <span>{review.projectLocation}</span>}
                      <span>
                        {new Date(review.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">ยังไม่มีรีวิว</p>
            )}
          </div>

          {/* Review Form */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-secondary mb-4">เขียนรีวิว</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    ชื่อของคุณ *
                  </label>
                  <Input
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="ชื่อ-นามสกุล"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    อีเมล
                  </label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    คะแนน *
                  </label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ ยอดเยี่ยม</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ ดี</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ ปกติ</SelectItem>
                      <SelectItem value="2">⭐⭐ ต้องปรับปรุง</SelectItem>
                      <SelectItem value="1">⭐ ไม่พอใจ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    หัวข้อรีวิว *
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="เช่น บริการดีมาก"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    เนื้อหารีวิว *
                  </label>
                  <Textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="แบ่งปันประสบการณ์ของคุณ..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    ประเภทบริการ
                  </label>
                  <Input
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    placeholder="เช่น ลอกท่อระบายน้ำ"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-secondary block mb-2">
                    สถานที่โครงการ
                  </label>
                  <Input
                    value={formData.projectLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, projectLocation: e.target.value })
                    }
                    placeholder="เช่น บ้านเลขที่ 123"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createReview.isPending}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {createReview.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    "ส่งรีวิว"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  รีวิวของคุณจะแสดงหลังจากอนุมัติจากแอดมิน
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
