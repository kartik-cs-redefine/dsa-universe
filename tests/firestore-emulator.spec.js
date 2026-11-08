import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

const PROJECT_ID = 'myth-rules-test';
const OWNER_UID = 'google_user_owner_123';
const ATTACKER_UID = 'google_user_attacker_456';
const ROLL = '2501640100454';

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
    }
  });

  it('1. Owner can claim an unclaimed roll and write their own profile', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    // Claim roll
    await assertSucceeds(
      ownerDb.collection('myth_rolls').doc(ROLL).set({
        uid: OWNER_UID,
        roll: ROLL,
        claimedAt: new Date().toISOString()
      })
    );

    // Write profile
    await assertSucceeds(
      ownerDb.collection('myth_users').doc(ROLL).set({
        name: 'Kartik Kumar',
        roll: ROLL,
        uid: OWNER_UID,
        authProvider: 'google',
        langTrack: 'cpp',
        codeMode: 'cpp',
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('2. Attacker cannot squat or overwrite an already claimed roll', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID).firestore();

    // Owner claims roll
    await assertSucceeds(
      ownerDb.collection('myth_rolls').doc(ROLL).set({
        uid: OWNER_UID,
        roll: ROLL,
        claimedAt: new Date().toISOString()
      })
    );

    // Attacker tries to squat the same roll
    await assertFails(
      attackerDb.collection('myth_rolls').doc(ROLL).set({
        uid: ATTACKER_UID,
        roll: ROLL,
        claimedAt: new Date().toISOString()
      })
    );
  });

  it('3. Attacker cannot write to another user\'s profile or progress', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID).firestore();

    // Owner claims roll
    await ownerDb.collection('myth_rolls').doc(ROLL).set({
      uid: OWNER_UID,
      roll: ROLL,
      claimedAt: new Date().toISOString()
    });

    // Attacker tries to overwrite owner's profile
    await assertFails(
      attackerDb.collection('myth_users').doc(ROLL).set({
        name: 'Hacked Name',
        roll: ROLL,
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Attacker tries to overwrite owner's progress
    await assertFails(
      attackerDb.collection('myth_progress').doc(ROLL).set({
        uid: ATTACKER_UID,
        completedTopics: ['hacked'],
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('4. Unauthenticated user is denied all writes and private reads', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();

    // Unauth attempt to claim roll
    await assertFails(
      unauthDb.collection('myth_rolls').doc(ROLL).set({
        uid: 'fake',
        roll: ROLL,
        claimedAt: new Date().toISOString()
      })
    );

    // Unauth attempt to read user profile
    await assertFails(
      unauthDb.collection('myth_users').doc(ROLL).get()
    );
  });

  it('5. Invalid fields and illegal score ranges are rejected', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    // Claim roll
    await ownerDb.collection('myth_rolls').doc(ROLL).set({
      uid: OWNER_UID,
      roll: ROLL,
      claimedAt: new Date().toISOString()
    });

    // Negative score should fail
    await assertFails(
      ownerDb.collection('myth_leaderboard').doc(ROLL).set({
        name: 'Kartik Kumar',
        roll: ROLL,
        uid: OWNER_UID,
        lcSolved: -10, // ILLEGAL
        platformSolved: 5,
        compositePoints: 100,
        updatedAt: new Date().toISOString()
      })
    );

    // Oversized score exceeding max limit should fail
    await assertFails(
      ownerDb.collection('myth_leaderboard').doc(ROLL).set({
        name: 'Kartik Kumar',
        roll: ROLL,
        uid: OWNER_UID,
        lcSolved: 999999, // ILLEGAL (max is 5000)
        platformSolved: 5,
        compositePoints: 100,
        updatedAt: new Date().toISOString()
      })
    );

    // Attempting to inject email into leaderboard should fail (PII prevention)
    await assertFails(
      ownerDb.collection('myth_leaderboard').doc(ROLL).set({
        name: 'Kartik Kumar',
        roll: ROLL,
        uid: OWNER_UID,
        email: 'secret@gmail.com', // FORBIDDEN IN LEADERBOARD
        lcSolved: 50,
        platformSolved: 5,
        compositePoints: 100,
        updatedAt: new Date().toISOString()
      })
    );
  });
});
