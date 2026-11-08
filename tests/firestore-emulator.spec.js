import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

const PROJECT_ID = 'myth-rules-test-v2';
const VICTIM_UID = 'google_victim_uid_101';
const VICTIM_EMAIL = 'kartikkumar@university.edu';
const VICTIM_ROLL = '2501640100454';

const ATTACKER_UID = 'google_attacker_uid_202';
const ATTACKER_EMAIL = 'attacker@external.com';

describe('Firestore Security Rules Emulator Suite', () => {
  beforeAll(async () => {
    const rulesPath = path.resolve(__dirname, '../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: rules,
        host: '127.0.0.1',
        port: 8088
      }
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();

      // Seed verified roster claim via admin context (simulating Admin SDK script)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('myth_rolls').doc(VICTIM_ROLL).set({
          roll: VICTIM_ROLL,
          email: VICTIM_EMAIL,
          name: 'Kartik Kumar',
          provisionedAt: new Date().toISOString()
        });
      });
    }
  });

  it('1. Victim with verified email can read/write own profile, progress, notes, and scratchpad', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Profile write
    await assertSucceeds(
      victimDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: 'Kartik Kumar',
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        authProvider: 'google',
        langTrack: 'cpp',
        codeMode: 'cpp',
        updatedAt: new Date().toISOString()
      })
    );

    // Scratchpad create with bound docKey
    const probId = 'prob-reverse-list';
    const codeMode = 'cpp';
    const docKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(docKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: 'ListNode* reverseList(ListNode* head) { return head; }',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Scratchpad update
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(docKey).update({
        code: 'ListNode* reverseList(ListNode* head) { /* updated code */ return nullptr; }',
        updatedAt: new Date().toISOString()
      })
    );

    // Notes create with bound docKey
    const notesKey = `${VICTIM_ROLL}_${probId}`;
    await assertSucceeds(
      victimDb.collection('myth_notes').doc(notesKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        notes: '3-pointer approach with prev, curr, next',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('2. Attacker cannot overwrite victim\'s scratchpad (create and update paths)', async () => {
    // First, victim creates scratchpad
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const probId = 'prob-detect-cycle';
    const codeMode = 'cpp';
    const docKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    await victimDb.collection('myth_scratchpads').doc(docKey).set({
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'original victim code',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    });

    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Attacker create path on victim's key
    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(`${VICTIM_ROLL}_prob-spoofed_cpp`).set({
        roll: VICTIM_ROLL,
        probId: 'prob-spoofed',
        codeMode: 'cpp',
        code: 'hacked',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Attacker update path on victim's existing scratchpad
    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(docKey).update({
        code: 'hacked overwrite',
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('3. Attacker cannot write or update victim\'s notes', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Attacker tries to write note for victim roll
    await assertFails(
      attackerDb.collection('myth_notes').doc(`${VICTIM_ROLL}_prob-1`).set({
        roll: VICTIM_ROLL,
        probId: 'prob-1',
        notes: 'malicious note injection',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('4. Wrong Google user claiming an unclaimed roll via client is denied', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Client write to myth_rolls is strictly prohibited
    await assertFails(
      attackerDb.collection('myth_rolls').doc('9999999999999').set({
        roll: '9999999999999',
        email: ATTACKER_EMAIL,
        name: 'Attacker'
      })
    );
  });

  it('5. User with unverified email is denied access to roll-claimed data', async () => {
    const unverifiedDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: false // UNVERIFIED!
    }).firestore();

    await assertFails(
      unverifiedDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: 'Kartik Kumar',
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('6. Leaderboard read exposes no real roll number or email', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Attempting to write real roll into leaderboard MUST FAIL
    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: 'Kartik Kumar',
        uid: VICTIM_UID,
        roll: VICTIM_ROLL, // FORBIDDEN! Real roll must not be exposed
        lcSolved: 120,
        platformSolved: 25,
        compositePoints: 101,
        updatedAt: new Date().toISOString()
      })
    );

    // Attempting to write email into leaderboard MUST FAIL
    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: 'Kartik Kumar',
        uid: VICTIM_UID,
        email: VICTIM_EMAIL, // FORBIDDEN! Email must not be exposed
        lcSolved: 120,
        platformSolved: 25,
        compositePoints: 101,
        updatedAt: new Date().toISOString()
      })
    );

    // Valid anonymized leaderboard record (UID-keyed, name + scores only) SUCCEEDS
    await assertSucceeds(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: 'Kartik Kumar',
        uid: VICTIM_UID,
        lcSolved: 120,
        platformSolved: 25,
        compositePoints: 101,
        updatedAt: new Date().toISOString()
      })
    );

    // Reader can inspect document and verify absence of roll and email
    const readerDb = testEnv.authenticatedContext('any_student_uid', {
      email: 'student@university.edu',
      email_verified: true
    }).firestore();

    const snapshot = await readerDb.collection('myth_leaderboard').doc(VICTIM_UID).get();
    expect(snapshot.exists).toBe(true);
    const data = snapshot.data();
    expect(data.roll).toBeUndefined();
    expect(data.email).toBeUndefined();
    expect(data.name).toBe('Kartik Kumar');
    expect(data.compositePoints).toBe(101);
  });

  it('7. Oversize payloads and illegal list sizes are denied', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Code exceeding 50,000 characters
    const hugeCode = 'x'.repeat(50001);
    await assertFails(
      victimDb.collection('myth_scratchpads').doc(`${VICTIM_ROLL}_p1_cpp`).set({
        roll: VICTIM_ROLL,
        probId: 'p1',
        codeMode: 'cpp',
        code: hugeCode,
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // List exceeding 500 solved problems
    const hugeList = Array.from({ length: 501 }, (_, i) => `prob-${i}`);
    await assertFails(
      victimDb.collection('myth_progress').doc(VICTIM_ROLL).set({
        uid: VICTIM_UID,
        solvedProblems: hugeList,
        updatedAt: new Date().toISOString()
      })
    );
  });
});
