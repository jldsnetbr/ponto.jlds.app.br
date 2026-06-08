import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export function Relogio() {
  const [agora, setAgora] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setAgora(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <p className="text-sm text-slate-400 capitalize">
        {agora.format('dddd, DD [de] MMMM [de] YYYY')}
      </p>
      <p className="text-4xl font-mono font-bold text-slate-100 mt-1">
        {agora.format('HH:mm:ss')}
      </p>
    </div>
  );
}
