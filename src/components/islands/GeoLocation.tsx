import { useEffect, useState } from 'react';

interface LocationData {
  city?: string;
  country?: string;
  countryCode?: string;
}

export default function GeoLocation() {
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const cached = localStorage.getItem('geo-cache');
        if (cached) {
          const { data, expiry } = JSON.parse(cached);
          if (Date.now() < expiry) {
            setLocation(data.city || data.country || '');
            setLoading(false);
            return;
          }
        }
        const res = await fetch('https://api.ipdetails.io/');
        const data: LocationData = await res.json();
        const loc = data.city || data.country || '';
        localStorage.setItem('geo-cache', JSON.stringify({ data, expiry: Date.now() + 86400000 }));
        setLocation(loc);
      } catch {
        setLocation('');
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  if (loading || !location) return null;

  return (
    <span aria-live="polite" className="geo-target text-[var(--text-3)] text-[11px] font-[family-name:var(--font-mono)]">
      {location}
    </span>
  );
}
