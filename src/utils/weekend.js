// Israel weekend = Friday + Saturday.
// Returns Date objects for the upcoming Fri and Sat (or current weekend if it's already Fri/Sat).

export function getUpcomingWeekend(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun ... 5=Fri, 6=Sat
  let daysUntilFriday;
  if (day === 6) {
    // Saturday — weekend started yesterday
    daysUntilFriday = -1;
  } else if (day === 5) {
    daysUntilFriday = 0;
  } else {
    daysUntilFriday = 5 - day;
  }
  const friday = new Date(d);
  friday.setDate(d.getDate() + daysUntilFriday);
  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);
  return { friday, saturday };
}

// Stable Firestore doc id for the upcoming weekend — keyed by its Friday's ISO year+week.
export function getWeekendId(now = new Date()) {
  const { friday } = getUpcomingWeekend(now);
  const { year, week } = isoYearWeek(friday);
  return `weekend_${year}_${String(week).padStart(2, '0')}`;
}

function isoYearWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const HE_WEEKDAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

export function formatHebrewDate(date) {
  return `${date.getDate()} ב${HE_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatHebrewDateShort(date) {
  return `${date.getDate()} ב${HE_MONTHS[date.getMonth()]}`;
}

export function formatHebrewWeekday(date) {
  return `יום ${HE_WEEKDAYS[date.getDay()]}`;
}

export function formatTodayLong(date = new Date()) {
  return `${formatHebrewWeekday(date)}, ${formatHebrewDate(date)}`;
}

export function formatWeekendRange(friday, saturday) {
  return `${formatHebrewDateShort(friday)} – ${formatHebrewDateShort(saturday)}`;
}
