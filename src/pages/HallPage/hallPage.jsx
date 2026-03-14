import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSeats,
  clearSeats,
  selectSeats,
  selectSeatsStatus,
  selectSeatsError,
} from "../../features/seats/seatsSlice";
import { IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { TicketBottomSheet } from "../SeatMap/SeatMap";
import HallCanvas from "../../components/HallCanvas/HallCanvas";

const BRAND = {
  red:      "#E31E24",
  redDark:  "#c01a1f",
  white:    "#ffffff",
  bg:       "#f5f5f5",
  gray:     "#c5c6c6",
  textMain: "#000000",
  textSub:  "#6b7280",
  font:     "inherit",
};

const SEAT_COLORS = {
  STANDARD: "#f59e0b",
  COMFORT:  "#3b82f6",
  VIP:      "#a855f7",
  ECONOM:   "#10b981",
  DEFAULT:  "#f59e0b",
};

function getSeatColor(seatType) {
  if (!seatType) return SEAT_COLORS.DEFAULT;
  return SEAT_COLORS[seatType.toUpperCase()] ?? SEAT_COLORS.DEFAULT;
}

const MAX_TICKETS = 10;

function SeatIcon({ color, size = 16 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 26 23" fill="none">
      <rect x="2"  y="0"  width="22" height="8"  rx="3" fill={color} />
      <rect x="0"  y="8"  width="26" height="11" rx="3" fill={color} />
      <rect x="0"  y="10" width="4"  height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="22" y="10" width="4"  height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="4"  y="18" width="4"  height="5"  rx="1.5" fill={color} opacity="0.5" />
      <rect x="18" y="18" width="4"  height="5"  rx="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: "40px 16px" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 3 }}>
          {[...Array(14)].map((_, j) => (
            <div key={j} style={{ width: 18, height: 16, borderRadius: 3, background: BRAND.gray, animation: "pulse 1.5s infinite", animationDelay: `${(i + j) * 0.03}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Legend({ priceData }) {
  const seen   = new Set();
  const unique = priceData.filter((p) => {
    const k = p.seatType?.toUpperCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 16px 4px", flexWrap: "wrap" }}>
      {unique.map((p) => (
        <div key={p.seatType} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <SeatIcon color={getSeatColor(p.seatType)} size={16} />
          <span style={{ fontSize: 12, color: BRAND.textMain, fontWeight: 500 }}>{p.name}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 13, background: "#e5e7eb", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#9ca3af", fontWeight: 700 }}>✕</div>
        <span style={{ fontSize: 12, color: BRAND.textMain, fontWeight: 500 }}>Занято</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <SeatIcon color={BRAND.red} size={16} />
        <span style={{ fontSize: 12, color: BRAND.textMain, fontWeight: 500 }}>Выбрано</span>
      </div>
    </div>
  );
}

export default function HallPage() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const { movieTitle = "", sessionDate = "", locationName = "", sessions = [] } = state || {};

  const dispatch  = useDispatch();
  const seatsData = useSelector(selectSeats);
  const status    = useSelector(selectSeatsStatus);
  const error     = useSelector(selectSeatsError);

  const [activeSessionId, setActiveSessionId] = useState(sessionId);
  const [selectedSeats, setSelectedSeats]     = useState([]);
  const [limitWarning, setLimitWarning]       = useState(false);
  const [pendingSeat, setPendingSeat]         = useState(null);

  useEffect(() => {
    if (!activeSessionId) return;
    dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }));
    setSelectedSeats([]);
    return () => dispatch(clearSeats());
  }, [activeSessionId, dispatch]);

  const seats     = seatsData?.seats ?? [];
  const priceData = seatsData?.seatTypePrice ?? [];
  const hallName  = seatsData?.hallName ?? "";
  const mapWidth  = seatsData?.mapWidth ?? "1686";
  const mapHeight = seatsData?.mapHeight ?? "1084";

  const onlySeats    = seats.filter((s) => s.objectType === "seat" && s.left && s.top);
  const freeCount    = onlySeats.filter((s) => s.bookedSeats === "0").length;
  const limitReached = selectedSeats.length >= MAX_TICKETS;

  const handleSeatClick = useCallback((seat) => {
    if (limitReached) {
      setLimitWarning(true);
      setTimeout(() => setLimitWarning(false), 2500);
      return;
    }
    setPendingSeat(seat);
  }, [limitReached]);

  const handleDeselect = useCallback((seat) =>
    setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seat.seatId)), []);

  const handleTicketSelect = (seat, ticket) => {
    const entry = {
      ...seat,
      ticketId:   ticket.ticketId,
      ticketType: ticket.ticketType,
      ticketName: ticket.name,
      price:      parseFloat(ticket.price) || 0,
    };
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.seatId);
      return exists
        ? prev.map((s) => (s.seatId === seat.seatId ? entry : s))
        : [...prev, entry];
    });
    setPendingSeat(null);
  };

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleBuy = () =>
    navigate("/checkout", {
      state: {
        seatTicketArr: selectedSeats.map((s) => ({ seatId: s.seatId, ticketId: s.ticketId })),
        total,
        sessionId: activeSessionId,
      },
    });

  return (
    <div style={{ minHeight: "100vh", fontFamily: BRAND.font, maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: selectedSeats.length > 0 ? 120 : 20 }}>
      <style>{`
        @keyframes slideUp    { from{transform:translateX(-50%) translateY(100%)} to{transform:translateX(-50%) translateY(0)} }
        @keyframes fadeInDown { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .buy-btn:hover   { background: ${BRAND.redDark} !important; }
        .retry-btn:hover { color: ${BRAND.redDark} !important; }
      `}</style>

      {limitWarning && (
        <div style={{ position: "fixed", top: 16, left: "50%", background: BRAND.textMain, color: BRAND.white, borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", animation: "fadeInDown 0.2s ease", whiteSpace: "nowrap" }}>
          Максимум {MAX_TICKETS} билетов за один раз
        </div>
      )}

      {/* Шапка */}
      <div style={{ background: BRAND.white, padding: "16px 16px 20px", borderBottom: `3px solid ${BRAND.red}` }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ position: "absolute", top: 14, left: 14, bgcolor: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", "&:hover": { bgcolor: "#fff" } }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 18, color: BRAND.textMain, paddingLeft: 44 }}>{movieTitle}</div>
        </div>
        <div style={{ color: BRAND.textSub, fontSize: 14, marginBottom: sessions.length ? 16 : 0 }}>{sessionDate}</div>
        {sessions.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sessions.map((s) => {
              const active = activeSessionId === s.sessionId;
              return (
                <div
                  key={s.sessionId}
                  onClick={() => { setActiveSessionId(s.sessionId); setSelectedSeats([]); }}
                  style={{ cursor: "pointer", background: active ? BRAND.red : BRAND.bg, border: `2px solid ${active ? BRAND.red : BRAND.gray}`, borderRadius: 10, padding: "8px 16px", textAlign: "center", minWidth: 76, transition: "background 0.15s" }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18, color: active ? BRAND.white : BRAND.textMain }}>{s.sessionTime}</div>
                  <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.85)" : BRAND.textSub }}>{s.mediaType}</div>
                  <div style={{ fontSize: 11, marginTop: 3, color: active ? "rgba(255,255,255,0.75)" : BRAND.gray }}>от {s.minPrice} {s.currencyCode}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Название зала */}
      <div style={{ textAlign: "center", padding: "14px 16px 6px", background: BRAND.white }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: BRAND.textMain }}>{locationName}</div>
        <div style={{ color: BRAND.textSub, fontSize: 13, marginTop: 2 }}>{hallName}</div>
      </div>

      {status === "loading" && <Skeleton />}

      {status === "failed" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: BRAND.red, fontSize: 14, marginBottom: 12 }}>{error}</div>
          <div
            className="retry-btn"
            onClick={() => dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }))}
            style={{ color: BRAND.red, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Повторить
          </div>
        </div>
      )}

      {status === "succeeded" && (
        <div style={{ background: BRAND.white, margin: "0 0 12px", borderRadius: "0 0 12px 12px" }}>
          <Legend priceData={priceData} />
          <div style={{ textAlign: "center", color: BRAND.textSub, fontSize: 12, marginBottom: 8 }}>
            Осталось мест: {freeCount}
            {limitReached && (
              <span style={{ color: BRAND.red, fontWeight: 600, marginLeft: 8 }}>
                · Выбрано {MAX_TICKETS}/{MAX_TICKETS}
              </span>
            )}
          </div>
          <div style={{ textAlign: "center", margin: "0 20px 8px" }}>
            <div style={{ height: 14, marginBottom: 3, background: `linear-gradient(180deg,${BRAND.gray} 0%,#000 100%)`, borderRadius: "50% 50% 0 0/100% 100% 0 0" }} />
            <div style={{ fontSize: 9, color: BRAND.textSub, letterSpacing: 4, fontWeight: 600 }}>ЭКРАН</div>
          </div>
          <HallCanvas
            seats={seats}
            selectedSeats={selectedSeats}
            onToggle={handleSeatClick}
            onDeselect={handleDeselect}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
          />
        </div>
      )}

      {pendingSeat && (
        <TicketBottomSheet
          seat={pendingSeat}
          tickets={priceData}
          onSelect={handleTicketSelect}
          onClose={() => setPendingSeat(null)}
        />
      )}

      {selectedSeats.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: BRAND.white, borderTop: `3px solid ${BRAND.red}`, borderRadius: "16px 16px 0 0", padding: "12px 20px 24px", zIndex: 100, animation: "slideUp 0.2s ease" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {selectedSeats.map((s) => (
              <div key={s.seatId} style={{ display: "flex", alignItems: "center", gap: 4, background: BRAND.bg, border: `1px solid ${BRAND.gray}`, borderRadius: 20, padding: "3px 8px 3px 10px", fontSize: 12, fontWeight: 500 }}>
                <span>Р{s.rowNum} М{s.place} · {s.ticketType === "CHILD" ? "Дет" : "Взр"} · {s.price} TJS</span>
                <button onClick={() => handleDeselect(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: BRAND.textSub, fontSize: 16, marginLeft: 2 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: BRAND.textMain, fontWeight: 800, fontSize: 24 }}>{total.toFixed(2)} TJS</div>
              <div style={{ color: BRAND.textSub, fontSize: 13 }}>За {selectedSeats.length} {selectedSeats.length === 1 ? "билет" : "билетов"}</div>
            </div>
            <button
              className="buy-btn"
              onClick={handleBuy}
              style={{ background: BRAND.red, color: BRAND.white, border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "background 0.15s", boxShadow: "0 4px 12px rgba(227,30,36,0.35)" }}
            >
              Купить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}