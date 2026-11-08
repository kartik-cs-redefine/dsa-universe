/**
 * ============================================================================
 * MYTH DSA Platform — Scoring & Streak Pure Logic Engine
 * ============================================================================
 * Implements deterministic 80/20 weighted composite leaderboard scoring
 * and authentic consecutive-calendar-day streak calculations.
 */

/**
 * Calculates the 80/20 Weighted Composite Score:
 * - 80% Weight on LeetCode Performance: Easy = 10, Medium = 25, Hard = 50
 * - 20% Weight on Platform Performance: Easy = 10, Medium = 25, Hard = 50, Topic Bonus = 40
 * 
 * Formula: Math.round((0.80 * lcPoints) + (0.20 * mythPoints))
 * 
 * @param {Object} lc - LeetCode problem breakdown { easy, medium, hard }
 * @param {Object} myth - Platform problem breakdown { easy, medium, hard, completedTopics }
 * @returns {Object} Detailed score breakdown with points and composite score
 */
export function calculateCompositePoints(lc = {}, myth = {}) {
  const lcEasy = Math.max(0, parseInt(lc.easy || 0, 10));
  const lcMedium = Math.max(0, parseInt(lc.medium || 0, 10));
  const lcHard = Math.max(0, parseInt(lc.hard || 0, 10));
  const lcPoints = (lcEasy * 10) + (lcMedium * 25) + (lcHard * 50);

  const mythEasy = Math.max(0, parseInt(myth.easy || 0, 10));
  const mythMedium = Math.max(0, parseInt(myth.medium || 0, 10));
  const mythHard = Math.max(0, parseInt(myth.hard || 0, 10));
  const completedTopics = Math.max(0, parseInt(myth.completedTopics || 0, 10));
  const topicBonus = completedTopics * 40;
  const mythPoints = (mythEasy * 10) + (mythMedium * 25) + (mythHard * 50) + topicBonus;

  const compositeScore = Math.round((0.80 * lcPoints) + (0.20 * mythPoints));

  return {
    lcPoints,
    mythPoints,
    compositeScore: Math.min(compositeScore, 10000)
  };
}

/**
 * Converts a Date object or timestamp to a YYYY-MM-DD calendar string.
 * @param {Date|number|string} dateInput 
 * @returns {string} YYYY-MM-DD
 */
export function toCalendarDateString(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates authentic consecutive-calendar-day active learning streak.
 * 
 * Rules:
 * - A day counts if at least one problem was solved or session activity logged.
 * - If user was active today, streak counts backwards from today.
 * - If user was NOT active today, but was active yesterday, the current streak remains alive (counting backwards from yesterday).
 * - If user was active neither today nor yesterday, streak is broken (returns 0).
 * 
 * @param {Array<string|number|Date>} activityEntries - List of timestamps, ISO dates, or YYYY-MM-DD strings
 * @param {Date|string} [referenceDate=new Date()] - Reference today date for testing
 * @returns {number} Integer consecutive day streak
 */
export function calculateConsecutiveStreak(activityEntries = [], referenceDate = new Date()) {
  if (!Array.isArray(activityEntries) || activityEntries.length === 0) {
    return 0;
  }

  const activeDaySet = new Set();
  activityEntries.forEach(entry => {
    const dateStr = typeof entry === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry)
      ? entry
      : toCalendarDateString(entry);
    if (dateStr) activeDaySet.add(dateStr);
  });

  if (activeDaySet.size === 0) return 0;

  const ref = new Date(referenceDate);
  if (isNaN(ref.getTime())) return 0;

  // Normalize today to start of day
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const todayStr = toCalendarDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toCalendarDateString(yesterday);

  let currentPointer;
  if (activeDaySet.has(todayStr)) {
    currentPointer = new Date(today);
  } else if (activeDaySet.has(yesterdayStr)) {
    currentPointer = new Date(yesterday);
  } else {
    // Inactive today and yesterday -> streak broken
    return 0;
  }

  let streak = 0;
  while (true) {
    const checkStr = toCalendarDateString(currentPointer);
    if (activeDaySet.has(checkStr)) {
      streak++;
      currentPointer.setDate(currentPointer.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
