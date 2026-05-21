# איחוד הצלה — זמינות סופ״ש

PWA לרישום זמינות מתנדבים לסופי שבוע.

Mobile-first React + Vite + Tailwind + Firebase, ב-RTL מלא, בצבעי המותג (כתום `#FF6600`, פחם `#1A1A1A`).

## הפעלה מקומית

```bash
npm install
cp .env.example .env.local   # מלאו ערכים מ-Firebase Console
npm run dev
```

הרצה לפרודקשן:

```bash
npm run build
npm run preview
```

## הגדרת Firebase

1. צרו פרויקט ב-[Firebase Console](https://console.firebase.google.com).
2. הפעילו **Authentication → Google**.
3. הפעילו **Firestore Database** (mode: production).
4. העתיקו את ערכי ה-Web App ל-`.env.local`.
5. פרסו את חוקי האבטחה מ-`firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

## מבנה נתונים

```
users/{uid}
  name: string
  memberId: string
  location: string
  email: string
  photoURL: string
  isAdmin: boolean
  createdAt, updatedAt: Timestamp

availability/{weekendId}     # weekendId = "weekend_YYYY_WW"
  weekendId: string
  fridayDate: "YYYY-MM-DD"
  saturdayDate: "YYYY-MM-DD"
  volunteers: string[]       # uids
  updatedAt: Timestamp
```

מסמך הזמינות מזוהה לפי שבוע ISO של יום שישי הקרוב — כך שכל סופ״ש מקבל מסמך חדש אוטומטית.

## פריסה אוטומטית (GitHub Actions → Firebase Hosting)

ה-workflow ב-`.github/workflows/deploy.yml` בונה את האפליקציה ומפרסם אותה ל-Firebase Hosting בכל push ל-`main`. Pull Requests מקבלים Preview Channel זמני עם URL נפרד (מקושר אוטומטית לתגובה ב-PR).

### הגדרה חד-פעמית

**1. עדכנו את `.firebaserc`** עם ה-Project ID שלכם:

```json
{
  "projects": { "default": "your-firebase-project-id" }
}
```

**2. צרו Service Account** עם הרשאות פריסה:

- ב-Firebase Console → ⚙️ Project settings → **Service accounts** → **Generate new private key** → הורידו את ה-JSON.
- *(לחלופין, ה-CLI: `firebase init hosting:github` עושה את כל זה אוטומטית כולל הוספת ה-Secret)*

**3. הגדירו GitHub Secrets** ב-`Settings → Secrets and variables → Actions`:

| Secret | מקור |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | תוכן ה-JSON של ה-Service Account (כולו) |
| `VITE_FIREBASE_API_KEY` | מ-Firebase Console → Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | אותו דבר |
| `VITE_FIREBASE_PROJECT_ID` | אותו דבר |
| `VITE_FIREBASE_STORAGE_BUCKET` | אותו דבר |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | אותו דבר |
| `VITE_FIREBASE_APP_ID` | אותו דבר |

**4. הפעילו Firebase Hosting** בקונסולה: Build → **Hosting** → **Get started**.

לאחר מכן, כל push ל-`main` יבנה ויפרוס אוטומטית ל-URL הציבורי `https://<project-id>.web.app`.

### פריסת חוקי Firestore אוטומטית (אופציונלי)

הוסיפו צעד נוסף ל-workflow אם רוצים גם פריסה אוטומטית של `firestore.rules`:

```yaml
      - name: Deploy Firestore rules
        if: github.event_name == 'push'
        run: |
          echo '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > /tmp/sa.json
          GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json \
            npx firebase-tools deploy --only firestore:rules \
            --project ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
```

## הענקת הרשאות אדמין

חוקי האבטחה לא מאפשרים למשתמש להגדיר את עצמו כאדמין. כדי להפוך מישהו לאדמין:

1. היכנסו ל-Firestore Console.
2. ב-`users/{uid}` עדכנו `isAdmin: true`.
3. בפעם הבאה שהמשתמש יפתח את האפליקציה, יופיע לו ה-Tab "ניהול ויצוא".

## PWA / התקנה למסך הבית

`vite-plugin-pwa` מייצר Service Worker ו-Manifest. ב-build, הקבצים מוגשים מ-`dist/`. במובייל יוצע "הוסף למסך הבית".

האייקון הנוכחי הוא SVG (`public/icon.svg`). לפני פריסה, מומלץ להוסיף `public/icon-192.png` ו-`public/icon-512.png` ולעדכן את `vite.config.js` ו-`index.html` כך שיפנו אליהם — לטובת תאימות טובה יותר לאנדרואיד וגרסאות iOS ישנות.

## עץ קבצים

```
.
├─ index.html
├─ vite.config.js              # Vite + vite-plugin-pwa + manifest
├─ tailwind.config.js          # צבעי United Hatzalah
├─ postcss.config.js
├─ firestore.rules             # חוקי אבטחה
├─ public/
│  └─ icon.svg                 # להחלפה ב-PNGs של 192/512 לפני פריסה
└─ src/
   ├─ main.jsx
   ├─ App.jsx                  # נתב פנימי (login → profile → dashboard/admin)
   ├─ index.css                # base + components של Tailwind
   ├─ firebase.js              # אתחול Firebase
   ├─ hooks/useAuth.js         # auth + profile listener
   ├─ utils/weekend.js         # חישוב סופ״ש + פורמט תאריך עברי
   └─ components/
      ├─ Header.jsx
      ├─ Login.jsx             # Google Sign-In
      ├─ ProfileForm.jsx       # שם / מספר מתנדב / מיקום
      ├─ Dashboard.jsx         # טוגל זמינות
      └─ AdminView.jsx         # רשימה חיה + יצוא WhatsApp
```
