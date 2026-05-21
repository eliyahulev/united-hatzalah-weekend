import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { isAdminEmail } from '../admins';

// authReady   — has the initial Firebase auth check completed?
// user        — Firebase auth user (or null)
// profile     — Firestore users/{uid} doc:
//                 undefined → still loading
//                 null      → signed in, no profile doc yet (first login)
//                 object    → profile loaded
// error       — surfaces Firestore errors so we don't silently render a blank screen
export function useAuth() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser((prev) => {
        if (prev?.uid !== u?.uid) {
          // user identity changed — reset profile back to "loading"
          setProfile(u ? undefined : null);
          setError(null);
        }
        return u;
      });
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfile(undefined);
    setError(null);
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? { uid: user.uid, ...snap.data() } : null);
      },
      (err) => {
        console.error('profile snapshot error:', err);
        setError(err);
        setProfile(null); // unblock UI — fall through to ProfileForm or error view
      },
    );
    return unsub;
  }, [user]);

  // Admin if either the email is in the hardcoded allowlist, or the
  // Firestore profile has isAdmin=true (granted via console).
  const isAdmin = isAdminEmail(user?.email) || profile?.isAdmin === true;

  return { authReady, user, profile, error, isAdmin };
}
