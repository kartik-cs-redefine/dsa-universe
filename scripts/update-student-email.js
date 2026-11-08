/**
 * ============================================================================
 * MYTH DSA Platform — Admin Script: Update Student Roster Email
 * ============================================================================
 * Safely updates a student's verified university email linked to their roll number.
 * Updates `myth_rolls/{roll}`, removes old `myth_roster/{oldEmail}`, and creates
 * `myth_roster/{newEmail}` atomically in a transaction/batch.
 * 
 * USAGE:
 *   Dry-run:
 *     node scripts/update-student-email.js --roll 2501640100454 --new-email kartik.new@university.edu
 * 
 *   Live execution:
 *     $env:DRY_RUN="false"; $env:FIREBASE_SERVICE_ACCOUNT_PATH="./service-account.json"; node scripts/update-student-email.js --roll 2501640100454 --new-email kartik.new@university.edu
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1].trim() : null;
}

const targetRoll = getArg('--roll');
const newEmail = getArg('--new-email')?.toLowerCase();
const DRY_RUN = process.env.DRY_RUN !== 'false';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!targetRoll || !newEmail) {
  console.error('❌ Error: Both --roll and --new-email arguments are required.');
  console.info('Example: node scripts/update-student-email.js --roll 2501640100454 --new-email student.new@university.edu');
  process.exit(1);
}

if (!/^[0-9]{13}$/.test(targetRoll)) {
  console.error(`❌ Error: Invalid roll number '${targetRoll}'. Must be exactly 13 digits.`);
  process.exit(1);
}

console.log('================================================================');
console.log('MYTH DSA PLATFORM — STUDENT EMAIL ROTATION ENGINE');
console.log(`TARGET ROLL: ${targetRoll}`);
console.log(`NEW EMAIL:   ${newEmail}`);
console.log(`MODE:        ${DRY_RUN ? '🔍 DRY RUN (Simulated)' : '🚀 LIVE EXECUTION'}`);
console.log('================================================================\n');

if (DRY_RUN) {
  console.log(`🔍 [DRY-RUN] The following operations would be executed:`);
  console.log(`  1. Query doc('myth_rolls/${targetRoll}') to locate existing claim.`);
  console.log(`  2. Delete old doc('myth_roster/<oldEmail>') if it exists.`);
  console.log(`  3. Update doc('myth_rolls/${targetRoll}'): { email: "${newEmail}", updatedAt: "${new Date().toISOString()}" }`);
  console.log(`  4. Set doc('myth_roster/${newEmail}'): { roll: "${targetRoll}", email: "${newEmail}" }`);
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
  const rollRef = db.collection('myth_rolls').doc(targetRoll);
  const rollDoc = await rollRef.get();

  if (!rollDoc.exists) {
    console.error(`❌ Error: No existing student claim found for roll ${targetRoll}`);
    process.exit(1);
  }

  const currentData = rollDoc.data();
  const oldEmail = currentData.email?.toLowerCase();
  console.log(`Found existing record: Name="${currentData.name}", CurrentEmail="${oldEmail}"`);

  const batch = db.batch();

  // 1. Delete old roster doc if exists
  if (oldEmail && oldEmail !== newEmail) {
    const oldRosterRef = db.collection('myth_roster').doc(oldEmail);
    batch.delete(oldRosterRef);
  }

  // 2. Set new roster doc
  const newRosterRef = db.collection('myth_roster').doc(newEmail);
  batch.set(newRosterRef, {
    roll: targetRoll,
    name: currentData.name || '',
    email: newEmail,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // 3. Update roll claim doc
  batch.update(rollRef, {
    email: newEmail,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
  console.log(`🚀 Successfully updated roll ${targetRoll} email from '${oldEmail}' to '${newEmail}'.`);
}

runLiveEmailUpdate().catch(err => {
  console.error('❌ Failed to update email:', err);
  process.exit(1);
});
