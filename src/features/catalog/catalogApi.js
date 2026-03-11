import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN = import.meta.env.VITE_LOGIN;
const SECRET = import.meta.env.VITE_SECRET_KEY;

function makeSign(raw) {
  return HmacSHA256(String(raw), String(SECRET)).toString(Hex);
}

export async function apiGetAllEventsV2({
  lang = "ru",
  dateValue = "",
  eventName = "",
  categoryId = "",
}) {

  const raw = `${LOGIN}${lang}`;
  const sign = makeSign(raw);

  const url = new URL("/index.php", BASE_URL);
  url.searchParams.set("controller", "api");
  url.searchParams.set("action", "getAllEventsV2");
  url.searchParams.set("login", LOGIN);
  url.searchParams.set("sign", sign);
  url.searchParams.set("lang", lang);

  if (dateValue) url.searchParams.set("dateValue", dateValue);
  if (eventName) url.searchParams.set("eventName", eventName);
  if (categoryId) url.searchParams.set("categoryId", categoryId);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}