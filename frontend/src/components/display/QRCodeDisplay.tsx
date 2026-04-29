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
    <div style={styles.wrapper}>
      <QRCodeSVG value={url} size={220} bgColor="#ffffff" fgColor="#1a1a2e" />
      <p style={styles.label}>Session: <strong>{sessionId}</strong></p>
      <p style={styles.hint}>Scan zum Beitreten</p>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    background: '#16213e',
    borderRadius: '16px',
  },
  label: { fontSize: '1.2rem', letterSpacing: '0.1em' },
  hint: { fontSize: '0.9rem', color: '#aaa' },
};
