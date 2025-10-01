# ✅ Auth Migration Progress

## Completed Gates (0-5)

✅ **Gate 0:** Source files verified
✅ **Gate 1:** Dependencies pinned (`firebase@12.3.0`, `react-firebase-hooks@5.1.1`)
✅ **Gate 2:** Firebase client init copied (v9+ modular, singleton)
✅ **Gate 3:** Auth types and AuthGate component added
✅ **Gate 4:** App wired with AuthGate (no router needed)
✅ **Gate 5:** `.env.example` created, `.gitignore` verified

**Git tags created:** `gate-1-deps`, `gate-2-firebase-init`, `gate-3-auth-ui`, `gate-4-routing`, `gate-5-env`

---

## 🔥 GATE 6: Firebase Console Setup (YOU DO THIS)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Create a project"** or select existing project
3. Name it: `polling-app` (or your preferred name)
4. Disable Google Analytics (optional for now)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In left sidebar → **Authentication** → Click **"Get started"**
2. Click **"Sign-in method"** tab
3. Enable **Email/Password:**
   - Click "Email/Password"
   - Toggle **"Enable"** → Save
4. Enable **Google:**
   - Click "Google"
   - Toggle **"Enable"**
   - Set public-facing name: "Polling App"
   - Choose support email
   - Save

### Step 3: Add Web App & Get Config

1. In Project Overview (home icon) → Click **Web icon** (`</>`)
2. Register app nickname: `polling-app-web`
3. **DO NOT** check "Firebase Hosting" (we're using Vercel)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "polling-app-abc123.firebaseapp.com",
  projectId: "polling-app-abc123",
  storageBucket: "polling-app-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};
```

### Step 4: Fill `.env.local`

1. Open `/Users/derekdebellis/Desktop/dev-projects/polling-app/.env.local`
2. Paste these values from your `firebaseConfig`:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=polling-app-abc123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=polling-app-abc123
VITE_FIREBASE_STORAGE_BUCKET=polling-app-abc123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Step 5: Authorize localhost

1. Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **"Authorized domains"**
3. Verify `localhost` is present (added by default)
4. If you use IP, click **"Add domain"** → `127.0.0.1`

**CHECKPOINT:** `.env.local` filled ✅

---

## 🧪 GATE 7: Local Smoke Test (YOU DO THIS)

### Run the app:

```bash
cd ~/Desktop/dev-projects/polling-app
npm run dev
```

### Test checklist:

- [ ] App loads at `http://localhost:5173` (no errors in browser console)
- [ ] See **AuthGate login screen** (gradient purple background)
- [ ] Click **"Continue with Google (popup)"** → OAuth flow opens
- [ ] Sign in with Google → redirected back to app
- [ ] See **user info in header** (email, name, photo)
- [ ] See **"🗳️ Polling App"** content (placeholder page)
- [ ] Click **"Sign out"** → back to login screen
- [ ] Refresh page → **still logged in** (persistence working)
- [ ] Try **email/password:**
  - Enter email + password (6+ chars)
  - First time → account created ✅
  - Second time → login works ✅
  - **Note:** May fail on Chrome localhost (browser security), but works in production

### If all tests pass:

```bash
git commit --allow-empty -m "gate-7: Local auth verified"
git tag gate-7-local-test
```

**STOP:** If any test fails, debug before proceeding.

---

## 🏗️ GATE 7.5: Verify Build (YOU DO THIS)

### Test production build:

```bash
npm run build
ls dist/  # Should see: index.html, assets/, vite.svg
npm run preview  # Opens http://localhost:4173
```

### Test in preview:

- [ ] Login works in production build
- [ ] No console errors
- [ ] User persistence works

### If build succeeds:

```bash
git commit --allow-empty -m "gate-7.5: Vite build verified"
git tag gate-7.5-build
```

---

## 🚀 GATE 8: Deploy to Vercel (YOU DO THIS)

### Link project:

```bash
vercel link
# Choose: Create new project
# Name: polling-app
```

### Add environment variables (IMPORTANT: Add to BOTH preview AND production):

Run each command **twice** (once for `preview`, once for `production`):

```bash
# 1. API Key
vercel env add VITE_FIREBASE_API_KEY preview
# Paste: AIza... (from .env.local)
vercel env add VITE_FIREBASE_API_KEY production
# Paste: AIza... (same value)

# 2. Auth Domain
vercel env add VITE_FIREBASE_AUTH_DOMAIN preview
# Paste: polling-app-abc123.firebaseapp.com
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Paste: polling-app-abc123.firebaseapp.com

# 3. Project ID
vercel env add VITE_FIREBASE_PROJECT_ID preview
vercel env add VITE_FIREBASE_PROJECT_ID production

# 4. Storage Bucket
vercel env add VITE_FIREBASE_STORAGE_BUCKET preview
vercel env add VITE_FIREBASE_STORAGE_BUCKET production

# 5. Messaging Sender ID
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production

# 6. App ID
vercel env add VITE_FIREBASE_APP_ID preview
vercel env add VITE_FIREBASE_APP_ID production
```

### Deploy to production:

```bash
vercel --prod
# Note the URL: https://polling-app-xyz.vercel.app
```

### Checkpoint:

```bash
git commit --allow-empty -m "gate-8: Deployed to Vercel"
git tag gate-8-deploy
```

**COPY YOUR VERCEL URL** — you'll need it for Gate 9!

---

## 🔓 GATE 9: Authorize Vercel Domain (YOU DO THIS)

### Add Vercel domain to Firebase:

1. Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Paste your Vercel URL: `polling-app-xyz.vercel.app` (without `https://`)
5. Click **"Add"**
6. If you have a custom domain, add that too

### Production smoke test:

Visit `https://polling-app-xyz.vercel.app` and test:

- [ ] Login screen loads (no CORS errors)
- [ ] **Google OAuth works** (popup or redirect)
- [ ] **Email/password works** (no Chrome localhost restrictions)
- [ ] After login, see user info in header
- [ ] Refresh page → **still logged in**
- [ ] Sign out → redirects to login
- [ ] Check browser console → **no auth errors**

### Final checkpoint:

```bash
git commit --allow-empty -m "gate-9: Production auth verified"
git tag gate-9-prod-verified
git push origin main --tags
```

---

## 🎉 SUCCESS!

**Auth layer fully migrated!** You can now:

1. Add polling features to `src/App.tsx`
2. Use `auth.currentUser` to get logged-in user
3. Use `useAuthState(auth)` from `react-firebase-hooks/auth` for reactive auth state
4. Access Firestore with `db` from `src/firebase.ts`

---

## 📚 Quick Reference

### Auth State Hook (in any component):

```typescript
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

function MyComponent() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Hello {user.email}!</div>;
}
```

### Sign Out:

```typescript
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

<button onClick={() => signOut(auth)}>Sign Out</button>
```

### Firestore Example:

```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// Create a poll
const createPoll = async (question: string, options: string[]) => {
  await addDoc(collection(db, 'polls'), {
    question,
    options,
    createdBy: auth.currentUser?.uid,
    createdAt: new Date(),
  });
};
```

---

## 🔮 Future: Admin SDK (When You Need Server Features)

If you later add server-side features:

1. Install: `npm i -E firebase-admin@12.0.0`
2. Firebase Console → **Project Settings** → **Service Accounts** → **Generate new private key**
3. Add to Vercel: `vercel env add FIREBASE_PRIVATE_KEY production`
4. Create `src/lib/firebaseAdmin.ts` with admin SDK init
5. Use **only in server API routes** (never expose to client)

**Not needed yet!** Skip until you add backend features.

---

## 🆘 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Firebase Console → Authentication → Authorized domains

### Email/password fails on Chrome localhost
- This is a known Chrome security restriction
- Try Firefox, Safari, or incognito mode
- Always works in production (Vercel)

### "Module not found: Can't resolve './firebase'"
- Make sure `.env.local` has all 6 variables
- Restart dev server: `npm run dev`

### Build fails with TypeScript errors
- Run: `npm run build` to see full error
- Check `tsconfig.app.json` includes `src/`
- Verify all imports use correct paths

---

**Ready to proceed? Start with Gate 6!** 🚀
