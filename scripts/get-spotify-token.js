/**
 * Spotify refresh_token almak için:
 * 1. .env.local'deki SPOTIFY_CLIENT_ID ve SPOTIFY_CLIENT_SECRET'ı kullanır
 * 2. Önce tarayıcıda authorize URL'yi açıp code al
 * 3. Çalıştır: node scripts/get-spotify-token.js BURAYA_CODE
 */

const code = process.argv[2];

if (!code) {
  console.log(`
Kullanım:
  1. Tarayıcıda bu URL'yi aç (CLIENT_ID'i .env.local'deki değerle değiştir):
     https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000&scope=user-read-currently-playing%20user-read-recently-played

  2. Spotify ile giriş yap, localhost:3000'e yönlendirileceksin
  3. Adres çubuğundaki code=... kısmını kopyala
  4. Çalıştır: node scripts/get-spotify-token.js BURAYA_CODE
`);
  process.exit(1);
}

// .env.local'den oku
const fs = require("fs");
const path = require("path");
const envPath = path.join(process.cwd(), ".env.local");
let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  try {
    const env = fs.readFileSync(envPath, "utf8");
    env.split("\n").forEach((line) => {
      const m = line.match(/^SPOTIFY_CLIENT_ID=(.+)$/);
      if (m) clientId = m[1].trim();
      const s = line.match(/^SPOTIFY_CLIENT_SECRET=(.+)$/);
      if (s) clientSecret = s[1].trim();
    });
  } catch {
    // ignore
  }
}

if (!clientId || !clientSecret) {
  console.error("Hata: .env.local'de SPOTIFY_CLIENT_ID ve SPOTIFY_CLIENT_SECRET tanımlı olmalı.");
  process.exit(1);
}

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: "http://localhost:3000",
  }),
})
  .then((r) => r.json())
  .then((d) => {
    if (d.refresh_token) {
      console.log("\n✅ refresh_token alındı. .env.local'e ekle:\n");
      console.log(`SPOTIFY_REFRESH_TOKEN=${d.refresh_token}\n`);
    } else {
      console.error("Hata:", d);
    }
  })
  .catch((e) => console.error("Hata:", e));
