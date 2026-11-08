import { describe, it, expect } from 'vitest';
import { calculateCompositePoints, calculateConsecutiveStreak, toCalendarDateString } from '../js/scoring.js';

describe('Scoring & Streak Logic Suite', () => {
  describe('calculateCompositePoints (80/20 Formula)', () => {
    it('accurately computes 80% LeetCode and 20% Platform points', () => {
      // LeetCode: 10 Easy (100) + 4 Medium (100) + 2 Hard (100) = 300 lcPoints
      // 80% of 300 = 240
      const lc = { easy: 10, medium: 4, hard: 2 };

      // Platform: 5 Easy (50) + 2 Medium (50) + 1 Hard (50) + 2 Topics (80) = 230 mythPoints
      // 20% of 230 = 46
      const myth = { easy: 5, medium: 2, hard: 1, completedTopics: 2 };

      const result = calculateCompositePoints(lc, myth);

      expect(result.lcPoints).toBe(300);
      expect(result.mythPoints).toBe(230);
      expect(result.compositeScore).toBe(286); // 240 + 46
    });

    it('handles zero inputs gracefully', () => {
      const result = calculateCompositePoints({}, {});
      expect(result.lcPoints).toBe(0);
      expect(result.mythPoints).toBe(0);
      expect(result.compositeScore).toBe(0);
    });

    it('caps compositePoints at 10,000 max', () => {
      const hugeLc = { easy: 1000, medium: 1000, hard: 1000 };
      const hugeMyth = { easy: 500, medium: 500, hard: 500, completedTopics: 100 };
      const result = calculateCompositePoints(hugeLc, hugeMyth);
      expect(result.compositeScore).toBe(10000);
    });
  });

  describe('calculateConsecutiveStreak', () => {
    const fixedToday = new Date('2026-11-08T12:00:00Z');

    it('returns 0 for empty or invalid activity history', () => {
      expect(calculateConsecutiveStreak([], fixedToday)).toBe(0);
      expect(calculateConsecutiveStreak(null, fixedToday)).toBe(0);
    });

    it('returns 1 if the user was only active today', () => {
      const entries = ['2026-11-08'];
      expect(calculateConsecutiveStreak(entries, fixedToday)).toBe(1);
    });

    it('computes 4 consecutive days if active today and previous 3 days', () => {
      const entries = [
        '2026-11-08', // today
        '2026-11-07', // yesterday
        '2026-11-06', // -2d
        '2026-11-05', // -3d
      ];
      expect(calculateConsecutiveStreak(entries, fixedToday)).toBe(4);
    });

    it('keeps streak alive if active yesterday even if not yet active today', () => {
      const entries = [
        '2026-11-07', // yesterday
        '2026-11-06', // -2d
        '2026-11-05', // -3d
      ];
      expect(calculateConsecutiveStreak(entries, fixedToday)).toBe(3);
    });

    it('resets streak to 0 if inactive yesterday and today (streak broken)', () => {
      const entries = [
        '2026-11-06', // 2 days ago (missed yesterday and today)
        '2026-11-05',
        '2026-11-04',
      ];
      expect(calculateConsecutiveStreak(entries, fixedToday)).toBe(0);
    });

    it('deduplicates multiple entries on the same day', () => {
      const entries = [
        '2026-11-08T09:00:00Z',
        '2026-11-08T14:30:00Z',
        '2026-11-07T11:00:00Z',
        '2026-11-07T19:00:00Z',
      ];
      expect(calculateConsecutiveStreak(entries, fixedToday)).toBe(2);
    });
  });
});
