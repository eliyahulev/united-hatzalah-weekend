import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import AdminView from './components/AdminView';
import Header from './components/Header';

export default function App() {
  const { authReady, user, profile, error, isAdmin } = useAuth();
  const [view, setView] = useState('dashboard');
  const [editing, setEditing] = useState(false);

  if (!authReady) return <SplashScreen />;
  if (!user) return <Login />;
  if (profile === undefined) return <SplashScreen />;

  // First-ever login: no profile doc yet → force the form.
  if (profile === null) {
    return <ProfileForm user={user} onSaved={() => { /* useAuth will pick up new doc */ }} />;
  }

  if (editing) {
    return (
      <ProfileForm
        user={user}
        existing={profile}
        onSaved={() => setEditing(false)}
      />
    );
  }

  const effectiveView = view === 'admin' && !isAdmin ? 'dashboard' : view;

  return (
    <div className="min-h-screen bg-hatzalah-gray-light">
      <Header
        profile={profile}
        isAdmin={isAdmin}
        view={effectiveView}
        onChangeView={setView}
      />
      {error && (
        <div className="max-w-screen-sm mx-auto px-4 pt-3">
          <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
            שגיאה בטעינת נתונים: {error.code || 'unknown'}
          </div>
        </div>
      )}
      {effectiveView === 'admin' ? (
        <AdminView />
      ) : (
        <Dashboard profile={profile} onEditProfile={() => setEditing(true)} />
      )}
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="min-h-screen bg-hatzalah-charcoal flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/70">
        <div className="w-14 h-14 rounded-2xl bg-hatzalah-orange flex items-center justify-center text-3xl font-extrabold animate-pulse">
          +
        </div>
        <div className="text-sm">טוען…</div>
      </div>
    </div>
  );
}
