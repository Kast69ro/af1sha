  // detailApi.js
  import HmacSHA256 from "crypto-js/hmac-sha256";
  import Hex from "crypto-js/enc-hex";

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const LOGIN = import.meta.env.VITE_LOGIN;
  const SECRET = import.meta.env.VITE_SECRET_KEY;

  // ✅ По документации: sign = hash_hmac('sha256', login + eventId, secret_key)
  function makeSignForEvent(eventId) {
    const raw = `${LOGIN}${String(eventId)}`;
    return HmacSHA256(raw, String(SECRET)).toString(Hex);
  }

  export async function apiGetSessionDetails({ eventId, lang = "ru" }) {
    const sign = makeSignForEvent(eventId);

    const url = new URL("/index.php", BASE_URL);
    url.searchParams.set("controller", "api");
    url.searchParams.set("action", "getEventDetails"); // ✅ было getSessionDetails
    url.searchParams.set("eventId", String(eventId));  // ✅ было sessionId
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