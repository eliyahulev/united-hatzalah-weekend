import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    setBusy(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        setError('ההתחברות נכשלה. נסה שוב.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-hatzalah-charcoal text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <img
          src="/logo.png"
          alt="איחוד הצלה"
          className="w-28 h-28 mb-6 drop-shadow-[0_8px_24px_rgba(255,102,0,0.35)]"
        />
        <h1 className="text-3xl font-extrabold mb-2">איחוד הצלה</h1>
        <p className="text-white/70 mb-8 leading-relaxed">
          רישום זמינות מתנדבים לסופי שבוע.
          <br />
          התחברו כדי לסמן זמינות לסופ״ש הקרוב.
        </p>

        {error && (
          <div className="bg-red-500/15 text-red-200 text-sm rounded-xl px-4 py-3 mb-4 w-full max-w-xs">
            {error}
          </div>
        )}

        <button onClick={handleSignIn} disabled={busy} className="btn-primary w-full max-w-xs">
          {busy ? 'מתחבר…' : (
            <>
              <GoogleIcon />
              התחבר עם Google
            </>
          )}
        </button>
      </div>
      <div className="text-center text-white/40 text-xs pb-6 px-6 safe-bottom">
        © איחוד הצלה — לשימוש המתנדבים בלבד
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#FFC107" d="M21.8 10.2H12v3.8h5.6c-.5 2.5-2.6 3.8-5.6 3.8a6 6 0 1 1 3.9-10.6l2.7-2.7A9.8 9.8 0 1 0 12 21.8c5.6 0 9.6-3.9 9.6-9.6 0-.7-.1-1.3-.2-2z"/>
      <path fill="#FF3D00" d="M3.2 7.3l3.2 2.3A6 6 0 0 1 12 6.2c1.5 0 2.9.5 4 1.4l2.7-2.7A9.8 9.8 0 0 0 3.2 7.3z"/>
      <path fill="#4CAF50" d="M12 21.8c2.7 0 5.1-1 6.8-2.6l-3.1-2.6c-.9.7-2.1 1.1-3.7 1.1-2.9 0-5.4-1.9-6.3-4.6l-3.2 2.5A9.8 9.8 0 0 0 12 21.8z"/>
      <path fill="#1976D2" d="M21.8 10.2H12v3.8h5.6c-.3 1.3-1 2.3-2 3l3.1 2.6c1.8-1.7 3-4.2 3-7.4 0-.7-.1-1.3-.2-2z"/>
    </svg>
  );
}
