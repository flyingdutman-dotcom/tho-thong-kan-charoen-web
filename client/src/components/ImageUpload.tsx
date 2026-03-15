import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  onImageUrl: (url: string) => void;
  value?: string;
}

export default function ImageUpload({ label, onImageUrl, value }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setImageUrl(data.url);
      onImageUrl(data.url);
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = (url: string) => {
    setImageUrl(url);
    onImageUrl(url);
    if (url) {
      setPreview(url);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setImageUrl("");
    onImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-secondary font-semibold">{label}</Label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-2">
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex flex-col items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">กำลังอัปโหลด...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-secondary">คลิกเพื่ออัปโหลดรูปภาพ</span>
                <span className="text-xs text-muted-foreground">หรือลากไฟล์มาวาง</span>
              </>
            )}
          </button>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-semibold">หรือใส่ URL รูปภาพ</label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => handleUrlInput(e.target.value)}
            className="border-primary/30 focus:border-primary text-sm"
          />
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          ✓ รองรับ JPG, PNG, WebP • ขนาดสูงสุด 5MB
        </p>
      </div>
    </div>
  );
}
