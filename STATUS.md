# Vibes MVP - Status Report
**Generated:** 2025-10-15
**Branch:** main
**Commit:** 8cb40fe
**Production:** https://polling-app-mu.vercel.app

---

## ✅ Completed Features (Merged to Main)

### 1. Authentication & Auth Gating (PR #1)
**Commit:** dbfdb68
**Merged:** 2025-10-14
**Files Changed:** 12 files, +677 LOC

**What's Live:**
- Firebase Auth with Google OAuth (sign in/out)
- `useAuthReady()` hook prevents UI flicker during auth initialization
- `AuthGate.tsx` wraps entire app, shows sign-in screen when logged out
- `browserLocalPersistence` keeps users signed in across sessions
- Friendly 🔒 lock screen for unauthenticated users on protected pages

**Key Files:**
- `src/firebase.ts` - Firebase initialization with Google OAuth provider
- `src/AuthGate.tsx` - Top-level auth wrapper (148 LOC)
- `src/hooks/useAuthReady.ts` - Hook to prevent auth flicker (36 LOC)

**Firebase Collections Touched:** None (auth only)

---

### 2. Question Creator (PR #2)
**Commit:** 522e70f
**Merged:** 2025-10-14
**Files Changed:** 3 files, +490 LOC

**What's Live:**
- Full question creation form in "Ask" tab
- 4 question types: Single Choice, Rating Scale, Numeric Input, Date Picker
- Client-side validation: text required, options for single, min<max for numeric/rating
- Writes to `/questions` collection in Firestore
- Success/error feedback with auto-dismiss

**Key Files:**
- `src/questions/CreateQuestion.tsx` - Question form component (403 LOC)
- `src/db.ts` - `createQuestion()` helper function (87 LOC)
- `src/App.tsx` - Wired Ask tab to render CreateQuestion

**Firebase Collections:**
- `/questions` - Stores created poll questions
  - Fields: `text`, `type`, `createdBy`, `createdAt`, `options[]`, `min`, `max`
  - Security: Auth required to create (enforced by Firestore rules - see note below)

**⚠️ Known Issue:** Firestore rules currently deny all writes to `/questions` by default (line 8 of firestore.rules). Need to add explicit allow rule for authenticated question creation.

---

### 3. User Context & Onboarding (PR #3)
**Commit:** 8cb40fe (HEAD)
**Merged:** 2025-10-14
**Files Changed:** 6 files, +182 LOC

**What's Live:**
- Optional age/city context form in "You" tab
- `saveContext()` writes to private `/context/{uid}` collection
- `markOnboardingDone()` sets onboarding flag in `/users/{uid}/meta/onboarding`
- Firestore rules deployed: context data is private per-user

**Key Files:**
- `src/context/ContextForm.tsx` - Age/city form (not found in current tree - may be uncommitted)
- `src/db.ts` - `saveContext()` and `markOnboardingDone()` helpers (updated)
- `firestore.rules` - Security rules deployed to production

**Firebase Collections:**
- `/context/{uid}` - Private user context (age, city)
  - Security: User can only read/write their own data
- `/users/{uid}/meta/onboarding` - Onboarding completion marker
  - Security: User can only read/write their own metadata

---

## 🧩 In-Progress Features (Unmerged Branches)

### 1. Base Tab Layout (feat/context-flow)
**Status:** LOCAL ONLY (not pushed)
**Files Modified:** 1 file (src/App.tsx)
**Line Count:** 129 lines

**What's Ready:**
- 3-tab navigation: 📝 Ask, 🔍 Explore, 👤 You
- Ask tab renders CreateQuestion component (working)
- Explore tab shows "Coming Soon" placeholder
- You tab shows Rep/Energy stats (hardcoded 0), profile/questions/answers placeholders
- Mobile-friendly design with active tab highlighting

**What's Missing:**
- Not committed or pushed to remote
- No PR created yet
- Needs testing on mobile devices

**Next Steps:**
- Commit changes: `git add src/App.tsx && git commit -m "feat(ui): add Ask/Explore/You tabs"`
- Push to remote: `git push origin feat/context-flow`
- Create PR with Vercel preview

---

### 2. Explore Feed (feat/explore-questions)
**Status:** BRANCH EXISTS (no commits)
**Files Changed:** 0

**What's Planned:**
- Fetch questions from `/questions` collection
- Display as scrollable feed
- Filter by question type
- Sort by newest/popular
- Click to view question details (future: link to answer flow)

**Not Started Yet.**

---

### 3. Answer Question Flow (remotes/origin/feat/answer-question)
**Status:** REMOTE BRANCH (not checked locally)
**Unknown State** - needs investigation

**What's Planned:**
- Component to render question based on type
- Single choice: Radio buttons
- Rating: Star/number picker
- Numeric: Number input
- Date: Calendar picker
- Submit answer to `/answers` collection

**Action Required:** Checkout branch and assess state.

---

## 🧠 Next Features (Planned)

### 1. Energy System Backend (HIGH PRIORITY)
**Branch:** feat/energy-backend (not created yet)
**Scope:** 150-200 LOC
**Estimated Time:** 2-3 hours

**Requirements:**
- Create `/users/{uid}/energy` document with current balance
- Create `/users/{uid}/ledger` subcollection for transaction history
- Helper functions in `src/db.ts`:
  - `getEnergy(uid): Promise<number>` - Read current balance
  - `spendEnergy(uid, amount, reason)` - Deduct energy, log transaction
  - `earnEnergy(uid, amount, reason)` - Add energy, log transaction
  - `getEnergyLedger(uid, limit)` - Fetch recent transactions
- Update "You" tab to show live energy balance (replace hardcoded 0)
- Add Firestore rules for `/users/{uid}/energy` and ledger

**Firestore Schema:**
```
/users/{uid}/energy
  { balance: number, updatedAt: timestamp }

/users/{uid}/ledger/{txId}
  { amount: number, reason: string, timestamp: timestamp, balanceAfter: number }
```

**Success Criteria:**
- User sees live energy balance in You tab
- Energy transactions are logged and queryable
- Firestore rules prevent unauthorized access

---

### 2. Reputation System (MEDIUM PRIORITY)
**Depends On:** Energy system
**Scope:** 100-150 LOC

**Requirements:**
- Similar structure to energy system
- `/users/{uid}/reputation` document
- Helper functions: `getReputation()`, `awardRep()`, `penalizeRep()`
- Display in You tab (replace hardcoded 0)

---

### 3. My Questions View (MEDIUM PRIORITY)
**Scope:** 80-120 LOC

**Requirements:**
- Query `/questions` where `createdBy == uid`
- Display as list with question text, type, and creation date
- Show answer count (requires `/answers` collection first)
- Click to view question details

---

### 4. Explore Feed (MEDIUM PRIORITY)
**Branch:** feat/explore-questions (empty)
**Scope:** 150-200 LOC

**Requirements:**
- Fetch all questions from `/questions` (or paginated)
- Display as scrollable list
- Show question text, type, answer count
- Click to open answer modal/page
- Add loading states and empty state

---

### 5. Answer Question Flow (LOW PRIORITY)
**Branch:** feat/answer-question (unknown state)
**Scope:** 200-300 LOC

**Requirements:**
- Dynamic form renderer based on question type
- Submit to `/answers` collection
- Energy cost integration (deduct energy on answer submit)
- Show feedback after submission

---

## 🔐 Firebase Collections & Security Rules

### Deployed Collections (Production)
1. **`/context/{uid}`** - User context (age, city)
   - Rule: `request.auth.uid == uid` (private per user)

2. **`/users/{uid}/meta/{document}`** - User metadata (onboarding status)
   - Rule: `request.auth.uid == uid` (private per user)

3. **`/questions`** - Poll questions
   - ⚠️ **BUG:** Currently denied by default rule (line 8)
   - **Fix Required:** Add explicit allow for authenticated creates

### Pending Collections (Not Yet Created)
4. **`/users/{uid}/energy`** - Energy balance
   - Planned rule: `request.auth.uid == uid`

5. **`/users/{uid}/ledger/{txId}`** - Energy transaction history
   - Planned rule: `request.auth.uid == uid` (read-only after create)

6. **`/users/{uid}/reputation`** - Reputation score
   - Planned rule: `request.auth.uid == uid`

7. **`/answers`** - Question answers
   - Planned rule: Authenticated users can create; answers link to question via `questionId`

### Firestore Rules Status
**Last Deployed:** PR #3 merge (8cb40fe)
**Current State:** Lines 1-30 in firestore.rules
**Action Required:**
- Add `/questions` allow rule for authenticated creates
- Add energy/ledger rules before implementing energy system

---

## 🧱 Environment & Deployment Setup

### Vercel Production
**URL:** https://polling-app-mu.vercel.app
**Project:** polling-app
**Linked Repo:** https://github.com/BrightsizeLife/polling-app
**Auto-Deploy:** ✅ Enabled (pushes to main trigger production deploy)

**Environment Variables (Configured on Vercel):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**⚠️ DO NOT TOUCH:** These are production secrets. Use `.env.local` for local dev.

---

### Local Development
**Requirements:**
- Node.js 18+ (currently using v18.17.0)
- `.env.local` file with Firebase config (VITE_* variables)
- Firebase project: polling-app (project ID from env)

**Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build (outputs to /dist)
npm run preview      # Preview production build locally
```

**Current Build Status:** ✅ Passing (871ms, 50 modules)
**Warning:** Bundle size 586kB (Firebase SDK is large - consider code splitting later)

---

## 📊 Repository Stats
**Total Files:** 19 TypeScript/JSON files
**Total Commits:** 10 (on main)
**Open PRs:** 0
**Active Branches:**
- `main` (production)
- `feat/context-flow` (local, uncommitted changes)
- `feat/explore-questions` (remote, empty)
- `feat/answer-question` (remote, unknown state)

---

## 🚦 Safe-to-Edit Files for Weekend Work

### ✅ Safe to Edit (Won't Break Production)
- `src/App.tsx` - Tab layout (local changes not yet deployed)
- `src/db.ts` - Add new helper functions (energy, rep, etc.)
- `firestore.rules` - Add new collection rules (deploy with `firebase deploy --only firestore:rules`)
- `src/questions/*` - Create new question-related components
- `src/context/*` - Extend context form (if file exists)

### ⚠️ Edit Carefully (Changes Affect Production)
- `src/firebase.ts` - Firebase config (don't change unless necessary)
- `src/AuthGate.tsx` - Auth wrapper (working, avoid changes)
- `src/hooks/useAuthReady.ts` - Auth hook (working, avoid changes)

### 🚫 DO NOT EDIT
- `.env.local` - Local secrets (don't commit!)
- `.vercel/*` - Vercel config (managed by Vercel CLI)
- `package-lock.json` - Lock file (only change via npm install)
- `dist/*` - Build output (auto-generated)

---

## 🎯 Immediate Action Items

### Before Weekend Work
1. ✅ Commit tab layout changes: `git add src/App.tsx && git commit`
2. ✅ Push to remote: `git push origin feat/context-flow`
3. ✅ Create PR for tab layout with Vercel preview
4. ⚠️ Fix Firestore rules for `/questions` collection
5. ✅ Checkout and assess `feat/answer-question` branch state

### Weekend Focus: Energy System
1. Create `feat/energy-backend` branch from main
2. Add energy schema to Firestore (manually create test document)
3. Implement `getEnergy()`, `spendEnergy()`, `earnEnergy()` in db.ts
4. Update You tab to show live energy balance
5. Add Firestore rules for energy and ledger
6. Test energy transactions in console
7. Create PR with test plan

### Monday Review
1. Merge tab layout PR
2. Review energy system PR
3. Merge energy PR if tests pass
4. Plan Explore feed implementation

---

**End of Status Report**
