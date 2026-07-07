export function getProgressPercent(completedCount, totalCount) {
  if (totalCount <= 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}
