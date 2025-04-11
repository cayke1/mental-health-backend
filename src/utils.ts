export const OneMonthAheadUnix = () => {
  const futureDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  const ONE_MONTH_AHEAD = Math.floor(futureDate.getTime() / 1000);
  return ONE_MONTH_AHEAD;
};
