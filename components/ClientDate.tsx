'use client';

import { useEffect, useState } from 'react';

export default function ClientDate({ date, format = 'full' }: { date: string | Date, format?: 'full' | 'time' | 'date' }) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    const d = new Date(date);
    if (format === 'time') {
      setFormatted(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else if (format === 'date') {
      setFormatted(d.toLocaleDateString());
    } else {
      setFormatted(d.toLocaleString());
    }
  }, [date, format]);

  return <>{formatted}</>;
}
