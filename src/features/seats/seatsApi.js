import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN = import.meta.env.VITE_LOGIN;
const SECRET = import.meta.env.VITE_SECRET_KEY;


export async function apiGetSeats({ sessionId, bookedSeats = -1, lang = "ru" }) {
  const raw = `${LOGIN}${String(sessionId)}`;
  const sign = HmacSHA256(raw, String(SECRET)).toString(Hex);

  const url = new URL("/index.php", BASE_URL);
  url.searchParams.set("controller", "api");
  url.searchParams.set("action", "getSeatsV2");
  url.searchParams.set("sessionId", String(sessionId));
  url.searchParams.set("bookedSeats", String(bookedSeats));
  url.searchParams.set("login", LOGIN);
  url.searchParams.set("sign", sign);
  if (lang) url.searchParams.set("lang", lang);

  const res = await fetch(url.toString(), { method: "GET" });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }

  return data;
}
  
