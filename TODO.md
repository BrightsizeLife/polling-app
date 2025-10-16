# Vibes MVP - Weekend TODO List
**For:** Derek's independent weekend work with ChatGPT
**Focus:** Energy System Backend + UI Refinements
**Goal:** Merge-ready PR by Monday morning

---

## 🎯 PRIMARY TASK: Energy Ledger Backend

### Context
Right now the "You" tab shows hardcoded `Rep: 0` and `Energy: 0`. We need a real energy system where users earn/spend energy for actions like creating questions and answering polls.

### What You're Building
A complete backend for tracking user energy with a transaction ledger (like a bank account with a transaction history).

---

### Step 1: Create New Branch
```bash
git checkout main
git pull origin main
git checkout -b feat/energy-backend
```

**Why:** Always start from latest main to avoid conflicts.

---

### Step 2: Design Firestore Schema

**Create these collections in Firebase Console** (for testing):

#### Collection: `/users/{uid}/energy`
```json
{
  "balance": 100,
  "updatedAt": "2025-10-15T12:00:00Z"
}
```

**Purpose:** Stores current energy balance for each user.
**Security Rule (add to firestore.rules):**
```javascript
match /users/{uid}/energy {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if request.auth != null && request.auth.uid == uid;
}
```

#### Collection: `/users/{uid}/ledger/{txId}`
```json
{
  "amount": -5,
  "reason": "Created poll question",
  "timestamp": "2025-10-15T12:00:00Z",
  "balanceAfter": 95
}
```

**Purpose:** Transaction log for all energy changes (audit trail).
**Security Rule (add to firestore.rules):**
```javascript
match /users/{uid}/ledger/{txId} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid;
  allow update, delete: if false; // Ledger is append-only
}
```

**Action:** Manually create a test document in Firebase Console for your own user to test with.

---

### Step 3: Add Helper Functions to `src/db.ts`

Open `src/db.ts` and add these functions at the bottom:

#### 3A. Get Current Energy Balance
```typescript
/**
 * Get the current energy balance for a user.
 * Returns 100 if no energy document exists (first-time user).
 */
export async function getEnergy(uid: string): Promise<number> {
  const energyRef = doc(db, `users/${uid}/energy`);
  const energySnap = await getDoc(energyRef);

  if (!energySnap.exists()) {
    // First-time user: initialize with 100 energy
    await setDoc(energyRef, {
      balance: 100,
      updatedAt: serverTimestamp()
    });
    return 100;
  }

  return energySnap.data().balance;
}
```

**What it does:** Fetches the user's energy balance. If they don't have one yet, creates it with 100 energy (starting balance).

**Required imports:** Add these if not already present:
```typescript
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
```

---

#### 3B. Spend Energy
```typescript
/**
 * Deduct energy from a user's balance and log the transaction.
 * Throws error if insufficient energy.
 */
export async function spendEnergy(
  uid: string,
  amount: number,
  reason: string
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Get current balance
  const currentBalance = await getEnergy(uid);

  // Check if user has enough energy
  if (currentBalance < amount) {
    throw new Error(`Insufficient energy. You have ${currentBalance}, need ${amount}`);
  }

  // Calculate new balance
  const newBalance = currentBalance - amount;

  // Update energy document
  const energyRef = doc(db, `users/${uid}/energy`);
  await setDoc(energyRef, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  // Log transaction in ledger
  const ledgerRef = collection(db, `users/${uid}/ledger`);
  await addDoc(ledgerRef, {
    amount: -amount,  // Negative for spending
    reason,
    timestamp: serverTimestamp(),
    balanceAfter: newBalance
  });

  console.log(`[Energy] User ${uid} spent ${amount} energy (${reason}). New balance: ${newBalance}`);
}
```

**What it does:** Deducts energy from balance and creates a transaction record in the ledger.

**Error handling:** Throws error if user doesn't have enough energy.

---

#### 3C. Earn Energy
```typescript
/**
 * Add energy to a user's balance and log the transaction.
 */
export async function earnEnergy(
  uid: string,
  amount: number,
  reason: string
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Get current balance
  const currentBalance = await getEnergy(uid);

  // Calculate new balance
  const newBalance = currentBalance + amount;

  // Update energy document
  const energyRef = doc(db, `users/${uid}/energy`);
  await setDoc(energyRef, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  // Log transaction in ledger
  const ledgerRef = collection(db, `users/${uid}/ledger`);
  await addDoc(ledgerRef, {
    amount: amount,  // Positive for earning
    reason,
    timestamp: serverTimestamp(),
    balanceAfter: newBalance
  });

  console.log(`[Energy] User ${uid} earned ${amount} energy (${reason}). New balance: ${newBalance}`);
}
```

**What it does:** Adds energy to balance and logs transaction.

---

#### 3D. Get Energy Ledger (Optional, but Nice)
```typescript
/**
 * Fetch recent energy transactions for a user.
 * Returns most recent transactions first.
 */
export async function getEnergyLedger(
  uid: string,
  maxResults: number = 20
): Promise<any[]> {
  const ledgerRef = collection(db, `users/${uid}/ledger`);
  const q = query(ledgerRef, orderBy('timestamp', 'desc'), limit(maxResults));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

**What it does:** Fetches the last 20 energy transactions for display in UI.

---

### Step 4: Update Firestore Rules

Open `firestore.rules` and add these rules before the closing braces:

```javascript
// User energy balance
match /users/{uid}/energy {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if request.auth != null && request.auth.uid == uid;
}

// User energy ledger (transaction history)
match /users/{uid}/ledger/{txId} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid;
  // Ledger is append-only: no updates or deletes
  allow update, delete: if false;
}
```

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

**Why append-only?** Ledger transactions should never be modified or deleted (audit trail integrity).

---

### Step 5: Wire Energy Display into "You" Tab

Open `src/App.tsx` and update the "You" tab section:

#### 5A. Add State and Effect to Fetch Energy
At the top of the `App()` component, add:

```typescript
import { useEffect } from 'react'; // Add to existing import
import { getEnergy } from './db'; // Add to existing import
import { auth } from './firebase'; // Should already be imported

// Inside App() component, after the activeTab state:
const [energy, setEnergy] = useState<number>(0);
const [loadingEnergy, setLoadingEnergy] = useState(true);

useEffect(() => {
  if (auth.currentUser) {
    getEnergy(auth.currentUser.uid)
      .then(balance => {
        setEnergy(balance);
        setLoadingEnergy(false);
      })
      .catch(err => {
        console.error('[Energy] Failed to load balance:', err);
        setLoadingEnergy(false);
      });
  }
}, [auth.currentUser]);
```

**What this does:** When the user is signed in, fetch their energy balance and store it in state.

#### 5B. Update Energy Display
Find the "You" tab stats section (around line 63-70) and replace the hardcoded `0` with live data:

```tsx
<div style={{
  background: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  display: 'flex',
  justifyContent: 'space-around',
  textAlign: 'center'
}}>
  <div>
    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>0</div>
    <div style={{ fontSize: '12px', color: '#6b7280' }}>Rep</div>
  </div>
  <div>
    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
      {loadingEnergy ? '...' : energy}
    </div>
    <div style={{ fontSize: '12px', color: '#6b7280' }}>Energy</div>
  </div>
</div>
```

**What changed:** The `Energy` stat now shows live data from Firestore instead of hardcoded `0`.

---

### Step 6: Test in Browser Console

Start dev server:
```bash
npm run dev
```

Open browser console (F12) and run these tests:

#### Test 1: Get Energy
```javascript
import { getEnergy } from './src/db.ts';
const uid = firebase.auth().currentUser.uid;
const balance = await getEnergy(uid);
console.log('Current energy:', balance);
```

**Expected:** Should return 100 (or your current balance if you already have data).

#### Test 2: Spend Energy
```javascript
import { spendEnergy } from './src/db.ts';
const uid = firebase.auth().currentUser.uid;
await spendEnergy(uid, 5, 'Test spending');
```

**Expected:** Energy balance should decrease by 5. Check Firebase Console to see the transaction in the ledger.

#### Test 3: Earn Energy
```javascript
import { earnEnergy } from './src/db.ts';
const uid = firebase.auth().currentUser.uid;
await earnEnergy(uid, 10, 'Test earning');
```

**Expected:** Energy balance should increase by 10.

#### Test 4: View Ledger
```javascript
import { getEnergyLedger } from './src/db.ts';
const uid = firebase.auth().currentUser.uid;
const ledger = await getEnergyLedger(uid, 5);
console.table(ledger);
```

**Expected:** Should show last 5 transactions with amounts, reasons, and timestamps.

---

### Step 7: Verify Build
```bash
npm run build
```

**Expected:** Build should succeed with no TypeScript errors.

---

### Step 8: Commit and Push
```bash
git add src/db.ts src/App.tsx firestore.rules
git commit -m "feat(energy): add energy ledger backend with live balance display

- Add getEnergy(), spendEnergy(), earnEnergy(), getEnergyLedger() to db.ts
- Wire live energy balance into You tab (replaces hardcoded 0)
- Add Firestore rules for /users/{uid}/energy and ledger
- Ledger is append-only for audit trail integrity

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feat/energy-backend
```

---

### Step 9: Create Pull Request
```bash
gh pr create --title "feat(energy): energy ledger backend + live balance" --body "$(cat <<'EOF'
## Summary
- Adds complete energy system backend with transaction ledger
- Users start with 100 energy (auto-initialized on first fetch)
- Live energy balance now displays in You tab

## Changes
- `src/db.ts`: Added `getEnergy()`, `spendEnergy()`, `earnEnergy()`, `getEnergyLedger()`
- `src/App.tsx`: Wired live energy balance (replaces hardcoded 0)
- `firestore.rules`: Added security rules for energy and ledger collections

## Test Plan
- [x] Energy initializes to 100 for new users
- [x] spendEnergy() deducts balance and logs transaction
- [x] earnEnergy() adds balance and logs transaction
- [x] Energy balance updates in You tab on page load
- [x] Firestore rules prevent unauthorized access
- [x] Build passes with no errors

## Security
- Energy data is private per-user (request.auth.uid check)
- Ledger is append-only (no updates/deletes allowed)

## Next Steps
- Wire spendEnergy() into CreateQuestion (charge 5 energy per question)
- Wire earnEnergy() into answer submissions (reward 2 energy per answer)
- Add ledger display in You tab (show recent transactions)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Result:** PR created with Vercel preview URL for testing.

---

### Step 10: Stop for Review

**DO NOT MERGE YET.** Wait for Monday review.

---

## 🧩 SECONDARY TASKS (If Time Permits)

### Task 2: Fix Firestore Rules for Questions
**Issue:** `/questions` collection is currently denied by default rule.

**Fix:** Add this rule to `firestore.rules`:
```javascript
// Poll questions - authenticated users can create and read
match /questions/{questionId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if false; // Questions are immutable once created
}
```

**Deploy:**
```bash
firebase deploy --only firestore:rules
```

**Test:** Try creating a question in the Ask tab. Should work now.

---

### Task 3: Refine You Tab - Show Context Readback
**Goal:** Display the user's saved context (age, city) in the You tab.

**Steps:**
1. Add `getContext(uid)` function to `src/db.ts`:
```typescript
export async function getContext(uid: string): Promise<any> {
  const contextRef = doc(db, `context/${uid}`);
  const contextSnap = await getDoc(contextRef);
  return contextSnap.exists() ? contextSnap.data() : null;
}
```

2. In `src/App.tsx`, fetch context in useEffect:
```typescript
const [context, setContext] = useState<any>(null);

useEffect(() => {
  if (auth.currentUser) {
    getContext(auth.currentUser.uid).then(setContext);
  }
}, [auth.currentUser]);
```

3. Display in "Your Profile" section:
```tsx
<div style={{ /* ...existing styles */ }}>
  {context ? (
    <div>
      <p><strong>Age:</strong> {context.age || 'Not set'}</p>
      <p><strong>City:</strong> {context.city || 'Not set'}</p>
    </div>
  ) : (
    <p style={{ color: '#6b7280', fontSize: '14px' }}>Profile settings coming soon</p>
  )}
</div>
```

---

### Task 4: My Questions View
**Goal:** Show list of questions created by the current user.

**Steps:**
1. Add query function to `src/db.ts`:
```typescript
export async function getMyQuestions(uid: string): Promise<any[]> {
  const questionsRef = collection(db, 'questions');
  const q = query(
    questionsRef,
    where('createdBy', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

2. Fetch in `src/App.tsx`:
```typescript
const [myQuestions, setMyQuestions] = useState<any[]>([]);

useEffect(() => {
  if (auth.currentUser) {
    getMyQuestions(auth.currentUser.uid).then(setMyQuestions);
  }
}, [auth.currentUser]);
```

3. Display in "My Questions" section:
```tsx
<div>
  <h3>My Questions</h3>
  {myQuestions.length === 0 ? (
    <p>Your created questions will appear here</p>
  ) : (
    <ul>
      {myQuestions.map(q => (
        <li key={q.id}>{q.text} ({q.type})</li>
      ))}
    </ul>
  )}
</div>
```

---

### Task 5: Start Explore Feed Placeholder
**Goal:** Connect Explore tab to Firestore (fetch all questions).

**Steps:**
1. Add query function to `src/db.ts`:
```typescript
export async function getAllQuestions(maxResults: number = 20): Promise<any[]> {
  const questionsRef = collection(db, 'questions');
  const q = query(questionsRef, orderBy('createdAt', 'desc'), limit(maxResults));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

2. Fetch in `src/App.tsx`:
```typescript
const [exploreQuestions, setExploreQuestions] = useState<any[]>([]);

useEffect(() => {
  if (activeTab === 'explore') {
    getAllQuestions().then(setExploreQuestions);
  }
}, [activeTab]);
```

3. Display in Explore tab:
```tsx
{activeTab === 'explore' && (
  <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
    {exploreQuestions.length === 0 ? (
      <div>🔍 Explore Feed Coming Soon</div>
    ) : (
      <ul>
        {exploreQuestions.map(q => (
          <li key={q.id}>
            <strong>{q.text}</strong> ({q.type})
          </li>
        ))}
      </ul>
    )}
  </div>
)}
```

---

### Task 6: Merge Tab Layout PR (Monday)
**Prerequisites:** Energy PR completed and reviewed.

**Steps:**
1. Checkout feat/context-flow:
```bash
git checkout feat/context-flow
```

2. Commit tab layout if not already done:
```bash
git add src/App.tsx
git commit -m "feat(ui): add Ask/Explore/You tabs"
git push origin feat/context-flow
```

3. Create PR:
```bash
gh pr create --title "feat(ui): base tabs Ask/Explore/You" --body "..."
```

4. Wait for Vercel preview and review.

5. Merge after approval.

---

## 🚨 Common Pitfalls & How to Avoid

### Pitfall 1: Import Errors
**Error:** `Could not resolve './db' from 'src/App.tsx'`
**Fix:** Make sure you added the functions to `src/db.ts` and exported them with `export async function`.

### Pitfall 2: Firebase Not Initialized
**Error:** `Cannot read property 'firestore' of undefined`
**Fix:** Make sure `src/firebase.ts` is imported before using Firestore functions.

### Pitfall 3: Auth Not Ready
**Error:** `Cannot read property 'uid' of null`
**Fix:** Always check `auth.currentUser` exists before calling functions that need uid.

### Pitfall 4: Firestore Rules Block Request
**Error:** `Missing or insufficient permissions`
**Fix:** Make sure you deployed the updated firestore.rules with `firebase deploy --only firestore:rules`.

### Pitfall 5: Async/Await Confusion
**Error:** `Cannot use await outside an async function`
**Fix:** Wrap async code in `useEffect` with `.then()` chains, or use an async IIFE:
```typescript
useEffect(() => {
  (async () => {
    const balance = await getEnergy(uid);
    setEnergy(balance);
  })();
}, []);
```

---

## 📋 Checklist Before Calling It Done

- [ ] Energy functions added to `src/db.ts` with proper error handling
- [ ] Firestore rules updated and deployed
- [ ] Live energy balance displays in You tab (not hardcoded 0)
- [ ] Tested spendEnergy() and earnEnergy() in browser console
- [ ] Build passes with `npm run build` (no TypeScript errors)
- [ ] Committed changes with descriptive message
- [ ] Pushed to remote branch
- [ ] PR created with test plan and summary
- [ ] Vercel preview URL works and shows live energy
- [ ] Stopped for review (no merge yet)

---

## 🎓 Learning Resources

### Understanding Firestore Transactions
- [Firestore Subcollections](https://firebase.google.com/docs/firestore/data-model#subcollections)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)

### Understanding React Hooks
- [useEffect Hook](https://react.dev/reference/react/useEffect)
- [useState Hook](https://react.dev/reference/react/useState)

### Understanding Async/Await
- [MDN Async Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Promises in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

---

## 💬 How to Get Help from ChatGPT

### Good Prompt Examples
**✅ Good:** "I'm getting an error 'Cannot read property uid of null' on line 45 of App.tsx. Here's my code: [paste code]. What's wrong?"

**✅ Good:** "I added the getEnergy function to db.ts but it's not showing up when I import it in App.tsx. Here's my import statement: [paste]. What am I missing?"

**✅ Good:** "The energy balance shows 0 even though I created a document in Firebase Console. Here's my useEffect: [paste]. Can you help debug?"

### Bad Prompt Examples
**❌ Bad:** "It's not working."
**Why:** Too vague. What's not working? What error? What did you try?

**❌ Bad:** "Fix my code."
**Why:** Doesn't explain the problem or provide context.

**❌ Bad:** "How do I make the energy system?"
**Why:** The steps are already in this TODO. Be specific about which step you're stuck on.

---

**End of TODO List - Good luck, Derek! 🚀**
