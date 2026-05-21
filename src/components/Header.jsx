import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Header({ profile, isAdmin, view, onChangeView }) {
  const canAdmin = isAdmin ?? profile?.isAdmin;

  return (
    <header className="bg-hatzalah-charcoal text-white safe-top">
      <div className="max-w-screen-sm mx-auto px-4 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-hatzalah-orange flex items-center justify-center font-extrabold text-xl shrink-0">
          +
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold leading-tight truncate">איחוד הצלה</div>
          <div className="text-xs text-white/60 leading-tight truncate">זמינות מתנדבים לסופ״ש</div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-white/70 hover:text-white px-2 py-1"
          aria-label="התנתק"
        >
          התנתק
        </button>
      </div>

      {canAdmin && (
        <nav className="max-w-screen-sm mx-auto px-4 pb-3 flex gap-2">
          <TabButton active={view === 'dashboard'} onClick={() => onChangeView('dashboard')}>
            הזמינות שלי
          </TabButton>
          <TabButton active={view === 'admin'} onClick={() => onChangeView('admin')}>
            ניהול ויצוא
          </TabButton>
        </nav>
      )}
    </header>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-sm font-semibold rounded-xl px-3 py-2 transition-colors ${
        active
          ? 'bg-hatzalah-orange text-white'
          : 'bg-white/10 text-white/80 hover:bg-white/15'
      }`}
    >
      {children}
    </button>
  );
}
