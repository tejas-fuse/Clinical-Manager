import { HOLIDAYS } from '../constants/config';

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

export const getHolidayName = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return HOLIDAYS[`${month}-${day}`] || null;
};
