import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";

export default function ReviewsSection() {
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery();

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">รีวิวจากลูกค้า</h2>
          <p className="text-muted-foreground text-lg">
            ความพึงพอใจของลูกค้าคือความสำเร็จของเรา
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">{getRatingStars(review.rating)}</div>
                <span className="text-sm font-semibold text-secondary">{review.rating}/5</span>
              </div>

              <h3 className="font-semibold text-secondary mb-2">{review.title}</h3>

              <p className="text-sm text-foreground mb-4 line-clamp-3">{review.content}</p>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium">— {review.customerName}</p>
                {review.serviceType && <p>{review.serviceType}</p>}
                {review.projectLocation && <p>{review.projectLocation}</p>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
