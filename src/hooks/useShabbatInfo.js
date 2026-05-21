import { useEffect, useState } from 'react';
import { fetchHebrewDate, fetchUpcomingParasha } from '../utils/hebcal';

// Fetches parasha + Hebrew date in parallel from Hebcal.
// Silently no-ops on failure — these are UI niceties, not critical data.
export function useShabbatInfo() {
  const [hebrewDate, setHebrewDate] = useState(null);
  const [parasha, setParasha] = useState(null);

  useEffect(() => {
    const ctl = new AbortController();
    Promise.all([
      fetchHebrewDate(new Date(), { signal: ctl.signal }).catch(() => null),
      fetchUpcomingParasha({ signal: ctl.signal }).catch(() => null),
    ]).then(([dateInfo, parashaInfo]) => {
      if (ctl.signal.aborted) return;
      if (dateInfo) setHebrewDate(dateInfo);
      if (parashaInfo) setParasha(parashaInfo);
    });
    return () => ctl.abort();
  }, []);

  return { hebrewDate, parasha };
}
