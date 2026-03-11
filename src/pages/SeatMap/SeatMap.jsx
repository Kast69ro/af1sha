import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Slide,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";

import {
  fetchSeats,
  selectSeats,
  selectSeatsStatus,
} from "../../features/seats/seatsSlice";

// ─── SeatIcon ────────────────────────────────────────────────
function SeatIcon({ color, size = 26 }) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 26 23" fill="none">
      <rect x="2" y="0" width="22" height="8" rx="3" fill={color} />
      <rect x="0" y="8" width="26" height="11" rx="3" fill={color} />
      <rect x="0" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="22" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="4" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
      <rect x="18" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── Color map ───────────────────────────────────────────────
function buildColorMap(seatTypePrice = []) {
  const FALLBACK = { STANDARD: "#f59e0b", VIP: "#a855f7", COMFORT: "#38bdf8" };
  const PALETTE  = ["#f59e0b", "#a855f7", "#38bdf8", "#fb7185", "#34d399"];
  const map = {};
  seatTypePrice.forEach((item, i) => {
    if (!map[item.seatType]) {
      map[item.seatType] = FALLBACK[item.seatType] || PALETTE[i % PALETTE.length];
    }
  });
  return map;
}

// ─── BottomSheet через createPortal (без MUI Drawer) ─────────
function TicketBottomSheet({ seat, tickets, onSelect, onClose }) {
  if (!seat) return null;

  const relevantTickets = tickets.filter(
    (t) => !t.seatType || t.seatType === seat.seatType
  );

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 9998,
          animation: "bsFadeIn 0.2s ease",
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0,
        left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "#fff",
        borderRadius: "20px 20px 0 0",
        zIndex: 9999,
        padding: "0 16px calc(24px + env(safe-area-inset-bottom, 0px))",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        animation: "bsSlideUp 0.28s cubic-bezier(0.32,0.72,0,1)",
      }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "12px auto 16px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
            Выберите тип билета
          </span>
          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", cursor: "pointer",
            width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280",
          }}>
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Информация о месте */}
        <div style={{
          background: "#f9fafb", borderRadius: 12,
          padding: "12px 16px", display: "flex", gap: 20,
          marginBottom: 16, alignItems: "center",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>РЯД</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>{seat.rowNum}</div>
          </div>
          <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>МЕСТО</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>{seat.place}</div>
          </div>
          {seat.sector && (
            <>
              <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>СЕКТОР</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>{seat.sector}</div>
              </div>
            </>
          )}
        </div>

        {/* Карточки билетов */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {relevantTickets.map((ticket) => {
            const isChild = ticket.ticketType === "CHILD";
            return (
              <button
                key={ticket.ticketId}
                onClick={() => onSelect(seat, ticket)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px",
                  border: "1.5px solid #e5e7eb", borderRadius: 14,
                  cursor: "pointer", background: "#fff", width: "100%",
                  fontFamily: "inherit",
                }}
                onPointerEnter={(e) => {
                  e.currentTarget.style.borderColor = "#22c55e";
                  e.currentTarget.style.background = "#f0fdf4";
                }}
                onPointerLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: isChild ? "#fef3c7" : "#dbeafe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isChild ? "#d97706" : "#2563eb",
                  }}>
                    {isChild
                      ? <ChildCareIcon style={{ fontSize: 22 }} />
                      : <PersonIcon style={{ fontSize: 22 }} />
                    }
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{ticket.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {isChild ? "До 12 лет" : "Взрослый"}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#111827", flexShrink: 0 }}>
                  {ticket.price}
                  <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginLeft: 4 }}>
                    {ticket.currencyCode}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bsFadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bsSlideUp  {
          from { transform: translateX(-50%) translateY(100%) }
          to   { transform: translateX(-50%) translateY(0) }
        }
      `}</style>
    </>,
    document.body
  );
}

// ─── Seat ────────────────────────────────────────────────────
function Seat({ seat, isSelected, selectedTicketType, onToggle, onDeselect, colorMap }) {
  const booked = seat.bookedSeats === "1";
  const isVip  = seat.seatType === "VIP";

  const color = booked ? "#d1d5db" : isSelected ? "#22c55e" : (colorMap[seat.seatType] || "#f59e0b");
  const iconSize = isVip ? 28 : 24;

  return (
    <Box
      onClick={() => { if (booked) return; isSelected ? onDeselect(seat) : onToggle(seat); }}
      title={booked ? "Занято" : seat.objectDescription}
      sx={{ cursor: booked ? "default" : "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {booked ? (
        <Box sx={{ width: 22, height: 19, bgcolor: "#e5e7eb", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>
          ✕
        </Box>
      ) : (
        <Box sx={{ transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.1s" }}>
          <SeatIcon color={color} size={iconSize} />
        </Box>
      )}
      {isSelected && !booked && (
        <Box sx={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
          bgcolor: "#22c55e", color: "#fff", fontSize: 8, fontWeight: 700,
          borderRadius: "3px", px: "3px", py: "1px", whiteSpace: "nowrap", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.3,
        }}>
          <span>{seat.place}</span>
          {selectedTicketType && (
            <span style={{ fontSize: 7 }}>{selectedTicketType === "CHILD" ? "Дет" : "Взр"}</span>
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── Row ─────────────────────────────────────────────────────
function Row({ rowNum, seats, selectedSeats, onToggle, onDeselect, colorMap, isVip, isDense }) {
  const gap    = isDense ? (isVip ? "10px" : "6px") : (isVip ? "6px" : "3px");
  const rowGap = isDense ? "6px" : (isVip ? "4px" : "2px");
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: rowGap }}>
      <Box sx={{ display: "flex", gap, alignItems: "center" }}>
        {seats.map((seat) => {
          const sel = selectedSeats.find((s) => s.seatId === seat.seatId);
          return (
            <Seat key={seat.seatId} seat={seat} isSelected={!!sel}
              selectedTicketType={sel?.ticketType ?? null}
              onToggle={onToggle} onDeselect={onDeselect} colorMap={colorMap}
            />
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Main ────────────────────────────────────────────────────
export { TicketBottomSheet };

export default function SeatMap({ sessions = [], eventName = "", eventDate = "", onBack, onBuy }) {
  const dispatch  = useDispatch();
  const seatsData = useSelector(selectSeats);
  const status    = useSelector(selectSeatsStatus);

  const [selectedSession, setSelectedSession] = useState(sessions[0]?.sessionId ?? null);
  const [selectedSeats, setSelectedSeats]     = useState([]);
  const [drawerSeat, setDrawerSeat]           = useState(null);

  useEffect(() => {
    if (!selectedSession) return;
    setSelectedSeats([]);
    dispatch(fetchSeats({ sessionId: selectedSession }));
  }, [selectedSession, dispatch]);

  const seatTypePrice = seatsData?.seatTypePrice ?? [];
  const hallName      = seatsData?.hallName ?? "";

  const allSeats = useMemo(
    () => (seatsData?.seats ?? []).filter((s) => s.objectType === "seat" && s.rowNum !== ""),
    [seatsData]
  );

  const colorMap = useMemo(() => buildColorMap(seatTypePrice), [seatTypePrice]);

  const rowsMap = useMemo(() => {
    const m = new Map();
    allSeats.forEach((s) => { if (!m.has(s.rowNum)) m.set(s.rowNum, []); m.get(s.rowNum).push(s); });
    m.forEach((v, k) => m.set(k, v.sort((a, b) => Number(a.place) - Number(b.place))));
    return m;
  }, [allSeats]);

  const rowKeys  = useMemo(() => Array.from(rowsMap.keys()).sort((a, b) => Number(a) - Number(b)), [rowsMap]);
  const freeCount = allSeats.filter((s) => s.bookedSeats === "0").length;
  const isDense   = allSeats.length > 100;

  // Легенда — дедупликация по seatType, key уникален
  const legend = useMemo(() => {
    const seen = new Set();
    return seatTypePrice.filter((t) => { if (seen.has(t.seatType)) return false; seen.add(t.seatType); return true; })
      .map((t) => ({ seatType: t.seatType, color: colorMap[t.seatType], name: t.name }));
  }, [seatTypePrice, colorMap]);

  const handleDeselect = (seat) => setSelectedSeats((p) => p.filter((s) => s.seatId !== seat.seatId));

  const handleTicketSelect = (seat, ticket) => {
    const entry = { ...seat, ticketId: ticket.ticketId, ticketType: ticket.ticketType, ticketName: ticket.name, price: parseFloat(ticket.price) || 0 };
    setSelectedSeats((p) => p.find((s) => s.seatId === seat.seatId) ? p.map((s) => s.seatId === seat.seatId ? entry : s) : [...p, entry]);
    setDrawerSeat(null);
  };

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", maxWidth: 480, mx: "auto", pb: selectedSeats.length > 0 ? "130px" : "20px" }}>

      {/* Шапка */}
      <Paper square elevation={0} sx={{ bgcolor: "#111827", color: "#fff", px: 2, pt: 2, pb: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <IconButton sx={{ color: "#9ca3af", p: 0, mr: 1 }} onClick={onBack}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight={700} noWrap>{eventName}</Typography>
        </Box>
        <Typography variant="body2" color="#9ca3af" mb={2}>{eventDate}</Typography>
        <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {sessions.map((s) => {
            const active = selectedSession === s.sessionId;
            return (
              <Paper key={s.sessionId} onClick={() => setSelectedSession(s.sessionId)} elevation={0}
                sx={{ cursor: "pointer", bgcolor: active ? "primary.main" : "#374151", borderRadius: "10px", px: "18px", py: "8px", textAlign: "center", minWidth: 80, transition: "background 0.15s", "&:hover": { bgcolor: active ? "#16a34a" : "#4b5563" } }}>
                <Typography fontWeight={800} fontSize={20}>{s.time}</Typography>
                <Typography fontSize={12} sx={{ opacity: 0.8 }}>{s.mediaType}</Typography>
                <Typography fontSize={12} sx={{ color: active ? "rgba(255,255,255,0.8)" : "#9ca3af", mt: "4px" }}>от {s.minPrice} TJS</Typography>
              </Paper>
            );
          })}
        </Box>
      </Paper>

      {hallName && <Box sx={{ textAlign: "center", pt: "18px", pb: "8px" }}><Typography variant="h6" fontWeight={700}>{hallName}</Typography></Box>}

      {status === "loading" && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}

      {status === "succeeded" && seatsData && (
        <>
          {/* Легенда */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, px: 2, py: 1, flexWrap: "wrap" }}>
            {legend.map((item) => (
              <Chip key={item.seatType} size="small" label={item.name}
                icon={<Box sx={{ ml: "4px !important", display: "flex" }}><SeatIcon color={item.color} size={16} /></Box>}
                sx={{ bgcolor: "transparent", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 500 }}
              />
            ))}
            <Chip size="small" label="Занято"
              icon={<Box sx={{ width: 16, height: 14, bgcolor: "#e5e7eb", borderRadius: "2px", fontSize: 9, color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, ml: "4px !important" }}>✕</Box>}
              sx={{ bgcolor: "transparent", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 500 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center" mb="12px">Осталось мест: {freeCount}</Typography>

          {/* Экран */}
          <Box sx={{ textAlign: "center", mx: "20px", mb: "8px" }}>
            <Box sx={{ height: 16, background: "linear-gradient(180deg,#374151 0%,#1f2937 100%)", borderRadius: "50% 50% 0 0/100% 100% 0 0", mb: "4px" }} />
            <Typography variant="caption" color="#9ca3af" letterSpacing={4} fontWeight={600}>ЭКРАН</Typography>
          </Box>

          {/* Ряды */}
          <Box sx={{ px: "4px", py: "8px", overflowX: "auto" }}>
            {rowKeys.map((rowNum) => {
              const seats = rowsMap.get(rowNum);
              return (
                <Row key={rowNum} rowNum={rowNum} seats={seats} selectedSeats={selectedSeats}
                  onToggle={(seat) => setDrawerSeat(seat)} onDeselect={handleDeselect}
                  colorMap={colorMap} isVip={seats[0]?.seatType === "VIP"} isDense={isDense}
                />
              );
            })}
          </Box>
        </>
      )}

      {/* BottomSheet */}
      {drawerSeat && (
        <TicketBottomSheet
          seat={drawerSeat}
          tickets={seatTypePrice}
          onSelect={handleTicketSelect}
          onClose={() => setDrawerSeat(null)}
        />
      )}

      {/* Панель покупки */}
      <Slide direction="up" in={selectedSeats.length > 0} mountOnEnter unmountOnExit>
        <Paper elevation={8} sx={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, bgcolor: "#1f2937", borderRadius: "16px 16px 0 0", px: "20px", pt: "16px", pb: "28px", display: "flex", flexDirection: "column", gap: 1, zIndex: 100 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {selectedSeats.map((s) => (
              <Chip key={s.seatId} size="small"
                label={`Р${s.rowNum} М${s.place} · ${s.ticketType === "CHILD" ? "Дет" : "Взр"} · ${s.price} TJS`}
                onDelete={() => handleDeselect(s)}
                sx={{ bgcolor: "#374151", color: "#fff", fontSize: 11, "& .MuiChip-deleteIcon": { color: "#9ca3af", "&:hover": { color: "#fff" } } }}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#fff">{total.toFixed(2)} TJS</Typography>
              <Typography variant="body2" color="#9ca3af">За {selectedSeats.length} {selectedSeats.length === 1 ? "билет" : "билетов"}</Typography>
            </Box>
            <Button variant="contained" color="primary" size="large"
              onClick={() => onBuy?.({ selectedSeats: selectedSeats.map((s) => ({ seatId: s.seatId, ticketId: s.ticketId })), total, sessionId: selectedSession })}
              sx={{ borderRadius: "12px", px: 4, py: "14px", fontSize: 16, fontWeight: 700, textTransform: "none", boxShadow: "none" }}>
              Купить
            </Button>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}