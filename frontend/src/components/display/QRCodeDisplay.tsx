import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  sessionId: string;
}

export function QRCodeDisplay({ sessionId }: Props) {
  const [origin, setOrigin] = useState(window.location.origin);

  useEffect(() => {
    fetch('/api/local-ip')
      .then((r) => r.ok ? r.json() : null)
      .then((data: { ip: string } | null) => {
        if (data?.ip) setOrigin(`http://${data.ip}:${window.location.port}`);
      })
      .catch(() => {});
  }, []);

  const url = `${origin}/controller/${sessionId}`;

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-2xl text-primary">
      <QRCodeSVG value={url} size={220} bgColor="#ffffff" fgColor="#0c1a08" />
      <p className="text-lg tracking-widest">Session: <strong>{sessionId}</strong></p>
      <p className="text-sm text-muted">Scan zum Beitreten</p>
    </div>
  );
}
