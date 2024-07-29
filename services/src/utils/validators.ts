export function isDateValid(dateStr: string) {
  const d = new Date(dateStr);

  return d instanceof Date && !isNaN(d.getTime());
}
