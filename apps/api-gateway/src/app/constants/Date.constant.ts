export const startOfDay = (dateInput: Date) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};
export const endOfDay = (dateInput: Date) => {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
};
