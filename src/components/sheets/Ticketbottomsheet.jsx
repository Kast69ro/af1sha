// components/TicketBottomSheet.jsx
//
// Bottom sheet used for events without a hall map (museums, exhibitions, entry tickets).
// When opened it fetches ticket data via fetchSeats and displays a counter for each type.
// The same component is now also reused by SessionBottomSheet for no-map events.
//
// Props:
//   open      — boolean
//   onClose   — () => void
//   session   — { sessionId, sessionTime, ... }
//   dateLabel — string "24 Июля, Пн"
//   onBuy     — ({ sessionId, tickets: [{ticketId, count, price, name, ticketType}], total }) => void

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, IconButton,
  Drawer, Button, CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import {
  fetchSeats, clearSeats,
  selectSeats, selectSeatsStatus, selectSeatsError,
} from "../../features/seats/seatsSlice";

const PALETTES = [
  { bg: "#dbeafe", color: "#2563eb" },
  { bg: "#fef3c7", color: "#d97706" },
  { bg: "#dcfce7", color: "#16a34a" },
  { bg: "#fce7f3", color: "#db2777" },
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#ffedd5", color: "#ea580c" },
];

const MAX_TICKETS = 10;

export default function TicketBottomSheet({ open, onClose, session, dateLabel, onBuy }) {
  const dispatch   = useDispatch();
  const seatsData  = useSelector(selectSeats);
  const status     = useSelector(selectSeatsStatus);
  const error      = useSelector(selectSeatsError);

  const [counts, setCounts] = useState({}); // { [ticketId]: number }

  // Загружаем данные когда открывается шторка
  useEffect(() => {
    if (!open || !session?.sessionId) return;
    setCounts({});
    dispatch(fetchSeats({ sessionId: session.sessionId }));
    return () => { dispatch(clearSeats()); };
  }, [open, session?.sessionId, dispatch]);

  // Инициализируем счётчики когда пришли данные
  useEffect(() => {
    if (!seatsData?.seatTypePrice) return;
    const init = {};
    seatsData.seatTypePrice.forEach((t) => { init[t.ticketId] = 0; });
    setCounts(init);
  }, [seatsData]);

  const tickets = seatsData?.seatTypePrice ?? [];

  const totalSelected = Object.values(counts).reduce((s, c) => s + c, 0);
  const totalPrice    = tickets.reduce(
    (s, t) => s + (counts[t.ticketId] || 0) * parseFloat(t.price || 0), 0
  );

  const changeCount = (ticketId, delta) => {
    setCounts((prev) => {
      const next = (prev[ticketId] || 0) + delta;
      if (next < 0) return prev;
      if (delta > 0 && totalSelected >= MAX_TICKETS) return prev;
      return { ...prev, [ticketId]: next };
    });
  };

  const handleBuy = () => {
    const selected = tickets
      .filter((t) => (counts[t.ticketId] || 0) > 0)
      .map((t) => ({
        ticketId:   t.ticketId,
        count:      counts[t.ticketId],
        price:      parseFloat(t.price),
        name:       t.name,
        ticketType: t.ticketType,
      }));
    onBuy({ sessionId: session.sessionId, tickets: selected, total: totalPrice });
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
          maxHeight: "85vh",
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#e0e0e0" }} />
      </Box>

      {/* Шапка */}
      <Box sx={{ px: 2, pt: 1, pb: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
        <IconButton size="small" onClick={onClose} sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#ebebeb" } }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#111", lineHeight: 1.2 }}>
            Выберите билеты
          </Typography>
          {dateLabel && session?.sessionTime && (
            <Typography sx={{ fontSize: 13, color: "#888", mt: 0.2 }}>
              {dateLabel} · {session.sessionTime}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Контент */}
      <Box sx={{ overflowY: "auto", flex: 1, px: 2, py: 2 }}>

        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {status === "failed" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "error.main", fontSize: 14, mb: 1 }}>{error}</Typography>
            <Typography
              onClick={() => dispatch(fetchSeats({ sessionId: session.sessionId }))}
              sx={{ color: "primary.main", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Повторить
            </Typography>
          </Box>
        )}

        {status === "succeeded" && tickets.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#999", fontSize: 14 }}>Билеты недоступны</Typography>
          </Box>
        )}

        {status === "succeeded" && tickets.map((ticket, idx) => {
          const palette = PALETTES[idx % PALETTES.length];
          const Icon    = ticket.ticketType === "CHILD" ? ChildCareIcon : PersonIcon;
          const count   = counts[ticket.ticketId] || 0;

          // use index in key in case backend sends multiple items with the same ticketId
          return (
            <Box
              key={`${ticket.ticketId}-${idx}`}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                p: 2, mb: 1.5,
                border: "1.5px solid",
                borderColor: count > 0 ? "primary.main" : "#e5e7eb",
                borderRadius: 3,
                bgcolor: count > 0 ? "#f0f6ff" : "#fff",
                transition: "all 0.15s",    
              }}
            >
              {/* Иконка + название */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: "11px", flexShrink: 0, bgcolor: palette.bg, display: "flex", alignItems: "center", justifyContent: "center", color: palette.color }}>
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.3 }} noWrap>
                    {ticket.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "primary.main", mt: 0.2 }}>
                    {ticket.price} {ticket.currencyCode}
                  </Typography>
                </Box>
              </Box>

              {/* Счётчик */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => changeCount(ticket.ticketId, -1)}
                  disabled={count === 0}
                  sx={{
                    width: 32, height: 32,
                    bgcolor: count > 0 ? "primary.main" : "#f0f0f0",
                    color: count > 0 ? "#fff" : "#999",
                    "&:hover": { bgcolor: count > 0 ? "primary.dark" : "#e0e0e0" },
                    "&.Mui-disabled": { bgcolor: "#f0f0f0", color: "#ccc" },
                  }}
                >
                  <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>−</Typography>
                </IconButton>

                <Typography sx={{ fontSize: 17, fontWeight: 800, minWidth: 24, textAlign: "center", color: count > 0 ? "primary.main" : "#111" }}>
                  {count}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => changeCount(ticket.ticketId, 1)}
                  disabled={totalSelected >= MAX_TICKETS}
                  sx={{
                    width: 32, height: 32,
                    bgcolor: "#f0f0f0",
                    "&:hover": { bgcolor: "#e0e0e0" },
                    "&.Mui-disabled": { bgcolor: "#f0f0f0", color: "#ccc" },
                  }}
                >
                  <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>+</Typography>
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Итого + кнопка */}
      {totalSelected > 0 && (
        <Box sx={{ px: 2, py: 2, borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
              {totalPrice.toFixed(2)} TJS
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#999" }}>
              За {totalSelected} {totalSelected === 1 ? "билет" : "билетов"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleBuy}
            sx={{ fontWeight: 800, fontSize: 16, px: 4, py: 1.5, borderRadius: 3, textTransform: "none", boxShadow: "0 4px 14px rgba(25,118,210,0.35)" }}
          >
            Купить
          </Button>
        </Box>
      )}
    </Drawer>
  );
}