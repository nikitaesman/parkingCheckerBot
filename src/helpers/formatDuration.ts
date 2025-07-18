export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}д`);
  if (hours > 0 || parts.length) parts.push(`${hours}ч`);
  if (minutes > 0 || parts.length) parts.push(`${minutes}м`);
  parts.push(`${seconds}с`);

  return parts.join(' ');
}