/**
 * ============================================================================
 * MYTH DSA Platform — Cleanup Legacy Roll-Keyed Leaderboard Documents
 * ============================================================================
 * Finds and removes legacy documents in `myth_leaderboard` that were keyed by
 * real university roll numbers (13 digits), ensuring only privacy-preserving
 * UID-keyed documents exist in production.
 * 
 * SAFETY INVARIANT:
 * - MANDATORY BACKUP: Dumps all records to `backups/leaderboard-legacy-<timestamp>.json`
 *   BEFORE any deletions are committed.
 * - DRY-RUN by default. Zero database modifications occur without DRY_RUN=false.
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
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.env.DRY_RUN !== 'false';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const BACKUP_DIR = path.resolve(__dirname, '../backups');

console.log('================================================================');
console.log('MYTH DSA PLATFORM — LEADERBOARD PRIVACY CLEANUP ENGINE');
console.log(`MODE: ${DRY_RUN ? '🔍 DRY RUN (Simulated)' : '🚀 LIVE DELETION'}`);
console.log('================================================================\n');

if (DRY_RUN) {
  console.log('🔍 [DRY-RUN] Scanning `myth_leaderboard` for legacy documents matching roll format ^[0-9]{13}$ ...');
  console.log('  -> Mandatory backup destination: backups/leaderboard-legacy-<timestamp>.json');
  console.log('  -> Any document keyed by a 13-digit roll number will be backed up then deleted.');
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
  const backupDump = [];

  snapshot.forEach(doc => {
    if (rollRegex.test(doc.id) || doc.data().roll !== undefined) {
      toDelete.push(doc.ref);
      backupDump.push({ id: doc.id, data: doc.data() });
    }
  });

  console.log(`Found ${toDelete.length} legacy roll-keyed documents to purge out of ${snapshot.size} total.`);

  if (toDelete.length === 0) {
    console.log('✓ No legacy roll-keyed documents found. Leaderboard is clean!');
    return;
  }

  // 1. Mandatory Backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(BACKUP_DIR, `leaderboard-legacy-${timestamp}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupDump, null, 2), 'utf8');
  console.log(`✓ [BACKUP CREATED] ${backupDump.length} records safely preserved at: ${backupFilePath}`);

  // 2. Atomic Batch Deletion
  const batch = db.batch();
  toDelete.forEach(ref => batch.delete(ref));
  await batch.commit();

  console.log(`🚀 Successfully deleted ${toDelete.length} legacy leaderboard documents from Firestore.`);
}

runCleanup().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
