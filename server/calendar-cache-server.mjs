import http from "node:http";

const PORT = Number(process.env.CALENDAR_BACKEND_PORT ?? 3001);
const ICS_URL =
  process.env.CALENDAR_ICS_URL ??
  "https://calendar.google.com/calendar/ical/libertyloft%40proton.me/public/basic.ics";
const PREFETCH_INTERVAL_MS = Number(process.env.CALENDAR_PREFETCH_INTERVAL_MS ?? 10000);
const MAX_EVENTS = Number(process.env.CALENDAR_MAX_EVENTS ?? 6);

const cache = {
  events: [],
  fetchedAt: null,
  error: null,
  lastAttemptAt: null,
};

const decodeHtmlEntities = (value = "") =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const normalizeText = (value = "") =>
  decodeHtmlEntities(
    value
      .replace(/\\n/g, " ")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\s+/g, " ")
      .trim(),
  );

const sanitizeDescription = (value = "") =>
  decodeHtmlEntities(
    value
      .replace(/\\n/g, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

const parseDateValue = (line) => {
  const value = line.split(":").slice(1).join(":").trim();

  if (!value || value.length < 8) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const hasTime = value.includes("T");
  const isUtc = value.endsWith("Z");

  if (!hasTime) {
    return {
      date: new Date(Date.UTC(year, month, day, 0, 0, 0, 0)),
      allDay: true,
    };
  }

  const hour = Number(value.slice(9, 11));
  const minute = Number(value.slice(11, 13));
  const second = Number(value.slice(13, 15) || "0");

  if (isUtc) {
    return {
      date: new Date(Date.UTC(year, month, day, hour, minute, second, 0)),
      allDay: false,
    };
  }

  return {
    // ICS values without Z are interpreted as local time.
    date: new Date(year, month, day, hour, minute, second, 0),
    allDay: false,
  };
};

const parseICS = (icsText) => {
  const events = [];
  const blocks = icsText.split("BEGIN:VEVENT").slice(1);

  for (const rawBlock of blocks) {
    const endIndex = rawBlock.indexOf("END:VEVENT");
    if (endIndex === -1) {
      continue;
    }

    const block = rawBlock.slice(0, endIndex);
    const unfolded = block.replace(/\r?\n[ \t]/g, "");
    const lines = unfolded.split(/\r?\n/);

    let uid = "";
    let title = "";
    let description = "";
    let parsedDate = null;

    for (const line of lines) {
      if (line.startsWith("UID:")) {
        uid = line.slice(4).trim();
        continue;
      }

      if (line.startsWith("SUMMARY:")) {
        title = normalizeText(line.slice(8));
        continue;
      }

      if (line.startsWith("DESCRIPTION:")) {
        description = sanitizeDescription(line.slice(12));
        continue;
      }

      if (line.startsWith("DTSTART")) {
        parsedDate = parseDateValue(line);
      }
    }

    if (!title || !parsedDate?.date) {
      continue;
    }

    events.push({
      id: uid || `${title}-${parsedDate.date.getTime()}`,
      title,
      description: description.slice(0, 400),
      date: parsedDate.date.toISOString(),
      allDay: parsedDate.allDay,
    });
  }

  return events;
};

const refreshCache = async () => {
  cache.lastAttemptAt = new Date().toISOString();

  try {
    const response = await fetch(ICS_URL, {
      headers: {
        "user-agent": "libertyloft-calendar-cache/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Calendar fetch failed with ${response.status}`);
    }

    const text = await response.text();
    if (!text.includes("BEGIN:VCALENDAR")) {
      throw new Error("Calendar source did not return VCALENDAR data");
    }

    const now = Date.now();
    const upcoming = parseICS(text)
      .filter((event) => new Date(event.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, MAX_EVENTS);

    cache.events = upcoming;
    cache.fetchedAt = new Date().toISOString();
    cache.error = null;
  } catch (error) {
    cache.error = error instanceof Error ? error.message : "Unknown calendar fetch error";
  }
};

const writeJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  if (!req.url) {
    writeJson(res, 400, { error: "Missing URL" });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/calendar") {
    writeJson(res, 200, {
      events: cache.events,
      fetchedAt: cache.fetchedAt,
      lastAttemptAt: cache.lastAttemptAt,
      stale: Boolean(cache.error),
      error: cache.error,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/calendar/health") {
    writeJson(res, 200, {
      ok: true,
      fetchedAt: cache.fetchedAt,
      lastAttemptAt: cache.lastAttemptAt,
      stale: Boolean(cache.error),
      error: cache.error,
      eventCount: cache.events.length,
    });
    return;
  }

  writeJson(res, 404, { error: "Not found" });
});

await refreshCache();
setInterval(refreshCache, PREFETCH_INTERVAL_MS).unref();

server.listen(PORT, () => {
  console.log(
    `[calendar-cache] Listening on http://localhost:${PORT} | interval=${PREFETCH_INTERVAL_MS}ms`,
  );
});
