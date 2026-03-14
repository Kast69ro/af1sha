import { useEffect, useRef, useCallback } from "react";

// ─── Константы ────────────────────────────────────────────────────────────────

const BRAND = {
  red:      "#E31E24",
  white:    "#ffffff",
  gray:     "#c5c6c6",
};

const SEAT_COLORS = {
  STANDARD: "#f59e0b",
  COMFORT:  "#3b82f6",
  VIP:      "#a855f7",
  ECONOM:   "#10b981",
  DEFAULT:  "#f59e0b",
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const SEAT_W    = 26;
const SEAT_H    = 23;

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function getSeatColor(seatType) {
  if (!seatType) return SEAT_COLORS.DEFAULT;
  return SEAT_COLORS[seatType.toUpperCase()] ?? SEAT_COLORS.DEFAULT;
}

function createSeatImage(color, onLoad) {
  const svg = `<svg width="26" height="23" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2"  y="0"  width="22" height="8"  rx="3" fill="${color}"/>
    <rect x="0"  y="8"  width="26" height="11" rx="3" fill="${color}"/>
    <rect x="0"  y="10" width="4"  height="10" rx="2" fill="${color}" opacity="0.7"/>
    <rect x="22" y="10" width="4"  height="10" rx="2" fill="${color}" opacity="0.7"/>
    <rect x="4"  y="18" width="4"  height="5"  rx="1.5" fill="${color}" opacity="0.5"/>
    <rect x="18" y="18" width="4"  height="5"  rx="1.5" fill="${color}" opacity="0.5"/>
  </svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url  = URL.createObjectURL(blob);
  const img  = new Image();
  img.onload = () => { onLoad(img); URL.revokeObjectURL(url); };
  img.src    = url;
}

// ─── Компонент ────────────────────────────────────────────────────────────────

/**
 * HallCanvas
 *
 * Props:
 *   seats         {Array}    — полный список объектов зала из API
 *   selectedSeats {Array}    — выбранные места [{ seatId, place, ... }]
 *   onToggle      {Function} — (seat) => void   — клик по свободному месту
 *   onDeselect    {Function} — (seat) => void   — клик по выбранному месту
 *   limitReached  {Boolean}  — если true, onToggle не вызывается (блокировка снаружи)
 *   mapWidth      {String}   — ширина карты из API  (используется как запасное значение)
 *   mapHeight     {String}   — высота карты из API  (используется как запасное значение)
 */
export default function HallCanvas({
  seats,
  selectedSeats,
  onToggle,
  onDeselect,
  mapWidth  = "1686",
  mapHeight = "1084",
}) {
  const canvasRef     = useRef(null);
  const stateRef      = useRef({ scale: 1, x: 0, y: 0 });   // transform state
  const pinchRef      = useRef(null);
  const panRef        = useRef(null);
  const seatsRef      = useRef([]);
  const selectedRef   = useRef(selectedSeats);
  const rafRef        = useRef(null);
  const isDragRef     = useRef(false);
  const iconCacheRef  = useRef({});
  const scheduleRef   = useRef(null);
  const onToggleRef   = useRef(onToggle);
  const onDeselectRef = useRef(onDeselect);

  // ─── Производные размеры карты ──────────────────────────────────────────────

  const validSeats = seats.filter((s) => s.objectType === "seat" && s.left && s.top);

  const allX  = validSeats.map((s) => Number(s.left));
  const allY  = validSeats.map((s) => Number(s.top));
  const minX  = validSeats.length ? Math.min(...allX) : 0;
  const minY  = validSeats.length ? Math.min(...allY) : 0;
  const maxX  = validSeats.length ? Math.max(...allX) : Number(mapWidth);
  const maxY  = validSeats.length ? Math.max(...allY) : Number(mapHeight);
  const realW = maxX - minX + 80;
  const realH = maxY - minY + 200;   // +200 — места не обрезаются снизу

  // ─── Синхронизация ref-ов ───────────────────────────────────────────────────

  useEffect(() => { selectedRef.current   = selectedSeats; }, [selectedSeats]);
  useEffect(() => { onToggleRef.current   = onToggle; },      [onToggle]);
  useEffect(() => { onDeselectRef.current = onDeselect; },    [onDeselect]);

  // ─── Hit-test ───────────────────────────────────────────────────────────────

  const hitTest = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const bs   = canvas.clientWidth / realW;
      const { scale, x, y } = stateRef.current;
      const cx = (clientX - rect.left - x) / scale;
      const cy = (clientY - rect.top  - y) / scale;
      return (
        seatsRef.current.find((seat) => {
          const sx = (Number(seat.left) - minX + 40) * bs;
          const sy = (Number(seat.top)  - minY + 40) * bs;
          const hw = (SEAT_W * bs) / 2 + 5;
          const hh = (SEAT_H * bs) / 2 + 5;
          return Math.abs(cx - sx) < hw && Math.abs(cy - sy) < hh;
        }) ?? null
      );
    },
    [minX, minY, realW],
  );

  // ─── Рисование ──────────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const { scale, x, y } = stateRef.current;
    const bs = canvas.clientWidth / realW;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    seatsRef.current.forEach((seat) => {
      const sx     = (Number(seat.left) - minX + 40) * bs;
      const sy     = (Number(seat.top)  - minY + 40) * bs;
      const booked = seat.bookedSeats === "1";
      const isSel  = selectedRef.current.some((s) => s.seatId === seat.seatId);
      const color  = booked ? "#d1d5db" : isSel ? BRAND.red : getSeatColor(seat.seatType);
      const w      = SEAT_W * bs;
      const h      = SEAT_H * bs;
      const dw     = isSel ? w * 1.2 : w;
      const dh     = isSel ? h * 1.2 : h;

      const cached = iconCacheRef.current[color];

      if (cached && cached !== "loading") {
        ctx.drawImage(cached, sx - dw / 2, sy - dh / 2, dw, dh);
      } else if (!cached) {
        iconCacheRef.current[color] = "loading";
        createSeatImage(color, (img) => {
          iconCacheRef.current[color] = img;
          scheduleRef.current?.();
        });
        // Заглушка пока картинка грузится
        ctx.fillStyle = color;
        ctx.fillRect(sx - w / 2, sy - h / 2, w, h);
      } else {
        // "loading" — рисуем заглушку
        ctx.fillStyle = color;
        ctx.fillRect(sx - w / 2, sy - h / 2, w, h);
      }

      // Крестик для занятых мест
      if (booked) {
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth   = Math.max(0.5, bs);
        ctx.beginPath();
        ctx.moveTo(sx - w * 0.18, sy - h * 0.18);
        ctx.lineTo(sx + w * 0.18, sy + h * 0.18);
        ctx.moveTo(sx + w * 0.18, sy - h * 0.18);
        ctx.lineTo(sx - w * 0.18, sy + h * 0.18);
        ctx.stroke();
      }

      // Номер места для выбранных
      if (isSel) {
        ctx.fillStyle    = BRAND.white;
        ctx.font         = `bold ${Math.max(6, 8 * bs)}px sans-serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(seat.place, sx, sy);
      }
    });

    ctx.restore();
  }, [minX, minY, realW]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => { scheduleRef.current = scheduleDraw; }, [scheduleDraw]);

  // ─── ResizeObserver — адаптивный canvas ─────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w       = canvas.clientWidth;
      const naturalH = (realH / realW) * w;
      const minH    = window.innerHeight * 0.5;
      const h       = Math.max(naturalH, minH);
      canvas.style.height = `${h}px`;
      canvas.width        = w * dpr;
      canvas.height       = h * dpr;
      stateRef.current    = { scale: 1, x: 0, y: 0 };
      scheduleDraw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [realW, realH, scheduleDraw]);

  // ─── Сброс при смене сеанса / списка мест ───────────────────────────────────

  useEffect(() => {
    seatsRef.current     = validSeats;
    stateRef.current     = { scale: 1, x: 0, y: 0 };
    iconCacheRef.current = {};
    scheduleDraw();
  }, [seats]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Перерисовка при изменении выбора ───────────────────────────────────────

  useEffect(() => { scheduleDraw(); }, [selectedSeats, scheduleDraw]);

  // ─── Mouse (десктоп) ─────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let startX = 0, startY = 0;

    const onMouseDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDragRef.current = false;
    };

    const onMouseMove = (e) => {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5) {
        isDragRef.current = true;
      }
    };

    const onClick = (e) => {
      if (isDragRef.current) return;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit || hit.bookedSeats === "1") return;
      const isSel = selectedRef.current.some((s) => s.seatId === hit.seatId);
      if (isSel) onDeselectRef.current(hit);
      else       onToggleRef.current(hit);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click",     onClick);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click",     onClick);
    };
  }, [hitTest]);

  // ─── Touch (мобильный) ───────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDist = (t1, t2) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

    const getMaxPan = (sc) => ({
      maxX: Math.max(0, (canvas.clientWidth  * sc - canvas.clientWidth)  / 2),
      maxY: Math.max(0, (canvas.clientHeight * sc - canvas.clientHeight) / 2),
    });

    const onTouchStart = (e) => {
      e.preventDefault();
      isDragRef.current = false;

      if (e.touches.length === 2) {
        panRef.current   = null;
        pinchRef.current = {
          dist: getDist(e.touches[0], e.touches[1]),
          cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      } else if (e.touches.length === 1) {
        pinchRef.current = null;
        panRef.current   = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          lastX:  e.touches[0].clientX,
          lastY:  e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();

      if (e.touches.length === 2 && pinchRef.current) {
        isDragRef.current = true;
        const newDist  = getDist(e.touches[0], e.touches[1]);
        const cx       = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy       = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const ratio    = newDist / pinchRef.current.dist;
        const p        = stateRef.current;
        const newScale = clamp(p.scale * ratio, MIN_SCALE, MAX_SCALE);
        const rect     = canvas.getBoundingClientRect();
        const ox = cx - rect.left;
        const oy = cy - rect.top;
        const k  = newScale / p.scale;
        const panDx = cx - pinchRef.current.cx;
        const panDy = cy - pinchRef.current.cy;
        const rawX  = ox - k * (ox - p.x) + panDx;
        const rawY  = oy - k * (oy - p.y) + panDy;
        const { maxX, maxY } = getMaxPan(newScale);
        stateRef.current = {
          scale: newScale,
          x: clamp(rawX, -maxX, maxX),
          y: clamp(rawY, -maxY, maxY),
        };
        scheduleRef.current?.();
        pinchRef.current = { dist: newDist, cx, cy };
      }

      if (e.touches.length === 1 && panRef.current) {
        const dx      = e.touches[0].clientX - panRef.current.lastX;
        const dy      = e.touches[0].clientY - panRef.current.lastY;
        const totalDx = e.touches[0].clientX - panRef.current.startX;
        const totalDy = e.touches[0].clientY - panRef.current.startY;
        if (Math.hypot(totalDx, totalDy) > 4) isDragRef.current = true;
        if (isDragRef.current) {
          const p = stateRef.current;
          const { maxX, maxY } = getMaxPan(p.scale);
          stateRef.current = {
            ...p,
            x: clamp(p.x + dx, -maxX, maxX),
            y: clamp(p.y + dy, -maxY, maxY),
          };
          scheduleRef.current?.();
        }
        panRef.current.lastX = e.touches[0].clientX;
        panRef.current.lastY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      if (e.touches.length < 2) pinchRef.current = null;

      if (e.touches.length === 0) {
        if (!isDragRef.current && e.changedTouches.length === 1) {
          const t   = e.changedTouches[0];
          const hit = hitTest(t.clientX, t.clientY);
          if (hit && hit.bookedSeats !== "1") {
            const isSel = selectedRef.current.some((s) => s.seatId === hit.seatId);
            if (isSel) onDeselectRef.current(hit);
            else       onToggleRef.current(hit);
          }
        }
        panRef.current    = null;
        isDragRef.current = false;
      }
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [hitTest]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <canvas
      ref={canvasRef}
      style={{
        width:       "100%",
        display:     "block",
        touchAction: "none",
        cursor:      "pointer",
      }}
    />
  );
}