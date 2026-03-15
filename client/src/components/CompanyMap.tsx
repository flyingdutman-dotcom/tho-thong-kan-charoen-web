import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

interface CompanyMapProps {
  title?: string;
  description?: string;
  showInfo?: boolean;
}

export default function CompanyMap({
  title = "ที่ตั้งบริษัท",
  description = "เยี่ยมชมเราได้ที่สำนักงาน",
  showInfo = true,
}: CompanyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Check if Google Maps is loaded
    if (!(window as any).google) {
      console.warn('Google Maps not loaded');
      return;
    }

    // Initialize map with company location (Bangkok, Thailand as default)
    // Replace coordinates with actual company location
    const companyLocation = {
      lat: 13.7563,
      lng: 100.5018,
    };

    const mapOptions: any = {
      zoom: 15,
      center: companyLocation,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
    };

    mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

    // Add marker for company location
    new google.maps.Marker({
      position: companyLocation,
      map: mapInstanceRef.current,
      title: "บริษัท ท่อทองการเจริญ จำกัด",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#D4A574",
        fillOpacity: 1,
        strokeColor: "#1e3a8a",
        strokeWeight: 2,
      },
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-weight: bold;">บริษัท ท่อทองการเจริญ จำกัด</h3>
          <p style="margin: 4px 0; font-size: 12px;">บริการลอกท่อระบายน้ำและรับเหมาทั่วไป</p>
          <p style="margin: 4px 0; font-size: 12px;">📍 กรุงเทพมหานคร</p>
          <p style="margin: 4px 0; font-size: 12px;">📞 โทรศัพท์: 02-XXXX-XXXX</p>
        </div>
      `,
    });

    const marker = new google.maps.Marker({
      position: companyLocation,
      map: mapInstanceRef.current,
      title: "บริษัท ท่อทองการเจริญ จำกัด",
    });

    marker.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    // Open info window by default
    infoWindow.open(mapInstanceRef.current, marker);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-border"
          style={{ minHeight: "400px" }}
        />

        {showInfo && (
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-secondary text-sm">ที่อยู่</p>
                <p className="text-sm text-muted-foreground">
                  กรุงเทพมหานคร ประเทศไทย
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-secondary text-sm">โทรศัพท์</p>
                <p className="text-sm text-muted-foreground">
                  <a href="tel:0212345678" className="hover:text-primary">
                    02-1234-5678
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-secondary text-sm">อีเมล</p>
                <p className="text-sm text-muted-foreground">
                  <a href="mailto:info@example.com" className="hover:text-primary">
                    info@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
