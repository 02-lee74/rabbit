const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const HOST = "127.0.0.1";
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const SCORES_FILE = path.join(DATA_DIR, "leaderboard.json");

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let scores = [];
if (fs.existsSync(SCORES_FILE)) {
      try {
                scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
      } catch (e) {
                console.error("Error reading scores file:", e);
                scores = [];
      }
}
const server = http.createServer(async (req, res) => {
    try {
          const url = new URL(req.url, `http://${req.headers.host}`);

      if (url.pathname === "/api/health") {
              return sendJson(res, 200, { ok: true, name: "rabbit-stairs-backend" });
      }

      if (url.pathname === "/api/scores" && req.method === "GET") {
              const sorted = [...scores].sort((a, b) => b.score - a.score || b.distance - a.distance).slice(0, 20);
              return sendJson(res, 200, { scores: sorted });
      }

      if (url.pathname === "/api/scores" && req.method === "POST") {
              const payload = await readJsonBody(req);
              const r = normalizeScore(payload);
              r.createdAt = new Date().toISOString();
              r.id = Date.now();

            scores.push(r);
              scores = scores.sort((a, b) => b.score - a.score).slice(0, 100);

            fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));

            const sorted = [...scores].sort((a, b) => b.score - a.score || b.distance - a.distance).slice(0, 20);
              return sendJson(res, 201, { ok: true, score: r, scores: sorted });
      }

      if (req.method !== "GET") {
              return sendJson(res, 405, { error: "Method not allowed" });
      }

      return serveStatic(url.pathname, res);
    } catch (error) {
          return sendJson(res, 500, { error: error.message || "Server error" });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});


function normalizeScore(payload) {
    const nickname = String(payload.nickname || "").trim().slice(0, 12) || "Anonymous Rabbit";
    const score = Number(payload.score) || 0;
    const distance = Number(payload.distance) || 0;
    const character = String(payload.character || "rabbit");
    return { nickname, score, distance, character };
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
          let raw = "";
          req.on("data", (chunk) => { raw += chunk; });
          req.on("end", () => {
                  try { resolve(raw ? JSON.parse(raw) : {}); } catch (err) { reject(new Error("Invalid JSON body")); }
          });
          req.on("error", reject);
    });
}


function serveStatic(pathname, res) {
    const cleanedPath = pathname === "/" ? "/index.html" : pathname;
    const targetPath = path.normalize(path.join(PUBLIC_DIR, cleanedPath));

  if (!targetPath.startsWith(PUBLIC_DIR)) {
        return sendJson(res, 403, { error: "Forbidden" });
  }

  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
        return sendJson(res, 404, { error: "Not found" });
  }

  const ext = path.extname(targetPath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(targetPath).pipe(res);
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}
