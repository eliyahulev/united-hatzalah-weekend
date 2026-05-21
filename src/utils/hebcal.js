// Tiny wrapper around Hebcal's public JSON API.
// Docs: https://www.hebcal.com/home/195/jewish-calendar-rest-api

const JERUSALEM_GEONAME_ID = 281184;

// Returns formatted Hebrew date for the given Gregorian date, e.g. "כ״ט בְּאִיָּיר תשפ״ו".
export async function fetchHebrewDate(date = new Date(), { signal } = {}) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const url = `https://www.hebcal.com/converter?cfg=json&gy=${y}&gm=${m}&gd=${d}&g2h=1&strict=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`hebcal converter HTTP ${res.status}`);
  const json = await res.json();
  return {
    hebrew: json.hebrew,    // full formatted string in Hebrew
    hd: json.hd,            // day-of-month (number)
    hm: json.hm,            // month name (English)
    hy: json.hy,            // year (number)
    events: json.events ?? [],
  };
}

// Returns the upcoming Parashat HaShavua for Israel (Jerusalem timing).
// Returns null if Hebcal has no parasha in the response (rare — happens around
// chagim where the weekly portion is replaced by a holiday reading).
export async function fetchUpcomingParasha({ signal } = {}) {
  const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${JERUSALEM_GEONAME_ID}&M=on&i=on`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`hebcal shabbat HTTP ${res.status}`);
  const json = await res.json();
  const parasha = json.items?.find((i) => i.category === 'parashat');
  if (!parasha) return null;
  return {
    hebrew: parasha.hebrew,   // e.g. "פרשת בהר"
    title: parasha.title,     // e.g. "Parashat Behar"
    date: parasha.date,       // ISO date of the Shabbat
  };
}
