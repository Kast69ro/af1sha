import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import "swiper/css";
import "swiper/css/free-mode";

function generateDates() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    dates.push({
      date: d.toISOString().slice(0, 10),
      dayName:
        i === 0
          ? "Сегодня"
          : i === 1
          ? "Завтра"
          : d.toLocaleDateString("ru-RU", { weekday: "short" }),
      dayNumber: String(d.getDate()),
      month: d.toLocaleDateString("ru-RU", { month: "short" }),
    });
  }

  return dates;
}

export default function DateSwiper({ selectedDate, onDateSelect }) {
  const dates = useMemo(() => generateDates(), []);

  return (
    <Box sx={{ width: "100%" }}>
      <Swiper
        modules={[FreeMode]}
        spaceBetween={8}
        slidesPerView="auto"
        freeMode
        style={{ paddingLeft: 16, paddingRight: 16 }}
      >
        {dates.map((item) => {
          const active = selectedDate === item.date;

          return (
            <SwiperSlide key={item.date} style={{ width: "auto" }}>
              <ButtonBase
                onClick={() => onDateSelect?.(item.date)}
                sx={{
                  minWidth: 70,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid",
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "primary.main" : "background.paper",
                  color: active ? "primary.contrastText" : "text.primary",
                  transition: "0.2s",
                  "&:hover": {
                    bgcolor: active ? "primary.main" : "action.hover",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, lineHeight: 1.2, textTransform: "capitalize" }}
                >
                  {item.dayName}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {item.dayNumber}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ opacity: 0.75, lineHeight: 1.2, textTransform: "capitalize" }}
                >
                  {item.month}
                </Typography>
              </ButtonBase>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );
}