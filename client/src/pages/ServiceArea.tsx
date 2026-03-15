import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyMap from "@/components/CompanyMap";
import { Link } from "wouter";
import { MapPin, CheckCircle } from "lucide-react";

export default function ServiceArea() {
  const serviceAreas = [
    "กรุงเทพมหานคร",
    "นนทบุรี",
    "ปทุมธานี",
    "สมุทรปราการ",
    "สมุทรสาคร",
    "นครปฐม",
    "สมุทรสงคราม",
    "ราชบุรี",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-primary py-12">
        <div className="container">
          <Link href="/">
            <a className="text-white hover:opacity-80 mb-4 inline-block">← กลับไปหน้าแรก</a>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">พื้นที่บริการ</h1>
          <p className="text-white/80">เรามีบริการในพื้นที่กรุงเทพและปริมณฑล</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Map */}
          <div className="lg:col-span-2">
            <CompanyMap title="แผนที่บริการ" description="พื้นที่ที่เรามีบริการ" showInfo={true} />
          </div>

          {/* Service Areas List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  พื้นที่บริการ
                </CardTitle>
                <CardDescription>เราบริการในพื้นที่เหล่านี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceAreas.map((area) => (
                    <div key={area} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{area}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    ไม่พบพื้นที่ของคุณในรายการ?
                  </p>
                  <Link href="/">
                    <a>
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        ติดต่อเราเพื่อสอบถาม
                      </Button>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Service Coverage Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ขอบเขตการบริการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                บริษัท ท่อทองการเจริญ จำกัด ให้บริการลอกท่อระบายน้ำและรับเหมาทั่วไปในพื้นที่กรุงเทพมหานคร
                และปริมณฑล
              </p>
              <p>
                เรามีทีมงานมืออาชีพพร้อมอุปกรณ์ทันสมัยเพื่อให้บริการได้อย่างรวดเร็วและมีประสิทธิภาพ
              </p>
              <p>
                สำหรับพื้นที่นอกเขตบริการ กรุณาติดต่อเราเพื่อสอบถามความเป็นไปได้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ช่วงเวลาบริการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-1">วันจันทร์ - วันศุกร์</p>
                <p className="text-muted-foreground">08:00 - 18:00 น.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">วันเสาร์ - วันอาทิตย์</p>
                <p className="text-muted-foreground">09:00 - 17:00 น.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">ฉุกเฉิน</p>
                <p className="text-muted-foreground">24 ชั่วโมง (โทรติดต่อ)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-secondary to-primary rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">ต้องการบริการ?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            ติดต่อเราวันนี้เพื่อขอใบเสนอราคาหรือปรึกษาฟรี เราพร้อมให้บริการ
          </p>
          <Link href="/">
            <a>
              <Button size="lg" className="bg-white text-secondary hover:bg-white/90">
                ขอใบเสนอราคา
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
