export function shared(): string {
  return 'shared';
}

export function isMoreThanAWeekApart(date1: Date, date2: Date): boolean {
  const msPerDay = 86400000; // Number of milliseconds in a day
  const differenceInMs = Math.abs(date1.getTime() - date2.getTime()); // Difference in milliseconds
  const differenceInDays = differenceInMs / msPerDay; // Convert to days
  return differenceInDays > 7;
}
