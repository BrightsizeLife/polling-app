// scripts/testFirebase.ts
// Temporary test script to verify Firebase connection
// Run this with: npm run dev (then open browser console)

import { auth, db, app } from '../src/firebase';

console.log('\n🔍 Firebase Connection Test\n');
console.log('✅ Firebase SDK initialized:', !!app);
console.log('✅ Auth object valid:', !!auth && typeof auth.currentUser !== 'undefined');
console.log('✅ Firestore object valid:', !!db && db.type === 'firestore');
console.log('\n📊 Details:');
console.log('   Project ID:', app?.options?.projectId);
console.log('   Auth state:', auth?.currentUser ? 'Logged in' : 'Not logged in');
console.log('   Firestore type:', db?.type);
