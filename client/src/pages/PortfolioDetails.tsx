import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronLeft, MapPin, Calendar } from "lucide-react";

export default function PortfolioDetails() {
  const [, params] = useRoute("/portfolio/:id");
  const [, navigate] = useLocation();
  const portfolioId = params?.id ? parseInt(params.id) : null;

  const { data: item, isLoading, error } = trpc.portfolio.get.useQuery(
    { id: portfolioId || 0 },
    { enabled: !!portfolioId }
  );

  if (!portfolioId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary mb-4">ไม่พบผลงาน</h1>
          <Button onClick={() => navigate("/portfolio")}>กลับไปยังผลงาน</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary mb-4">ไม่พบผลงาน</h1>
          <p className="text-muted-foreground mb-4">ขออภัยค่ะ ไม่สามารถโหลดรายละเอียดผลงานได้</p>
          <Button onClick={() => navigate("/portfolio")}>กลับไปยังผลงาน</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-primary">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/portfolio")}
            className="gap-2 text-secondary hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            กลับไปยังผลงาน
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title and Meta */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-secondary mb-4">{item.title}</h1>
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              {item.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.completedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{new Date(item.completedDate).toLocaleDateString("th-TH")}</span>
                </div>
              )}
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                {item.category}
              </div>
            </div>
          </div>

          {/* Before/After Images */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {item.beforeImage && (
              <Card className="overflow-hidden border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">ภาพก่อน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={item.beforeImage}
                      alt="ภาพก่อน"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3Eไม่สามารถโหลดรูปภาพ%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {item.afterImage && (
              <Card className="overflow-hidden border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">ภาพหลัง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={item.afterImage}
                      alt="ภาพหลัง"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3Eไม่สามารถโหลดรูปภาพ%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <Card className="border-2 border-primary/20 mb-8">
              <CardHeader>
                <CardTitle>รายละเอียดโครงการ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">สนใจบริการของเรา?</h2>
            <p className="mb-6 text-white/90">
              ติดต่อเราเพื่อขอใบเสนอราคาหรือปรึกษาเพิ่มเติม
            </p>
            <a href="/#contact-form">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                ขอใบเสนอราคา
              </Button>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-white/60 text-sm">
          <p>&copy; 2026 บริษัท ท่อทองการเจริญ จำกัด สงวนลิขสิทธิ์</p>
        </div>
      </footer>
    </div>
  );
}
