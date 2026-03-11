import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Link } from "react-router-dom";

export default function MovieCard({ movie, onShowSessions, onMovieClick }) {
  const genres = String(movie?.genre ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Постер + инфо */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Poster */}
        <Box
          component="button"
          type="button"
          onClick={onMovieClick}
          sx={{
            flexShrink: 0,
            width: 96,
            aspectRatio: "2 / 3",
            borderRadius: 2,
            overflow: "hidden",
            border: 0,
            p: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <CardMedia
            component="img"
            src={movie?.poster || "/placeholder.svg"}
            alt={movie?.title || "Movie poster"}
            loading="lazy"
            decoding="async"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Box
              component="button"
              type="button"
              onClick={onMovieClick}
              sx={{ textAlign: "left", border: 0, p: 0, background: "transparent", cursor: "pointer", minWidth: 0 }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {movie?.title}
              </Typography>
            </Box>

            {movie?.ageRating ? (
              <Chip
                label={movie.ageRating}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 800, flexShrink: 0 }}
              />
            ) : null}
          </Box>

          {movie?.description ? (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: "text.secondary",
                lineHeight: 1.45,
                textAlign: "left",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {movie.description}
            </Typography>
          ) : null}

          {genres.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              {genres.slice(0, 3).map((g) => (
                <Chip key={g} label={g} size="small" variant="filled" />
              ))}
            </Stack>
          ) : null}
        </Box>
      </Box>

      {/* Кнопка */}
      <Link to={`/event/${movie.id}`} style={{ textDecoration: "none" }}>
        <Button
          fullWidth
          variant="contained"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, backgroundColor: "#E31E24" }}
        >
          <CalendarMonthIcon sx={{ mr: 1, fontSize: 16 }} />
          Посмотреть сеансы
        </Button>
      </Link>
    </Box>
  );
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eventName: PropTypes.string,
    poster: PropTypes.string,
    ageRating: PropTypes.string,
    genre: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onShowSessions: PropTypes.func.isRequired,
  onMovieClick: PropTypes.func.isRequired,
};