import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";

import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";

import CategorySwiper from "../../components/swipers/category-swiper.jsx";
import {
  fetchCategoriesAndLocations,
  selectCategories,
  selectCategoriesStatus,
} from "../../features/categories/categoriesSlice.js";
import { fetchEvents } from "../../features/catalog/catalogSlice.js";

const norm = (s) => String(s ?? "").toLowerCase().trim();

export default function AppLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const categories = useSelector(selectCategories);
  const catStatus  = useSelector(selectCategoriesStatus);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchOpen, setSearchOpen]             = useState(false);
  const [searchValue, setSearchValue]           = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    if (catStatus === "idle") dispatch(fetchCategoriesAndLocations());
  }, [dispatch, catStatus]);

  useEffect(() => {
  if (categories.length === 0) return;

  const match = location.pathname.match(/\/catalog\/(\w+)/);
  const urlCategoryId = match?.[1];

  if (urlCategoryId) {
    setSelectedCategory(String(urlCategoryId));
    return;
  }

  // ── редиректим ТОЛЬКО если мы на "/" ──
  if (location.pathname !== "/") return;

  const kino = categories.find((c) => {
    const n = norm(c?.label ?? c?.categoryName ?? "");
    return n.includes("кино") || n.includes("film") || n.includes("movie");
  });
  const defaultId = String(kino?.id ?? categories[0]?.id);
  setSelectedCategory(defaultId);
  navigate(`/catalog/${defaultId}`, { replace: true });
}, [categories, location.pathname]);

  // Поиск с дебаунсом
  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => {
      const match = location.pathname.match(/\/catalog\/(\w+)/);
      const categoryId = match?.[1] ?? selectedCategory;
      dispatch(fetchEvents({ categoryId, eventName: searchValue, lang: "ru" }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchOpen = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchValue("");
    // Сбрасываем — грузим заново без фильтра
    const match = location.pathname.match(/\/catalog\/(\w+)/);
    const categoryId = match?.[1] ?? selectedCategory;
    dispatch(fetchEvents({ categoryId, lang: "ru" }));
  };

  const isLoading = catStatus === "loading" || catStatus === "idle";

  return (
    <Box sx={{
      minHeight: "100dvh",
      bgcolor: "background.default",
      maxWidth: 480,
      mx: "auto",
    }}>
      {/* ── Шапка ── */}
      <Box sx={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        bgcolor: "background.default",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        {/* Верхняя строка: заголовок / поиск */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          pt: 1,
          minHeight: 48,
        }}>
          {searchOpen ? (
            /* Строка поиска */
            <Box sx={{
              display: "flex", alignItems: "center",
              flex: 1, gap: 1,
              bgcolor: "#f3f4f6",
              borderRadius: 3, px: 1.5, py: 0.5,
            }}>
              <SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
              <InputBase
                inputRef={searchRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Поиск мероприятий..."
                sx={{ flex: 1, fontSize: 15 }}
              />
              <IconButton size="small" onClick={handleSearchClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: 20, pl: 1 }}>
                Афиша
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton onClick={() => navigate("/history")}>
                  <LocalActivityIcon sx={{ color: "#E31E24" }} />
                </IconButton>
                <IconButton onClick={handleSearchOpen}>
                  <SearchIcon sx={{ color: "#E31E24" }} />
                </IconButton>
              </Box>
            </>
          )}
        </Box>

        {/* Навигация по категориям */}
        {!searchOpen && (
          <Box sx={{ pt: 0.5, pb: 1 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", gap: 1.5, px: 2, overflow: "hidden" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rounded" width={80} height={64} sx={{ flexShrink: 0 }} />
                ))}
              </Box>
            ) : (
              <CategorySwiper
                selectedCategory={selectedCategory}
                onCategorySelect={(id) => {
                  setSelectedCategory(String(id));
                  setSearchValue("");
                  navigate(`/catalog/${id}`);
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Контент */}
      <Box sx={{ pb: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
}