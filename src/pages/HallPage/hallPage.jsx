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
import HallSkeleton from "../../components/HallSkeleton";
import { getSeatColor } from "../../utils/seatColors";
import {
  getSeatTypeLabel,
  groupPriceDataBySeatType,
  getTicketTypeLabel,
} from "../../utils/seatTypes";
import { MAX_TICKETS } from "../../utils/booking";

function SeatIcon({ color, size = 16 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 26 23" fill="none">
      <rect x="2" y="0" width="22" height="8" rx="3" fill={color} />
      <rect x="0" y="8" width="26" height="11" rx="3" fill={color} />
      <rect x="0" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="22" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="4" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
      <rect x="18" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function Legend({ priceData }) {
  const unique = groupPriceDataBySeatType(priceData);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "8px 16px 4px",
        flexWrap: "wrap",
      }}
    >
      {unique.map((p) => (
        <div key={p.seatType} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <SeatIcon color={getSeatColor(p.seatType)} size={16} />
          <span style={{ fontSize: 12, color: "#000000", fontWeight: 500 }}>
            {getSeatTypeLabel(p.seatType)} - от {p.price} {p.currencyCode}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    movieTitle = "",
    sessionDate = "",
    locationName = "",
    sessions = [],
  } = state || {};

  const dispatch = useDispatch();
  const seatsData = useSelector(selectSeats);
  const status = useSelector(selectSeatsStatus);
  const error = useSelector(selectSeatsError);

  const [activeSessionId, setActiveSessionId] = useState(sessionId);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [limitWarning, setLimitWarning] = useState(false);
  const [pendingSeat, setPendingSeat] = useState(null);

  useEffect(() => {
    if (!activeSessionId) return;
    dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }));
    setSelectedSeats([]);
    return () => dispatch(clearSeats());
  }, [activeSessionId, dispatch]);

  const seats = seatsData?.seats ?? [];
  const priceData = seatsData?.seatTypePrice ?? [];
  const hallName = seatsData?.hallName ?? "";
  const mapWidth = seatsData?.mapWidth ?? "1686";
  const mapHeight = seatsData?.mapHeight ?? "1084";

  const onlySeats = seats.filter((s) => s.objectType === "seat" && s.left && s.top);
  const freeCount = onlySeats.filter((s) => s.bookedSeats === "0").length;
  const limitReached = selectedSeats.length >= MAX_TICKETS;

  const handleSeatClick = useCallback(
    (seat) => {
      if (limitReached) {
        setLimitWarning(true);
        setTimeout(() => setLimitWarning(false), 2500);
        return;
      }
      setPendingSeat(seat);
    },
    [limitReached]
  );

  const handleDeselect = useCallback(
    (seat) => setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seat.seatId)),
    []
  );

  const handleTicketSelect = (seat, ticket) => {
    const entry = {
      ...seat,
      ticketId: ticket.ticketId,
      ticketType: ticket.ticketType,
      ticketName: ticket.name,
      price: parseFloat(ticket.price) || 0,
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
        seatTicketArr: selectedSeats.map((s) => ({
          seatId: s.seatId,
          ticketId: s.ticketId,
        })),
        total,
        sessionId: activeSessionId,
      },
    });

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
        paddingBottom: selectedSeats.length > 0 ? 120 : 20,
      }}
    >
      <style>{`
        @keyframes slideUp    { from{transform:translateX(-50%) translateY(100%)} to{transform:translateX(-50%) translateY(0)} }
        @keyframes fadeInDown { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .buy-btn:hover   { background: #c01a1f !important; }
        .retry-btn:hover { color: #c01a1f !important; }
      `}</style>

      {limitWarning && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            background: "#000000",
            color: "#ffffff",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            zIndex: 300,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            animation: "fadeInDown 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          Максимум {MAX_TICKETS} билетов за один раз
        </div>
      )}

      {/* Шапка */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px 16px 20px",
          borderBottom: "3px solid #E31E24",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <IconButton
            onClick={() => navigate(-1)}
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
          <div
            style={{
              flex: 1,
              fontWeight: 700,
              fontSize: 18,
              color: "#000000",
              paddingLeft: 44,
            }}
          >
            {movieTitle}
          </div>
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 14,
            marginBottom: sessions.length ? 16 : 0,
          }}
        >
          {sessionDate}
        </div>
        {sessions.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sessions.map((s) => {
              const active = activeSessionId === s.sessionId;
              return (
                <div
                  key={s.sessionId}
                  onClick={() => {
                    setActiveSessionId(s.sessionId);
                    setSelectedSeats([]);
                  }}
                  style={{
                    cursor: "pointer",
                    background: active ? "#E31E24" : "#f5f5f5",
                    border: `2px solid ${active ? "#E31E24" : "#c5c6c6"}`,
                    borderRadius: 10,
                    padding: "8px 16px",
                    textAlign: "center",
                    minWidth: 76,
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: active ? "#ffffff" : "#000000",
                    }}
                  >
                    {s.sessionTime}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: active ? "rgba(255,255,255,0.85)" : "#6b7280",
                    }}
                  >
                    {s.mediaType}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 3,
                      color: active ? "rgba(255,255,255,0.75)" : "#c5c6c6",
                    }}
                  >
                    от {s.minPrice} {s.currencyCode}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Название зала */}
      <div style={{ textAlign: "center", padding: "14px 16px 6px", background: "#ffffff" }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#000000" }}>{locationName}</div>
        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{hallName}</div>
      </div>

      {status === "loading" && <HallSkeleton />}

      {status === "failed" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: "#E31E24", fontSize: 14, marginBottom: 12 }}>{error}</div>
          <div
            className="retry-btn"
            onClick={() =>
              dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }))
            }
            style={{ color: "#E31E24", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Повторить
          </div>
        </div>
      )}

      {status === "succeeded" && (
        <div
          style={{
            background: "#ffffff",
            margin: "0 0 12px",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Legend priceData={priceData} />
          <div
            style={{ textAlign: "center", color: "#6b7280", fontSize: 12, marginBottom: 8 }}
          >
            Осталось мест: {freeCount}
            {limitReached && (
              <span style={{ color: "#E31E24", fontWeight: 600, marginLeft: 8 }}>
                · Выбрано {MAX_TICKETS}/{MAX_TICKETS}
              </span>
            )}
          </div>
          <div style={{ textAlign: "center", margin: "0 20px 8px" }}>
            <div
              style={{
                height: 14,
                marginBottom: 3,
                background: "linear-gradient(180deg,#c5c6c6 0%,#000 100%)",
                borderRadius: "50% 50% 0 0/100% 100% 0 0",
              }}
            />
            <div
              style={{ fontSize: 9, color: "#6b7280", letterSpacing: 4, fontWeight: 600 }}
            >
              ЭКРАН
            </div>
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
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            background: "#ffffff",
            borderTop: "3px solid #E31E24",
            borderRadius: "16px 16px 0 0",
            padding: "12px 20px 24px",
            zIndex: 100,
            animation: "slideUp 0.2s ease",
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {selectedSeats.map((s) => (
              <div
                key={s.seatId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#f5f5f5",
                  border: "1px solid #c5c6c6",
                  borderRadius: 20,
                  padding: "3px 8px 3px 10px",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span>
                  Р{s.rowNum} М{s.place} · {getTicketTypeLabel(s.ticketType)} · {s.price} TJS
                </span>
                <button
                  onClick={() => handleDeselect(s)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    color: "#6b7280",
                    fontSize: 16,
                    marginLeft: 2,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#000000", fontWeight: 800, fontSize: 24 }}>
                {total.toFixed(2)} TJS
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                За {selectedSeats.length} {selectedSeats.length === 1 ? "билет" : "билетов"}
              </div>
            </div>
            <button
              className="buy-btn"
              onClick={handleBuy}
              style={{
                background: "#E31E24",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "14px 32px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
                boxShadow: "0 4px 12px rgba(227,30,36,0.35)",
              }}
            >
              Купить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}