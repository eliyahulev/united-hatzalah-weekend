import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  getUpcomingWeekend,
  getWeekendId,
  formatTodayLong,
  formatHebrewDate,
  formatWeekendRange,
} from '../utils/weekend';
import { useShabbatInfo } from '../hooks/useShabbatInfo';

export default function Dashboard({ profile, onEditProfile }) {
  const now = useMemo(() => new Date(), []);
  const weekendId = useMemo(() => getWeekendId(now), [now]);
  const { friday, saturday } = useMemo(() => getUpcomingWeekend(now), [now]);
  const { hebrewDate, parasha } = useShabbatInfo();

  const [available, setAvailable] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const ref = doc(db, 'availability', weekendId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      const volunteers = data?.volunteers ?? [];
      setAvailable(volunteers.includes(profile.uid));
      setCount(volunteers.length);
    });
    return unsub;
  }, [weekendId, profile.uid]);

  async function toggleAvailability() {
    setBusy(true);
    setError('');
    const ref = doc(db, 'availability', weekendId);
    try {
      if (available) {
        await updateDoc(ref, {
          volunteers: arrayRemove(profile.uid),
          updatedAt: serverTimestamp(),
        });
      } else {
        // setDoc with merge handles both "doc exists" and "first-ever signup" cases.
        await setDoc(
          ref,
          {
            weekendId,
            fridayDate: friday.toISOString().slice(0, 10),
            saturdayDate: saturday.toISOString().slice(0, 10),
            volunteers: arrayUnion(profile.uid),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (e) {
      console.error(e);
      setError('הפעולה נכשלה. נסה שוב.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-5 safe-bottom">
      <div className="text-sm text-black/60 mb-1">{formatTodayLong(now)}</div>
      {hebrewDate?.hebrew && (
        <div className="text-sm text-hatzalah-orange font-semibold mb-1">{hebrewDate.hebrew}</div>
      )}
      <h2 className="text-2xl font-extrabold text-hatzalah-charcoal">שלום {profile.name?.split(' ')[0]} 👋</h2>

      <section className="card mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-sm text-black/60">סוף השבוע הקרוב</div>
          {parasha?.hebrew && (
            <div className="text-xs font-bold text-hatzalah-orange bg-hatzalah-orange/10 rounded-full px-3 py-1">
              {parasha.hebrew}
            </div>
          )}
        </div>
        <div className="text-xl font-extrabold mt-1">{formatWeekendRange(friday, saturday)}</div>
        <div className="text-sm text-black/60 mt-1">
          שישי {formatHebrewDate(friday)} · שבת {formatHebrewDate(saturday)}
        </div>

        <div className="mt-5 flex items-center justify-between bg-hatzalah-gray-light rounded-xl px-4 py-3">
          <div>
            <div className="text-xs text-black/60">סה״כ זמינים</div>
            <div className="text-2xl font-extrabold text-hatzalah-orange">{count}</div>
          </div>
          <div className={`text-sm font-semibold ${available ? 'text-green-600' : 'text-black/50'}`}>
            {available ? '✓ סומנת כזמין' : 'עדיין לא סומנת'}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={toggleAvailability}
          disabled={busy}
          className={`${available ? 'btn-dark' : 'btn-primary'} w-full mt-5`}
          aria-pressed={available}
        >
          {busy
            ? 'מעדכן…'
            : available
              ? 'הסר אותי מהרשימה'
              : 'אני זמין/ה לסופ״ש'}
        </button>
      </section>

      <section className="card mt-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-hatzalah-orange/10 text-hatzalah-orange flex items-center justify-center font-extrabold text-lg shrink-0">
            {profile.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{profile.name}</div>
            <div className="text-sm text-black/60 truncate">
              מס׳ מתנדב {profile.memberId} · {profile.location}
            </div>
          </div>
          <button onClick={onEditProfile} className="text-sm text-hatzalah-orange font-semibold px-2 py-1">
            עריכה
          </button>
        </div>
      </section>

      <p className="text-xs text-black/40 text-center mt-6 leading-relaxed">
        סימון הזמינות נשמר רק לסופ״ש הקרוב.<br />
        לאחר השבת, רשימה חדשה נפתחת אוטומטית.
      </p>
    </div>
  );
}
