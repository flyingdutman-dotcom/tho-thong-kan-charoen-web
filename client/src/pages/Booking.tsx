import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Phone, Mail, User, MapPin, FileText } from "lucide-react";

const SERVICES = [
  { value: "pipe-cleaning", label: "บริการลอกท่อระบายน้ำ" },
  { value: "general-contracting", label: "งานรับเหมาทั่วไป" },
  { value: "maintenance", label: "บริการบำรุงรักษา" },
];

const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

export default function Booking() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceType: "",
    bookingDate: "",
    timeSlot: "",
    location: "",
    notes: "",
  });

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("จองบริการสำเร็จ! เราจะติดต่อคุณเร็วๆ นี้");
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        serviceType: "",
        bookingDate: "",
        timeSlot: "",
        location: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.serviceType || !formData.bookingDate || !formData.timeSlot) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    await createBooking.mutateAsync({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      serviceType: formData.serviceType,
      bookingDate: new Date(formData.bookingDate),
      timeSlot: formData.timeSlot,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
    });
  };

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">จองบริการของเรา</h1>
          <p className="text-lg text-muted-foreground">เลือกวันและเวลาที่เหมาะสมสำหรับคุณ</p>
        </div>

        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                ข้อมูลส่วนตัว
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ชื่อ-นามสกุล *
                </label>
                <Input
                  type="text"
                  placeholder="กรุณาระบุชื่อ-นามสกุล"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    เบอร์โทร *
                  </label>
                  <Input
                    type="tel"
                    placeholder="0812345678"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    อีเมล
                  </label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-xl font-semibold text-foreground">ข้อมูลบริการ</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ประเภทบริการ *
                </label>
                <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทบริการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  สถานที่บริการ
                </label>
                <Input
                  type="text"
                  placeholder="กรุณาระบุที่อยู่หรือพื้นที่"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Booking Date & Time */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-xl font-semibold text-foreground">วันและเวลา</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    วันที่ต้องการจอง *
                  </label>
                  <Input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    เวลา *
                  </label>
                  <Select value={formData.timeSlot} onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4 border-t pt-6">
              <label className="block text-sm font-medium text-foreground">
                <FileText className="w-4 h-4 inline mr-2" />
                หมายเหตุเพิ่มเติม
              </label>
              <Textarea
                placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับบริการที่ต้องการ..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              <Button
                type="submit"
                disabled={createBooking.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {createBooking.isPending ? "กำลังส่งข้อมูล..." : "ยืนยันการจอง"}
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                ✓ เราจะติดต่อคุณภายใน 24 ชั่วโมงเพื่อยืนยันการจองของคุณ
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
