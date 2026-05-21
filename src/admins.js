// Email allowlist of "permanent" admins. Anyone whose Google account email
// matches one of these is treated as admin in the UI, AND the Firestore rules
// must keep the same list in sync (see firestore.rules → isAdminEmail()).
//
// Compared case-insensitively.
export const ADMIN_EMAILS = [
  "eliyahu.lev@gmail.com",
  "akrichnetanel@gmail.com",
];

export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
