import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";

import DateSwiper from "../../components/swipers/date-swiper.jsx";
import MovieCard from "../../components/cards/movie-card.jsx";

import { selectCategories } from "../../features/categories/categoriesSlice";
import {
  fetchEvents,
  selectEventsItems,
  selectEventsStatus,
} from "../../features/catalog/catalogSlice";

export default function CatalogScreen({ onMovieClick }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const dispatch = useDispatch();

  const categories     = useSelector(selectCategories);
  const eventsResponse = useSelector(selectEventsItems);
  const eventsStatus   = useSelector(selectEventsStatus);

  const [activeTab, setActiveTab]     = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(categoryId)),
    [categories, categoryId]
  );

  const toYMDLocal = (d) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const today = new Date();
    if (tab === "today") {
      setSelectedDate(toYMDLocal(today));
    } else if (tab === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      setSelectedDate(toYMDLocal(tomorrow));
    } else {
      setSelectedDate("");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setActiveTab("pick");
  };

  useEffect(() => {
    if (!categoryId) return;
    const payload = { categoryId: String(categoryId), lang: "ru" };
    if (selectedDate) payload.dateValue = selectedDate;
    dispatch(fetchEvents(payload));
  }, [dispatch, categoryId, selectedDate]);

  const items = useMemo(() => {
    const arr = Array.isArray(eventsResponse) ? eventsResponse : [];
    return arr.flatMap((x) => x?.events ?? []);
  }, [eventsResponse]);

  const mappedItems = useMemo(() => {
    return items.map((e) => ({
      id:          e.eventId ?? e.id ?? `${e.title}-${e.poster ?? ""}`,
      title:       e.eventName ?? e.title ?? "",
      poster:      e.poster ?? "",
      genre:       e.genre ?? "",
      ageRating:   e.ageLimit ?? e.ageRating ?? "",
      description: e.description ?? "",
      _raw:        e,
    }));
  }, [items]);

  const getChipStyles = (tab) => ({
    borderRadius: 999,
    fontWeight: 600,
    whiteSpace: "nowrap",
    ...(activeTab === tab
      ? { backgroundColor: "#E31E24", color: "#fff", "&:hover": { backgroundColor: "#c81b20" } }
      : {}),
  });

  const loading = eventsStatus === "loading" || eventsStatus === "idle";

  // ── Фильтры (sticky под AppLayout) ───────────────────────────────────────
  const FiltersBar = (
    <Box sx={{
      position: "sticky",
      top: 0,        // прилипает прямо под шапкой AppLayout (она sticky)
      zIndex: 40,
      bgcolor: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid #eee",
      px: 2,
      pt: 1,
      pb: activeTab === "pick" ? 0 : 1.5,
    }}>
      <Box sx={{ display: "flex", gap: 1, overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" } }}>
        {["all", "today", "tomorrow", "pick"].map((tab) => (
          <Chip
            key={tab}
            label={tab === "all" ? "Все" : tab === "today" ? "Сегодня" : tab === "tomorrow" ? "Завтра" : "Дата"}
            clickable
            onClick={() => handleTabChange(tab)}
            variant={activeTab === tab ? "filled" : "outlined"}
            sx={getChipStyles(tab)}
          />
        ))}
      </Box>

      {activeTab === "pick" && (
        <Box sx={{ pb: 1.5, mt: 1 }}>
          <DateSwiper
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </Box>
      )}
    </Box>
  );

  // ── Скелетон ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#fafafa", pb: 4 }}>
        {FiltersBar}
        <Box sx={{ px: 2, py: 2, display: "grid", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={192} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  // ── Контент ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f5f5f5", pb: 4 }}>
      {FiltersBar}

      <Box sx={{ px: 2, pt: 2, display: "grid", gap: 2 }}>
        {mappedItems.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            onMovieClick={() => onMovieClick?.(m)}
            onShowSessions={() => onMovieClick?.(m)}
          />
        ))}

        {mappedItems.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: "#777" }}>
            Нет мероприятий{selectedDate ? <> на <b>{selectedDate}</b></> : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}