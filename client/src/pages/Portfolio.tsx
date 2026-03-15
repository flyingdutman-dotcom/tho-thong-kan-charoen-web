import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronLeft, MapPin, ArrowRight } from "lucide-react";

export default function Portfolio() {
  const [, navigate] = useLocation();
  const { data: portfolioItems, isLoading } = trpc.portfolio.list.useQuery();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-primary">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 text-secondary hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            กลับไปหน้าแรก
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">ผลงานที่ผ่านมา</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            ดูผลงานการบริการลอกท่อระบายน้ำของเราจากลูกค้าต่างๆ ที่ได้รับความพึงพอใจ
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <main className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : portfolioItems && portfolioItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/portfolio/${item.id}`)}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {item.afterImage ? (
                    <img
                      src={item.afterImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <span className="text-muted-foreground">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      {item.category}
                    </div>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-primary hover:text-primary/90 gap-2"
                  >
                    ดูรายละเอียด
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-secondary mb-4">ยังไม่มีผลงาน</h2>
            <p className="text-muted-foreground mb-6">
              เรากำลังเพิ่มผลงานของเรา กรุณากลับมาตรวจสอบในภายหลัง
            </p>
            <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90 text-white">
              กลับไปหน้าแรก
            </Button>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-secondary mb-4">สนใจบริการของเรา?</h2>
          <p className="text-muted-foreground mb-6">
            ติดต่อเราเพื่อขอใบเสนอราคาหรือปรึกษาเพิ่มเติมเกี่ยวกับบริการลอกท่อระบายน้ำ
          </p>
          <a href="/#contact-form">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2">
              ขอใบเสนอราคา
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8">
        <div className="container mx-auto px-4 text-center text-white/60 text-sm">
          <p>&copy; 2026 บริษัท ท่อทองการเจริญ จำกัด สงวนลิขสิทธิ์</p>
        </div>
      </footer>
    </div>
  );
}
