import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import Button from "@mui/material/Button";

import "swiper/css";
import "swiper/css/pagination";

/* ================= MOCK DATA ================= */
const heroBanners = [
  {
    id: "1",
    movieId: "1",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=400&fit=crop",
    title: "Dune: Part Three",
    subtitle: "The epic conclusion",
  },
  {
    id: "2",
    movieId: "8",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    title: "Eternal Light",
    subtitle: "A new adventure begins",
  },
  {
    id: "3",
    movieId: "4",
    image:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=400&fit=crop",
    title: "Shadow Protocol",
    subtitle: "Trust no one",
  },
];

/* ================= COMPONENT ================= */
export default function HeroSwiper({ onBannerClick }) {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="hero-swiper"
      >
        {heroBanners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="relative h-48 md:h-64 w-full rounded-2xl overflow-hidden mx-4"
              style={{ width: "calc(100% - 32px)" }}
            >
              <img
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {banner.title}
                </h3>

                <p className="text-sm text-white/80 mb-3">
                  {banner.subtitle}
                </p>

                <Button
                  variant="contained"
                  onClick={() => onBannerClick?.(banner.movieId)}
                  sx={{
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.5,
                    py: 1,
                  }}
                >
                  Buy tickets
                </Button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}