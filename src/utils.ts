export const OneMonthAheadUnix = () => {
  const futureDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  const ONE_MONTH_AHEAD = Math.floor(futureDate.getTime() / 1000);
  return ONE_MONTH_AHEAD;
};

export function toUrlFriendlyString(input: string): string {
  if (!input) return '';

  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeString(str: string): string {
  const normalized = str.replace(/[^a-zA-Z0-9 ]/g, '');
  return normalized;
}

export function extractKeyFromURL(url: string): string {
  const keyWord = 'sereno/';
  const index = url.indexOf(keyWord);
  if (index === -1) return '';
  return url.substring(index + keyWord.length);
}
