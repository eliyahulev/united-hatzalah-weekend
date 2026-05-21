import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileForm({ user, existing, onSaved }) {
  const [name, setName] = useState(existing?.name ?? user.displayName ?? '');
  const [memberId, setMemberId] = useState(existing?.memberId ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !memberId.trim() || !location.trim()) {
      setError('יש למלא את כל השדות.');
      return;
    }

    setBusy(true);
    try {
      const ref = doc(db, 'users', user.uid);
      await setDoc(
        ref,
        {
          name: name.trim(),
          memberId: memberId.trim(),
          location: location.trim(),
          email: user.email ?? null,
          photoURL: user.photoURL ?? null,
          isAdmin: existing?.isAdmin ?? false,
          updatedAt: serverTimestamp(),
          ...(existing ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true },
      );
      onSaved?.();
    } catch (err) {
      console.error(err);
      setError('שמירה נכשלה. נסה שוב.');
    } finally {
      setBusy(false);
    }
  }

  const isEdit = !!existing;

  return (
    <div className="min-h-screen bg-hatzalah-gray-light">
      <div className="bg-hatzalah-charcoal text-white safe-top">
        <div className="max-w-screen-sm mx-auto px-4 pb-5">
          <h1 className="text-xl font-extrabold">{isEdit ? 'עדכון פרופיל' : 'ברוך הבא!'}</h1>
          <p className="text-white/70 text-sm mt-1">
            {isEdit ? 'עדכן את פרטיך כדי שיופיעו ברשימות.' : 'מלא את פרטיך כדי להתחיל.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="card space-y-5">
          <div>
            <label className="label" htmlFor="name">שם מלא</label>
            <input
              id="name"
              className="input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="למשל: ישראל ישראלי"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="memberId">מספר מתנדב</label>
            <input
              id="memberId"
              className="input"
              type="text"
              inputMode="numeric"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="לדוגמה: 12345"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="location">מיקום / סניף</label>
            <input
              id="location"
              className="input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="למשל: ירושלים — מרכז"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'שומר…' : isEdit ? 'שמור שינויים' : 'שמור ועבור לדשבורד'}
          </button>
        </div>
      </form>
    </div>
  );
}
