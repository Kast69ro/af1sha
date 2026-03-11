import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import HeroSwiper from "../../components/swipers/hero-swiper.jsx";
import CategorySwiper from "../../components/swipers/category-swiper.jsx";
import PosterSwiper from "../../components/swipers/poster-swiper.jsx";

import {
  fetchCategoriesAndLocations,
  selectCategories,
  selectCategoriesStatus,
} from "../../features/categories/categoriesSlice.js";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const categories = useSelector(selectCategories);
  const catStatus = useSelector(selectCategoriesStatus);

  useEffect(() => {
    if (catStatus === "idle") dispatch(fetchCategoriesAndLocations());
  }, [dispatch, catStatus]);

  const handleBannerClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const isCatsLoading = catStatus === "loading" || catStatus === "idle";

  return (
    <Box className="min-h-dvh bg-background pb-20">
      <Box className="space-y-6 py-4">
        {/* Categories */}
        {isCatsLoading ? (
          <Box className="flex gap-3 px-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" width={80} height={64} />
            ))}
          </Box>
        ) : (
          <CategorySwiper
            categories={categories}
            onCategorySelect={(categoryId) =>
              navigate(`/catalog/${categoryId}`)
            }
          />
        )}

        <HeroSwiper onBannerClick={handleBannerClick} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {categories.map((cat) => (
            <PosterSwiper
              key={cat.id}
              category={cat}
              onLocationClick={(loc) => console.log(loc)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}