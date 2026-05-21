import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  getUpcomingWeekend,
  getWeekendId,
  formatHebrewDate,
  formatWeekendRange,
} from '../utils/weekend';
import { useShabbatInfo } from '../hooks/useShabbatInfo';

export default function AdminView() {
  const now = useMemo(() => new Date(), []);
  const weekendId = useMemo(() => getWeekendId(now), [now]);
  const { friday, saturday } = useMemo(() => getUpcomingWeekend(now), [now]);
  const { hebrewDate, parasha } = useShabbatInfo();

  const [uids, setUids] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const ref = doc(db, 'availability', weekendId);
    const unsub = onSnapshot(
      ref,
      (snap) => setUids(snap.data()?.volunteers ?? []),
      (e) => {
        console.error(e);
        setError('טעינת רשימת הזמינים נכשלה.');
        setLoading(false);
      },
    );
    return unsub;
  }, [weekendId]);

  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      setLoading(true);
      try {
        if (uids.length === 0) {
          if (!cancelled) setVolunteers([]);
          return;
        }
        // Firestore `in` clause is capped at 30 — batch the lookups.
        const batches = [];
        for (let i = 0; i < uids.length; i += 30) {
          batches.push(uids.slice(i, i + 30));
        }
        const results = await Promise.all(
          batches.map((batch) =>
            getDocs(query(collection(db, 'users'), where(documentId(), 'in', batch))),
          ),
        );
        const profiles = results.flatMap((snap) =>
          snap.docs.map((d) => ({ uid: d.id, ...d.data() })),
        );
        profiles.sort((a, b) =>
          (a.location ?? '').localeCompare(b.location ?? '', 'he') ||
          (a.name ?? '').localeCompare(b.name ?? '', 'he'),
        );
        if (!cancelled) setVolunteers(profiles);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('טעינת פרופילים נכשלה.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfiles();
    return () => { cancelled = true; };
  }, [uids]);

  function buildShareText() {
    const parashaLine = parasha?.hebrew ? `${parasha.hebrew}\n` : '';
    const header = `*רשימת מתנדבים זמינים לסופ״ש*\n${parashaLine}${formatWeekendRange(friday, saturday)}\nשישי ${formatHebrewDate(friday)} · שבת ${formatHebrewDate(saturday)}\nסה״כ: ${volunteers.length}\n`;
    if (volunteers.length === 0) {
      return `${header}\n_אין כרגע מתנדבים רשומים._`;
    }
    // Group by location
    const byLocation = volunteers.reduce((acc, v) => {
      const key = v.location || 'ללא סניף';
      (acc[key] ||= []).push(v);
      return acc;
    }, {});
    const sections = Object.entries(byLocation)
      .sort(([a], [b]) => a.localeCompare(b, 'he'))
      .map(([loc, list]) => {
        const lines = list
          .map((v, i) => `${i + 1}. ${v.name} — מס׳ ${v.memberId}`)
          .join('\n');
        return `*${loc}* (${list.length})\n${lines}`;
      });
    return `${header}\n${sections.join('\n\n')}`;
  }

  function handleShareWhatsApp() {
    const text = encodeURIComponent(buildShareText());
    // whatsapp:// opens the native app on mobile; wa.me falls back on desktop.
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile ? `whatsapp://send?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText());
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-5 safe-bottom">
      <div className="card">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-sm text-black/60">סיכום סופ״ש</div>
          {parasha?.hebrew && (
            <div className="text-xs font-bold text-hatzalah-orange bg-hatzalah-orange/10 rounded-full px-3 py-1">
              {parasha.hebrew}
            </div>
          )}
        </div>
        <div className="text-xl font-extrabold mt-1">{formatWeekendRange(friday, saturday)}</div>
        <div className="text-sm text-black/60 mt-1">{hebrewDate?.hebrew ?? `מזהה: ${weekendId}`}</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="זמינים" value={volunteers.length} />
          <Stat label="סניפים" value={new Set(volunteers.map((v) => v.location)).size} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={handleShareWhatsApp} className="btn-primary">
            <WhatsAppIcon />
            שלח רשימה בוואטסאפ
          </button>
          <button onClick={handleCopy} className="btn-secondary">
            העתק טקסט
          </button>
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-hatzalah-charcoal mt-6 mb-3 px-1">
        רשימה חיה ({volunteers.length})
      </h3>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100 mb-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center text-black/50">טוען…</div>
      ) : volunteers.length === 0 ? (
        <div className="card text-center text-black/50">
          עדיין אין מתנדבים רשומים לסופ״ש זה.
        </div>
      ) : (
        <ul className="space-y-2">
          {volunteers.map((v) => (
            <li key={v.uid} className="card !p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-hatzalah-orange/10 text-hatzalah-orange flex items-center justify-center font-extrabold shrink-0">
                  {v.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{v.name}</div>
                  <div className="text-xs text-black/60 truncate">
                    מס׳ {v.memberId} · {v.location}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-hatzalah-gray-light rounded-xl px-4 py-3">
      <div className="text-xs text-black/60">{label}</div>
      <div className="text-2xl font-extrabold text-hatzalah-orange">{value}</div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 3.2 17l-1.2 4.4 4.5-1.2A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.7.7.7-2.6-.2-.3A8 8 0 1 1 12 20zm4.5-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2.1-1.6-.5-.5-.9-1.2-1.3-1.9-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4 0-.1 0-.3-.1-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.1 1.9 2.9 4.6 4 .6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.3-.1-.5-.3z"/>
    </svg>
  );
}
