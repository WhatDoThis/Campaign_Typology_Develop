/**
 * lgu.syncAllScheduled (Technical WF — 일 1회 reconcile)
 * ======================================================
 * Workflow JavaScript activity 에서 Execute.
 *
 * [Dependencies]
 * =========
 * - lgu:lguFatigueRuleSync
 */

loadLibrary("lgu:lguFatigueRuleSync");
syncAllScheduled();
