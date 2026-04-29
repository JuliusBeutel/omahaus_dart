import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  sessionId: string;
}

export function QRCodeDisplay({ sessionId }: Props) {
  const [lanIp, setLanIp] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/local-ip')
      .then((r) => r.json())
      .then(({ ip }: { ip: string }) => setLanIp(ip))
      .catch(() => setLanIp(window.location.hostname));
  }, []);

  const host = lanIp ?? window.location.hostname;
  const url = `http://${host}:${window.location.port}/controller/${sessionId}`;

  return (
    <div style={styles.wrapper}>
      {lanIp ? (
        <QRCodeSVG value={url} size={220} bgColor="#ffffff" fgColor="#1a1a2e" />
      ) : (
        <div style={styles.placeholder} />
      )}
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
  placeholder: { width: 220, height: 220, background: '#0f3460', borderRadius: '8px' },
  label: { fontSize: '1.2rem', letterSpacing: '0.1em' },
  hint: { fontSize: '0.9rem', color: '#aaa' },
};
