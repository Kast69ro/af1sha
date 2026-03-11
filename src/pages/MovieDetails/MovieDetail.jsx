import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Skeleton,
  CardMedia,
  Button,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import StarIcon from "@mui/icons-material/Star";

import {
  fetchEventDetails,
  clearEventDetails,
  selectEventDetails,
  selectEventDetailsStatus,
  selectEventDetailsError,
} from "../../features/detail/detailSlice.js";
import SessionBottomSheet from "../../components/sheets/SessionBottomSheet.jsx";

export default function MovieDetailsScreen() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const movie = useSelector(selectEventDetails);
  const status = useSelector(selectEventDetailsStatus);
  const error = useSelector(selectEventDetailsError);

  console.log(movie);
  

  const [sheetOpen, setSheetOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    dispatch(fetchEventDetails({ eventId }));
    return () => dispatch(clearEventDetails());
  }, [dispatch, eventId]);

  // ✅ getEventDetails возвращает: title, poster, persons[], session_dates[]
  const posterSrc = (movie?.poster || "").trim() || "/placeholder.svg";
  const title = movie?.title || "—";

  const rating =
    Number(movie?.ratingImdb) > 0
      ? movie.ratingImdb
      : Number(movie?.ratingKp) > 0
        ? movie.ratingKp
        : null;

  const duration = movie?.duration;
  const year = movie?.releaseYear;
  const ageRating = movie?.ageLimit;
  const originalName = movie?.originalName;
  const country = movie?.country;

  const genres =
    typeof movie?.genre === "string" && movie.genre
      ? movie.genre
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

  // ✅ persons[] — актёры, режиссёры с фото
  const persons = Array.isArray(movie?.persons) ? movie.persons : [];
  const directors = persons.filter((p) => p.personType === "director");
  const actors = persons.filter((p) => p.personType === "actor");
  const crew = [...directors, ...actors];

  // ✅ session_dates[] — сеансы по датам и локациям
  const sessionDates = Array.isArray(movie?.session_dates)
    ? movie.session_dates
    : [];

  // Сеансы для выбранной даты
  const sessionsForDate = sessionDates
    .filter((d) => d.dateValue === selectedDate)
    .flatMap((d) => d.locations ?? []);

  const descText = String(movie?.description || "").trim();

  const formatDuration = (minutes) => {
    const n = Number(minutes);
    if (!Number.isFinite(n) || n <= 0) return "";
    const h = Math.floor(n / 60);
    const m = n % 60;
    if (!h) return `${m} мин`;
    if (!m) return `${h} ч`;
    return `${h} ч ${m} мин`;
  };

  const isLoading = status === "loading" || status === "idle";

  // ── SKELETON ──
  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fff", pb: 12 }}>
        <Skeleton variant="rectangular" height={320} />
        <Box
          sx={{
            px: 2,
            py: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Skeleton variant="text" height={36} width={220} />
          <Stack direction="row" spacing={1}>
            {[80, 60, 70].map((w, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={w}
                height={28}
                sx={{ borderRadius: 10 }}
              />
            ))}
          </Stack>
          <Skeleton variant="text" height={100} />
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: 3 }} />
        </Box>
      </Box>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: "#fff", minHeight: "100vh" }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography color="error" sx={{ mt: 2 }}>
          {String(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      {/* ── HERO IMAGE ── */}
      <Box sx={{ position: "relative", height: 420 }}>
        <CardMedia
          component="img"
          src={posterSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
          onError={(e) => {
            if (!e.currentTarget.src.includes("placeholder.svg"))
              e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Градиент снизу */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
          }}
        />

        {/* Кнопка назад */}
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Назад"
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            bgcolor: "rgba(255,255,255,0.9)",
            border: "1px solid #e0e0e0",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── КОНТЕНТ ── */}
      <Box
        sx={{
          px: 2,
          mt: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          pb: 7,
        }} // ← сюда
      >
        {/* Название */}
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 800,
            color: "#111",
            mb: 0.5,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        {/* Жанры */}
        {genres.length > 0 && (
          <Typography sx={{ fontSize: 14, color: "#888", mb: 1.5 }}>
            {genres.join(", ")}
          </Typography>
        )}

        {/* Чипы: возраст, длительность, год, рейтинг */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2.5, flexWrap: "wrap", gap: 1, justifyContent: "center" }}
        >
          {ageRating && (
            <Chip
              label={ageRating}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}
            />
          )}
          {duration && (
            <Chip
              label={formatDuration(duration)}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}
            />
          )}

          {rating && Number(rating) > 0 && (
            <Chip
              icon={
                <StarIcon sx={{ fontSize: 14, color: "#f59e0b !important" }} />
              }
              label={String(rating)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, borderColor: "#f59e0b", color: "#f59e0b" }}
            />
          )}
        </Stack>

        {/* Описание с «Ещё / Свернуть» */}
        {descText &&
          (() => {
            const words = descText.split(" ");
            const LIMIT = 50;
            const isLong = words.length > LIMIT;
            const visibleDesc =
              descExpanded || !isLong
                ? descText
                : words.slice(0, LIMIT).join(" ") + "...";

            return (
              <Typography
                sx={{ fontSize: 14, color: "#444", mb: 2.5, lineHeight: 1.7 }}
              >
                {visibleDesc}
                {isLong && (
                  <Box
                    component="span"
                    onClick={() => setDescExpanded((prev) => !prev)}
                    sx={{
                      color: "#1976d2",
                      fontWeight: 600,
                      cursor: "pointer",
                      ml: 0.5,
                    }}
                  >
                    {descExpanded ? " Свернуть" : " Ещё"}
                  </Box>
                )}
              </Typography>
            );
          })()}

        {/* ── ИНФОРМАЦИЯ ── */}
        {(country || year || originalName) && (
          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "#111", mb: 1.5 }}
            >
              Информация
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              {country && (
                <Box>
                  <Typography sx={{ fontSize: 13, color: "#999", mb: 0.2 }}>
                    Страна
                  </Typography>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 600, color: "#111" }}
                  >
                    {country}
                  </Typography>
                </Box>
              )}
              {year && (
                <Box>
                  <Typography sx={{ fontSize: 13, color: "#999", mb: 0.2 }}>
                    Год выпуска
                  </Typography>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 600, color: "#111" }}
                  >
                    {year}
                  </Typography>
                </Box>
              )}
              {originalName && (
                <Box>
                  <Typography sx={{ fontSize: 13, color: "#999", mb: 0.2 }}>
                    Оригинальное название
                  </Typography>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 600, color: "#111" }}
                  >
                    {originalName}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* ── РЕЖИССЁР И АКТЁРЫ ── */}
        {crew.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "#111", mb: 1.5 }}
            >
              Режиссёр и актёры
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {crew.map((person, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 80,
                  }}
                >
                  <Box
                    sx={{
                      width: 85,
                      height: 80,
                      borderRadius: "50%",
                      overflow: "hidden",
                      bgcolor: "#f0f0f0",
                      border: "2px solid #eee",
                      mb: 0.75,
                      flexShrink: 0,
                    }}
                  >
                    {person.photo ? (
                      <Box
                        component="img"
                        src={person.photo}
                        alt={person.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                        }}
                      >
                        👤
                      </Box>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#111",
                      textAlign: "center",
                      lineHeight: 1.3,
                      maxWidth: 80,
                    }}
                  >
                    {person.name || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#999", mt: 0.2 }}>
                    {person.personTypeName || "Актер"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── ТРЕЙЛЕР ── */}
        {movie?.trailer && (
          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "#111", mb: 1.5 }}
            >
              Трейлер
            </Typography>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%", // 16:9
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#000",
              }}
            >
              <Box
                component="iframe"
                src={
                  movie.trailer.includes("watch?v=")
                    ? movie.trailer.replace("watch?v=", "embed/") // ✅ конвертим обычную ссылку в embed
                    : movie.trailer
                }
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* ── КНОПКА СНИЗУ ── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          px: 3,
          py: 1,
          background: "linear-gradient(to top, #fff 70%, transparent)",
          zIndex: 100,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => setSheetOpen(true)}
          sx={{
            fontWeight: 800,
            fontSize: 16,
            py: 1.6,
            borderRadius: 3,
            textTransform: "none",
          }}
        >
          Перейти к расписанию
        </Button>
      </Box>
      <SessionBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        movieTitle={title}
      />
    </Box>
  );
}
