/**
 * ============================================================================
 * MYTH DSA Platform — Roster Claim Migration Script (Firebase Admin SDK)
 * ============================================================================
 * Reads verified student roster (roster.csv: roll, email, name) and provisions:
 * `myth_roster/{email}`: { roll, email, name, provisionedAt }
 * 
 * INVARIANTS:
 * - DRY_RUN=true by default. Zero database writes occur unless explicitly specified.
 * - Emails are strictly lowercased and trimmed.
 * - Enforces 13-digit numeric roll format: ^[0-9]{13}$
 * - Zero service account credentials committed to git.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.env.DRY_RUN !== 'false';
const ROSTER_PATH = process.env.ROSTER_PATH || path.resolve(__dirname, '../roster.csv');
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

console.log('================================================================');
console.log('MYTH DSA PLATFORM — ROSTER CLAIM MIGRATION ENGINE');
console.log(`MODE: ${DRY_RUN ? '🔍 DRY RUN (Simulated, no writes)' : '🚀 LIVE MIGRATION (Writing to Firestore)'}`);
console.log('================================================================\n');

if (!fs.existsSync(ROSTER_PATH)) {
  console.error(`❌ Error: Roster file not found at: ${ROSTER_PATH}`);
  console.info('💡 Please copy roster.example.csv to roster.csv and populate it with verified student emails.\n');
  process.exit(1);
}

const parseCSV = (content) => {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rollIdx = headers.indexOf('roll');
  const emailIdx = headers.indexOf('email');
  const nameIdx = headers.indexOf('name');

  if (rollIdx === -1 || emailIdx === -1) {
    throw new Error('CSV must contain "roll" and "email" headers.');
  }

  const records = [];
  const rollRegex = /^[0-9]{13}$/;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length >= 2 && parts[rollIdx] && parts[emailIdx]) {
      const roll = parts[rollIdx].trim();
      const email = parts[emailIdx].toLowerCase().trim();
      const name = nameIdx !== -1 && parts[nameIdx] ? parts[nameIdx].trim() : '';

      if (!rollRegex.test(roll)) {
        throw new Error(`Row ${i + 1}: Invalid roll number format '${roll}'. Must be exactly 13 digits.`);
      }

      records.push({ roll, email, name });
    }
  }
  return records;
};

const rawContent = fs.readFileSync(ROSTER_PATH, 'utf8');
const roster = parseCSV(rawContent);

console.log(`✓ Parsed and validated ${roster.length} student entries from ${path.basename(ROSTER_PATH)}:`);
roster.forEach((r, idx) => {
  console.log(`  [${idx + 1}] Roll: ${r.roll} | Email: ${r.email.padEnd(36)} | Name: ${r.name}`);
});
console.log('');

if (DRY_RUN) {
  console.log('🔍 [DRY-RUN] The following documents would be created in collection "myth_roster":');
  roster.forEach(r => {
    console.log(`  -> doc('myth_roster/${r.email}'): { roll: "${r.roll}", email: "${r.email}", name: "${r.name}", provisionedAt: "${new Date().toISOString()}" }`);
  });
  console.log('\n✅ Dry run completed successfully. Zero changes were written to Firestore.');
  console.log('To perform real database migration, set DRY_RUN="false" and provide FIREBASE_SERVICE_ACCOUNT_PATH.');
  process.exit(0);
}

// Live migration pathway
if (!SERVICE_ACCOUNT_PATH || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ Error: Service account JSON not found at: ${SERVICE_ACCOUNT_PATH}`);
  console.error('To run live migration, specify: FIREBASE_SERVICE_ACCOUNT_PATH="/path/to/service-account.json"');
  process.exit(1);
}

async function runLiveMigration() {
  const { default: admin } = await import('firebase-admin');
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const batch = db.batch();
  let count = 0;

  for (const student of roster) {
    const rosterRef = db.collection('myth_roster').doc(student.email);
    batch.set(rosterRef, {
      roll: student.roll,
      email: student.email,
      name: student.name,
      provisionedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    count++;
  }

  await batch.commit();
  console.log(`🚀 Successfully provisioned ${count} student records into myth_roster.`);
}

runLiveMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
