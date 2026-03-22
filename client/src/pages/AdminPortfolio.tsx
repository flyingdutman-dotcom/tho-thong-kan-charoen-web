import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

export default function AdminPortfolio() {
  const { data: portfolioItems, isLoading, refetch } = trpc.portfolio.list.useQuery();
  const createPortfolio = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast.success("เพิ่มผลงานสำเร็จ");
      setFormData({
        title: "",
        description: "",
        category: "pipe-cleaning",
        beforeImage: "",
        afterImage: "",
        location: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pipe-cleaning",
    beforeImage: "",
    afterImage: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("กรุณากรอกชื่อโครงการ");
      return;
    }
    if (!formData.category.trim()) {
      toast.error("กรุณาเลือกหมวดหมู่");
      return;
    }

    await createPortfolio.mutateAsync({
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      beforeImage: formData.beforeImage || undefined,
      afterImage: formData.afterImage || undefined,
      location: formData.location || undefined,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">จัดการผลงาน</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข และลบผลงานของบริษัท</p>
        </div>

        {/* Add Portfolio Form */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              เพิ่มผลงานใหม่
            </CardTitle>
            <CardDescription>กรอกข้อมูลผลงานและรูปภาพ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-secondary font-semibold">
                    ชื่อโครงการ *
                  </Label>
                  <Input
                    id="title"
                    placeholder="เช่น บ้านเดี่ยว ซ.ประชาชื่น"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-secondary font-semibold">
                    หมวดหมู่ *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="border-primary/30 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pipe-cleaning">ลอกท่อระบายน้ำ</SelectItem>
                      <SelectItem value="plumbing">ระบบประปา</SelectItem>
                      <SelectItem value="maintenance">บำรุงรักษา</SelectItem>
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-secondary font-semibold">
                  ที่อยู่
                </Label>
                <Input
                  id="location"
                  placeholder="เช่น ปทุมธานี"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-secondary font-semibold">
                  รายละเอียด
                </Label>
                <Textarea
                  id="description"
                  placeholder="บรรยายรายละเอียดของโครงการ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="border-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
              <ImageUpload
                label="รูปภาพก่อน"
                value={formData.beforeImage}
                onImageUrl={(url) => setFormData({ ...formData, beforeImage: url })}
              />

              <ImageUpload
                label="รูปภาพหลัง"
                value={formData.afterImage}
                onImageUrl={(url) => setFormData({ ...formData, afterImage: url })}
              />
              </div>

              <Button
                type="submit"
                disabled={createPortfolio.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {createPortfolio.isPending ? "กำลังเพิ่ม..." : "เพิ่มผลงาน"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Portfolio List */}
        <Card>
          <CardHeader>
            <CardTitle>ผลงานทั้งหมด ({portfolioItems?.length || 0})</CardTitle>
            <CardDescription>รายการผลงานที่เผยแพร่</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : portfolioItems && portfolioItems.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="border border-primary/20 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                      {item.afterImage ? (
                        <img
                          src={item.afterImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-secondary line-clamp-2">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.category}
                        </span>
                        {item.location && (
                          <span className="text-xs text-muted-foreground">{item.location}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-primary hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          แก้ไข
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          ลบ
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">ไม่มีผลงาน</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
