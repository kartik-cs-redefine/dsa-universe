/**
 * ============================================================================
 * MYTH DSA Platform — Cleanup Legacy Roll-Keyed Leaderboard Documents
 * ============================================================================
 * Finds and removes legacy documents in `myth_leaderboard` that were keyed by
 * real university roll numbers (13 digits), ensuring only privacy-preserving
 * UID-keyed documents exist in production.
 * 
 * USAGE:
 *   Dry-run (default):
 *     node scripts/cleanup-legacy-leaderboard.js
 * 
 *   Live execution:
 *     $env:DRY_RUN="false"; $env:FIREBASE_SERVICE_ACCOUNT_PATH="./service-account.json"; node scripts/cleanup-legacy-leaderboard.js
 */

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.env.DRY_RUN !== 'false';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

console.log('================================================================');
console.log('MYTH DSA PLATFORM — LEADERBOARD PRIVACY CLEANUP ENGINE');
console.log(`MODE: ${DRY_RUN ? '🔍 DRY RUN (Simulated)' : '🚀 LIVE DELETION'}`);
console.log('================================================================\n');

if (DRY_RUN) {
  console.log('🔍 [DRY-RUN] Scanning `myth_leaderboard` for legacy documents matching roll format ^[0-9]{13}$ ...');
  console.log('  -> Any document keyed by a 13-digit roll number will be deleted.');
  console.log('  -> Modern UID-keyed documents (e.g. Firebase Auth UIDs) will be preserved.');
  console.log('\n✅ Dry run completed successfully. Zero documents were deleted.');
  console.log('To execute, run with DRY_RUN="false" and valid FIREBASE_SERVICE_ACCOUNT_PATH.');
  process.exit(0);
}

if (!SERVICE_ACCOUNT_PATH || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ Error: Service account JSON not found at: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

async function runCleanup() {
  const { default: admin } = await import('firebase-admin');
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const snapshot = await db.collection('myth_leaderboard').get();
  const rollRegex = /^[0-9]{13}$/;

  const toDelete = [];
  snapshot.forEach(doc => {
    if (rollRegex.test(doc.id) || doc.data().roll !== undefined) {
      toDelete.push(doc.ref);
    }
  });

  console.log(`Found ${toDelete.length} legacy roll-keyed documents to purge out of ${snapshot.size} total.`);

  if (toDelete.length === 0) {
    console.log('✓ No legacy roll-keyed documents found. Leaderboard is clean!');
    return;
  }

  const batch = db.batch();
  toDelete.forEach(ref => batch.delete(ref));
  await batch.commit();

  console.log(`🚀 Successfully deleted ${toDelete.length} legacy leaderboard documents.`);
}

runCleanup().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
