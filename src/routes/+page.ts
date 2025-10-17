import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/stryktipset');
  const data = await res.json();

  return {
    poolId: data.poolId,
    matches: data.matches,
    lastUpdated: data.lastUpdated
  };
};
