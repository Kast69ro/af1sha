export const SEAT_COLORS = {
  STANDARD: "#f59e0b",
  COMFORT:  "#3b82f6",
  VIP:      "#a855f7",
  ECONOM:   "#10b981",
  DEFAULT:  "#f59e0b",
};

export function getSeatColor(seatType) {
  if (!seatType) return SEAT_COLORS.DEFAULT;
  return SEAT_COLORS[seatType.toUpperCase()] ?? SEAT_COLORS.DEFAULT;
}