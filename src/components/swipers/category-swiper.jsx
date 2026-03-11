import { useMemo } from "react";
import { useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { Box, ButtonBase, Typography } from "@mui/material";

import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ForumIcon from "@mui/icons-material/Forum";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EventIcon from "@mui/icons-material/Event";

import { selectCategories } from "../../features/categories/categoriesSlice";

// нормализация строки
const norm = (s) => String(s ?? "").toLowerCase().trim();

// ✅ универсальный выбор иконки по названию
const pickIconByName = (name) => {
  const n = norm(name);

  if (n.includes("кино") || n.includes("film") || n.includes("movie")) return <MovieIcon fontSize="small" />;
  if (n.includes("конц") || n.includes("music") || n.includes("музык")) return <MusicNoteIcon fontSize="small" />;
  if (n.includes("театр") || n.includes("theater")) return <TheaterComedyIcon fontSize="small" />;
  if (n.includes("форум") || n.includes("discussion") || n.includes("чат")) return <ForumIcon fontSize="small" />;
  if (n.includes("дет") || n.includes("kids") || n.includes("child")) return <ChildCareIcon fontSize="small" />;
  if (n.includes("игр") || n.includes("game") || n.includes("esport")) return <SportsEsportsIcon fontSize="small" />;

  // дефолтная
  return <EventIcon fontSize="small" />;
};

export default function CategorySwiper({ onCategorySelect, selectedCategory }) {
  const categories = useSelector(selectCategories);

  const getLabel = (c) => c?.label ?? c?.categoryName ?? "Категория";

  

  return (
    <Box sx={{ width: "100%" }}>
      <Swiper
        modules={[FreeMode]}
        spaceBetween={12}
        slidesPerView="auto"
        freeMode
        style={{ paddingLeft: 16, paddingRight: 16 }}
      >
        {categories.map((category) => {
          const isActive = String(selectedCategory) === String(category.id);

          return (
            <SwiperSlide key={category.id} style={{ width: "auto" }}>
              <ButtonBase
                onClick={() => onCategorySelect?.(category.id)}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                  border: "1px solid",
                  borderColor: isActive ? "primary.main" : "divider",
                  bgcolor: isActive ? "primary.main" : "background.paper",
                  color: isActive ? "primary.contrastText" : "text.primary",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: isActive ? "primary.dark" : "action.hover" },
                }}
              >
               

                <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {getLabel(category)}
                </Typography>
              </ButtonBase>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );
}