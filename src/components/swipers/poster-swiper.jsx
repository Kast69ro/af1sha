import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { Box, ButtonBase, Typography } from "@mui/material";

export default function PosterSwiper({
  category,
  title,
  onLocationClick,
  slideWidth = 190,          // сделай чуть больше по умолчанию
}) {
  const locations = Array.isArray(category?.locations) ? category.locations : [];
  const header = title || category?.categoryName || "";

  return (
    <Box sx={{ width: "100%" }}>
      {header && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, px: 2 }}>
          {header}
        </Typography>
      )}

      <Swiper
        modules={[FreeMode]}
        spaceBetween={16}
        slidesPerView="auto"
        freeMode
        className="poster-swiper"
        style={{ paddingLeft: 16, paddingRight: 16 }}
      >
        {locations.map((loc) => (
          <SwiperSlide key={loc.id} style={{ width: slideWidth }}>
            <ButtonBase
              onClick={() => onLocationClick?.(loc, category)}
              sx={{
                width: "100%",          // ✅ НЕ 140%
                display: "block",
                textAlign: "left",
                borderRadius: 2,
              }}
            >
              {/* Image */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 200,          // ✅ фикс высота, чтобы тексту было место
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: 1,
                  bgcolor: "grey.100",
                }}
              >
                <Box
                  component="img"
                  src={loc.logo || "/placeholder.svg"}
                  alt={loc.name || "Location"}
                  loading="lazy"
                  decoding="async"
                  sx={{
                    width: "100%",       // ✅ заполняем контейнер
                    height: "100%",
                    objectFit: "cover",  // ✅ красиво обрезает
                    display: "block",
                    transition: "transform 200ms ease",
                    ".MuiButtonBase-root:hover &": { transform: "scale(1.05)" },
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {loc.name}
              </Typography>

              {/* Address */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,   // ✅ максимум 2 строки, иначе будет “вылезать”
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {loc.address}
              </Typography>
            </ButtonBase>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}