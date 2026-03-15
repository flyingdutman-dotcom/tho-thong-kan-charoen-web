import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Phone, MapPin, Facebook, Instagram, Wrench, CheckCircle, Award, ArrowRight } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceType: "pipe-cleaning",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitInquiry = trpc.inquiries.submit.useMutation({
    onSuccess: () => {
      toast.success("ส่งใบขอเสนอราคาสำเร็จ เราจะติดต่อคุณในเร็วๆ นี้");
      setFormData({
        name: "",
        phone: "",
        serviceType: "pipe-cleaning",
        email: "",
        message: "",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitInquiry.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        serviceType: formData.serviceType,
        email: formData.email || undefined,
        message: formData.message || undefined,
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-primary">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">ท่อทองการเจริญ</h1>
              <p className="text-xs text-muted-foreground">บริการลอกท่อระบายน้ำมืออาชีพ</p>
            </div>
          </div>
          <a href="#contact-form">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Phone className="w-4 h-4" />
              ติดต่อเรา
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                บริการลอกท่อระบายน้ำ <span className="text-primary">มืออาชีพ</span>
              </h2>
              <p className="text-lg text-white/90">
                ปัญหาท่อตันไม่ต้องกังวล เราพร้อมแก้ไขปัญหาด้วยทีมช่างผู้เชี่ยวชาญและเครื่องมือที่ทันสมัย
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>สำรวจหน้างานฟรี</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>ประเมินราคาเร็ว</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>งานเล็กงานใหญ่ยินดีบริการ</span>
                </li>
              </ul>
              <div className="flex gap-4 pt-4">
                <a href="#contact-form">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2">
                    ขอใบเสนอราคา
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
                <a href="#contact-form">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    ปรึกษาฟรี
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="relative h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden border-2 border-primary/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Wrench className="w-24 h-24 text-primary mx-auto opacity-50" />
                  <p className="text-white/60">ภาพบริการลอกท่อระบายน้ำ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">บริการของเรา</h2>
            <p className="text-muted-foreground text-lg">บริการที่เรามอบให้เพื่อแก้ไขปัญหาท่อระบายน้ำของคุณ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Current Service */}
            <Card className="border-2 border-primary/30 hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-secondary">บริการลอกท่อระบายน้ำ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">บริการลอกท่อระบายน้ำในหมู่บ้าน อาคาร โรงงาน และสำนักงาน</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>ลอกท่อด้วยเครื่องมือทันสมัย</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>ทีมช่างผู้เชี่ยวชาญ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>บริการรวดเร็ว</span>
                  </li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-4">
                  เลือกบริการนี้
                </Button>
              </CardContent>
            </Card>

            {/* Coming Soon 1 */}
            <Card className="border-2 border-muted opacity-60 relative">
              <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                Coming Soon
              </div>
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-muted-foreground">งานติดตั้งระบบประปา</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">บริการติดตั้งและซ่อมแซมระบบประปาใหม่</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ออกแบบระบบประปา</li>
                  <li>• ติดตั้งท่อประปา</li>
                  <li>• ซ่อมแซมท่อรั่ว</li>
                </ul>
                <Button disabled className="w-full mt-4">
                  เร็วๆ นี้
                </Button>
              </CardContent>
            </Card>

            {/* Coming Soon 2 */}
            <Card className="border-2 border-muted opacity-60 relative">
              <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                Coming Soon
              </div>
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-muted-foreground">งานรับเหมาทั่วไป</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">บริการรับเหมาซ่อมแซมและบำรุงรักษาท่อน้ำ</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• บำรุงรักษาประจำปี</li>
                  <li>• ซ่อมแซมฉุกเฉิน</li>
                  <li>• งานเหมาอื่นๆ</li>
                </ul>
                <Button disabled className="w-full mt-4">
                  เร็วๆ นี้
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">ผลงานที่ผ่านมา</h2>
            <p className="text-muted-foreground text-lg mb-6">ประสบการณ์การบริการลูกค้าหลากหลายประเภท</p>
            <a href="/portfolio">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 gap-2">
                ดูผลงานทั้งหมด
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Wrench className="w-16 h-16 text-primary/40" />
              </div>
              <CardHeader>
                <CardTitle>บ้านเดี่ยว</CardTitle>
                <CardDescription>ลอกท่อระบายน้ำในบ้านเดี่ยวที่มีปัญหาอุดตัน</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">แก้ไขปัญหาท่อตันในห้องน้ำและห้องครัว ลูกค้าพึงพอใจกับความรวดเร็ว</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <Wrench className="w-16 h-16 text-secondary/40" />
              </div>
              <CardHeader>
                <CardTitle>อาคารพานิชย์</CardTitle>
                <CardDescription>บริการลอกท่อในอาคารพานิชย์ขนาดใหญ่</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">บำรุงรักษาระบบท่อระบายน้ำประจำปีสำหรับอาคารพานิชย์</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Wrench className="w-16 h-16 text-primary/40" />
              </div>
              <CardHeader>
                <CardTitle>โรงงาน</CardTitle>
                <CardDescription>ระบบท่อน้ำในโรงงานอุตสาหกรรม</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">ลอกท่อระบายน้ำในโรงงานขนาดใหญ่โดยไม่หยุดการผลิต</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <Award className="w-16 h-16 text-secondary/40" />
              </div>
              <CardHeader>
                <CardTitle>ใบรับรองมาตรฐาน</CardTitle>
                <CardDescription>ได้รับการรับรองจากหน่วยงานที่เกี่ยวข้อง</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">ทีมงานมีใบประกาศนียบัตรและประสบการณ์ในการบริการ</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="contact-form" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">ขอใบเสนอราคา</h2>
            <p className="text-muted-foreground text-lg">กรุณากรอกแบบฟอร์มด้านล่าง เราจะติดต่อคุณในเร็วๆ นี้</p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-secondary font-semibold">
                      ชื่อ-นามสกุล *
                    </Label>
                    <Input
                      id="name"
                      placeholder="กรุณากรอกชื่อ"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-secondary font-semibold">
                      เบอร์โทรศัพท์ *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="เช่น 081-234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-secondary font-semibold">
                    อีเมล (ไม่บังคับ)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service" className="text-secondary font-semibold">
                    ประเภทบริการ *
                  </Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                    <SelectTrigger className="border-primary/30 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pipe-cleaning">บริการลอกท่อระบายน้ำ</SelectItem>
                      <SelectItem value="plumbing-installation">งานติดตั้งระบบประปา (Coming Soon)</SelectItem>
                      <SelectItem value="general-contracting">งานรับเหมาทั่วไป (Coming Soon)</SelectItem>
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-secondary font-semibold">
                    รายละเอียดเพิ่มเติม (ไม่บังคับ)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="บอกเราเกี่ยวกับปัญหาของคุณ..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="border-primary/30 focus:border-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {isSubmitting ? "กำลังส่ง..." : "ส่งใบขอเสนอราคา"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  เราจะติดต่อคุณภายใน 24 ชั่วโมง
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">ท่อทองการเจริญ</h3>
              </div>
              <p className="text-white/80">บริการลอกท่อระบายน้ำมืออาชีพ บริการดีไม่ทิ้งงาน</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">ติดต่อเรา</h4>
              <div className="space-y-2 text-white/80">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p>092-992-2701</p>
                    <p>094-912-5554</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p>ปทุมธานี ตำบลบึงสนั่น อำเภอธัญบุรี</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">ติดตามเรา</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/thx.thxng.kar.ceriy.cakad/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a href="https://www.instagram.com/torthongkanjaroen/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Google Maps Link */}
          <div className="border-t border-white/20 pt-8 mb-8">
            <a href="https://maps.google.com/?q=ปทุมธานี+ตำบลบึงสนั่น+อำเภอธัญบุรี" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold">
              <MapPin className="w-5 h-5" />
              ดูตำแหน่งที่ตั้งบน Google Maps
            </a>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
            <p>&copy; 2026 บริษัท ท่อทองการเจริญ จำกัด สงวนลิขสิทธิ์</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
