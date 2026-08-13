export const SEAT_TYPE_LABELS = {
  STANDARD: "Стандарт",
  COMFORT: "Комфорт",
  VIP: "VIP",
  ECONOM: "Эконом",
};

export function getSeatTypeLabel(seatType) {
  return SEAT_TYPE_LABELS[seatType?.toUpperCase()] ?? seatType;
}

export function groupPriceDataBySeatType(priceData) {
  const grouped = {};
  priceData.forEach((p) => {
    const key = p.seatType?.toUpperCase();
    const price = parseFloat(p.price) || 0;
    if (!grouped[key] || price < grouped[key].price) {
      grouped[key] = {
        seatType: p.seatType,
        price,
        currencyCode: p.currencyCode,
      };
    }
  });
  return Object.values(grouped);
}

export function getTicketTypeLabel(ticketType) {
  return ticketType === "CHILD" ? "Дет" : "Взр";
}