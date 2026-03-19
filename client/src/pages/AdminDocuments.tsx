import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

const DOCUMENT_TYPES = [
  { value: "quotation", label: "ใบเสนอราคา" },
  { value: "invoice", label: "ใบเสร็จรับเงิน" },
  { value: "purchase-order", label: "ใบสั่งซื้อ" },
  { value: "work-order", label: "ใบรับงาน" },
  { value: "certificate", label: "ใบประกาศนียบัตร" },
  { value: "contract", label: "ใบสัญญา" },
];

const ALLOWED_MIME_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

export default function AdminDocuments() {
  const { isAdminLoggedIn } = useAdmin();
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading, refetch } = trpc.documents.listAdmin.useQuery();
  const uploadDocument = trpc.documents.uploadAdmin.useMutation({
    onSuccess: () => {
      toast.success("อัปโหลดเอกสารสำเร็จ");
      refetch();
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
      setIsUploading(false);
    },
  });

  const deleteDocument = trpc.documents.deleteAdmin.useMutation({
    onSuccess: () => {
      toast.success("ลบเอกสารสำเร็จ");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  if (!isAdminLoggedIn) {
    return <div>กำลังเปลี่ยนเส้นทาง...</div>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลด PDF, Word, หรือ Excel");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ขนาดไฟล์เกิน 10MB");
      return;
    }

    if (!selectedType) {
      toast.error("กรุณาเลือกประเภทเอกสาร");
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to S3
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("อัปโหลดไฟล์ล้มเหลว");
      }

      const uploadedFile = await uploadResponse.json();

      // Create document record
      await uploadDocument.mutateAsync({
        documentType: selectedType as any,
        documentName: file.name.replace(/\.[^/.]+$/, ""),
        fileKey: uploadedFile.key,
        fileUrl: uploadedFile.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: 1, // Admin ID - should come from context
      });

      // Reset form
      setSelectedType("");
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
      setIsUploading(false);
    }
  };

  const filteredDocuments = documents?.filter((doc) => {
    const matchesType = !selectedType || doc.documentType === selectedType;
    const matchesSearch = !searchTerm || doc.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">จัดการเอกสาร</h2>
          <p className="text-muted-foreground">อัปโหลด ดูแลและจัดการเอกสารต่างๆ ของบริษัท</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>อัปโหลดเอกสารใหม่</CardTitle>
            <CardDescription>เลือกประเภทเอกสารและอัปโหลดไฟล์ (PDF, Word, Excel)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ประเภทเอกสาร</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภทเอกสาร" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">เลือกไฟล์</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังอัปโหลด...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาและกรองเอกสาร</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ค้นหาชื่อเอกสาร</label>
                <Input
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">กรองตามประเภท</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ทั้งหมด</SelectItem>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>รายการเอกสาร</CardTitle>
            <CardDescription>{filteredDocuments.length} เอกสาร</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>ไม่มีเอกสาร</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">ชื่อเอกสาร</th>
                      <th className="text-left py-3 px-4 font-semibold">ประเภท</th>
                      <th className="text-left py-3 px-4 font-semibold">ขนาด</th>
                      <th className="text-left py-3 px-4 font-semibold">วันที่อัปโหลด</th>
                      <th className="text-right py-3 px-4 font-semibold">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{doc.documentName}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-secondary text-white text-xs px-3 py-1 rounded-full">
                            {getDocumentTypeLabel(doc.documentType)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{formatFileSize(doc.fileSize)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(doc.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              <Download className="w-4 h-4" />
                              ดาวน์โหลด
                            </a>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm("คุณแน่ใจว่าต้องการลบเอกสารนี้?")) {
                                  deleteDocument.mutate({ id: doc.id });
                                }
                              }}
                              disabled={deleteDocument.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
