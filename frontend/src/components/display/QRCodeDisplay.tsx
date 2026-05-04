import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  sessionId: string;
}

export default function QRCodeDisplay({ sessionId }: QRCodeDisplayProps) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    fetch('/api/local-ip')
      .then((r) => r.json())
      .then((data: { ip: string }) => {
        const port = window.location.port ? `:${window.location.port}` : '';
        setOrigin(`http://${data.ip}${port}`);
      })
      .catch(() => {
        setOrigin(window.location.origin);
      });
  }, []);

  const url = origin ? `${origin}/controller/${sessionId}` : '';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <h1 className="text-3xl font-bold text-primary">Omahaus Dart-Zähler</h1>
      {url && (
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={url} size={240} />
        </div>
      )}
      <p className="text-muted text-sm">Scanne den QR-Code mit deinem Handy</p>
    </div>
  );
}
