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
 * - DRY-RUN by default: Actually reads the collection via Admin SDK, identifies
 *   matches, and prints the exact doc IDs without deleting anything.
 * 
 * USAGE:
 *   Dry-run (reads and logs live matches, zero writes):
 *     node scripts/cleanup-legacy-leaderboard.js
 * 
 *   Live execution:
 *     $env:DRY_RUN="false"; $env:FIREBASE_SERVICE_ACCOUNT_PATH="./service-account.json"; node scripts/cleanup-legacy-leaderboard.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.env.DRY_RUN !== 'false';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const BACKUP_DIR = path.resolve(__dirname, '../backups');

console.log('================================================================');
console.log('MYTH DSA PLATFORM — LEADERBOARD PRIVACY CLEANUP ENGINE');
console.log(`MODE: ${DRY_RUN ? '🔍 DRY RUN (Live Read, Zero Mutations)' : '🚀 LIVE DELETION'}`);
console.log('================================================================\n');

async function runCleanup() {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}...`);
    if (!getApps().length) {
      initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'your-prod-project-id' });
    }
  } else if (SERVICE_ACCOUNT_PATH && fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
  } else {
    // Attempt default application credentials
    console.log('Connecting via Google Cloud application default credentials / local project...');
    if (!getApps().length) {
      initializeApp({
        projectId: process.env.GCLOUD_PROJECT || 'your-prod-project-id'
      });
    }
  }

  const db = getFirestore();
  console.log('🔍 Scanning `myth_leaderboard` collection in Firestore...');
  const snapshot = await db.collection('myth_leaderboard').get();
  const rollRegex = /^[0-9]{13}$/;

  const toDelete = [];
  const backupDump = [];

  snapshot.forEach(doc => {
    const isRollKeyed = rollRegex.test(doc.id);
    const hasRollField = doc.data() && doc.data().roll !== undefined;
    if (isRollKeyed || hasRollField) {
      toDelete.push({ id: doc.id, ref: doc.ref });
      backupDump.push({ id: doc.id, data: doc.data() });
    }
  });

  console.log(`\n📊 Scan Report:`);
  console.log(`  • Total documents inspected: ${snapshot.size}`);
  console.log(`  • Legacy roll-keyed documents found: ${toDelete.length}`);

  if (toDelete.length > 0) {
    console.log(`\n📋 Document IDs identified for deletion:`);
    toDelete.forEach((item, idx) => {
      console.log(`    [${idx + 1}] ID: ${item.id}`);
    });
  } else {
    console.log('  • No legacy roll-keyed documents found. Collection is 100% UID-compliant!');
  }

  if (DRY_RUN) {
    console.log('\n✅ [DRY-RUN COMPLETE] Read-only scan succeeded.');
    console.log('  -> Zero documents were modified or deleted.');
    console.log('  -> To execute deletion with mandatory backup, run with DRY_RUN="false" and valid FIREBASE_SERVICE_ACCOUNT_PATH.');
    return;
  }

  if (toDelete.length === 0) {
    console.log('✓ Leaderboard is already clean. No deletions needed.');
    return;
  }

  // 1. Mandatory Backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(BACKUP_DIR, `leaderboard-legacy-${timestamp}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupDump, null, 2), 'utf8');
  console.log(`\n✓ [BACKUP CREATED] ${backupDump.length} records safely preserved at:\n  ${backupFilePath}`);

  // 2. Atomic Batch Deletion
  const batch = db.batch();
  toDelete.forEach(item => batch.delete(item.ref));
  await batch.commit();

  console.log(`\n🚀 Successfully deleted ${toDelete.length} legacy leaderboard documents from Firestore.`);
}

runCleanup().catch(err => {
  console.error('❌ Operation failed:', err);
  process.exit(1);
});
