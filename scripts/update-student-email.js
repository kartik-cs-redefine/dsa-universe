/**
 * ============================================================================
 * MYTH DSA Platform — Admin Script: Update Student Roster Email
 * ============================================================================
 * Safely updates a student's verified university email in `myth_roster/{email}`.
 * Removes old `myth_roster/{oldEmail}` and creates `myth_roster/{newEmail}`.
 * 
 * USAGE:
 *   Dry-run:
 *     node scripts/update-student-email.js --old-email student.old@university.edu --new-email student.new@university.edu
 * 
 *   Live execution:
 *     $env:DRY_RUN="false"; $env:FIREBASE_SERVICE_ACCOUNT_PATH="./service-account.json"; node scripts/update-student-email.js --old-email student.old@university.edu --new-email student.new@university.edu
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1].trim() : null;
}

const oldEmail = getArg('--old-email')?.toLowerCase().trim();
const newEmail = getArg('--new-email')?.toLowerCase().trim();
const DRY_RUN = process.env.DRY_RUN !== 'false';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!oldEmail || !newEmail) {
  console.error('❌ Error: Both --old-email and --new-email arguments are required.');
  console.info('Example: node scripts/update-student-email.js --old-email student.old@university.edu --new-email student.new@university.edu');
  process.exit(1);
}

console.log('================================================================');
console.log('MYTH DSA PLATFORM — STUDENT EMAIL ROTATION ENGINE');
console.log(`OLD EMAIL:   ${oldEmail}`);
console.log(`NEW EMAIL:   ${newEmail}`);
console.log(`MODE:        ${DRY_RUN ? '🔍 DRY RUN (Simulated)' : '🚀 LIVE EXECUTION'}`);
console.log('================================================================\n');

if (DRY_RUN) {
  console.log(`🔍 [DRY-RUN] The following operations would be executed:`);
  console.log(`  1. Query doc('myth_roster/${oldEmail}') to locate existing claim.`);
  console.log(`  2. Delete old doc('myth_roster/${oldEmail}').`);
  console.log(`  3. Set doc('myth_roster/${newEmail}') with existing student roll and name.`);
  console.log('\n✅ Dry run completed successfully. No changes were made to Firestore.');
  console.log('To execute, run with DRY_RUN="false" and valid FIREBASE_SERVICE_ACCOUNT_PATH.');
  process.exit(0);
}

if (!SERVICE_ACCOUNT_PATH || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ Error: Service account JSON not found at: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

async function runLiveEmailUpdate() {
  const { default: admin } = await import('firebase-admin');
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const oldRef = db.collection('myth_roster').doc(oldEmail);
  const oldDoc = await oldRef.get();

  if (!oldDoc.exists) {
    console.error(`❌ Error: No existing student record found for email: ${oldEmail}`);
    process.exit(1);
  }

  const currentData = oldDoc.data();
  console.log(`Found existing record: Roll="${currentData.roll}", Name="${currentData.name}"`);

  const batch = db.batch();
  batch.delete(oldRef);

  const newRef = db.collection('myth_roster').doc(newEmail);
  batch.set(newRef, {
    roll: currentData.roll,
    name: currentData.name,
    email: newEmail,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
  console.log(`🚀 Successfully rotated email for roll ${currentData.roll} to '${newEmail}'.`);
}

runLiveEmailUpdate().catch(err => {
  console.error('❌ Failed to update email:', err);
  process.exit(1);
});
