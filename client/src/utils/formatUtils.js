/**
 * Formats a dose number or string into a clean, human-readable label.
 * 
 * Examples:
 *  - 1 or '1' -> 'Dose #1'
 *  - '1-2' -> 'Dose #1-2'
 *  - 'Booster' -> 'Booster'
 *  - 'Booster 1' -> 'Booster 1'
 *  - 'Dose 1' -> 'Dose 1'
 */
export const formatDoseLabel = (dose) => {
  if (dose === null || dose === undefined || dose === '') return '';
  const str = String(dose).trim();
  if (/^\d+$/.test(str) || /^\d+\s*[-–—]\s*\d+$/.test(str)) {
    return `Dose #${str}`;
  }
  if (str.toLowerCase().startsWith('dose')) {
    return str;
  }
  return str;
};
