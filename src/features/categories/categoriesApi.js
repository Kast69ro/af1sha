import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN = import.meta.env.VITE_LOGIN;
const SECRET = import.meta.env.VITE_SECRET_KEY;


function makeSign(login) {
  return HmacSHA256(String(login), String(SECRET)).toString(Hex);
}

export async function apiGetCategoriesAndLocations() {
  const url = new URL("/index.php", BASE_URL);
  url.searchParams.set("controller", "api");
  url.searchParams.set("action", "getCategoriesAndLocations");
  url.searchParams.set("login", LOGIN);
  url.searchParams.set("sign", makeSign(LOGIN));


  console.log(url);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  
  return res.json();
}