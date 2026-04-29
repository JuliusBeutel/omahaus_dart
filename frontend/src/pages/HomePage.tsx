import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../api/client';

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    createSession().then(({ sessionId }) => {
      navigate(`/display/${sessionId}`, { replace: true });
    });
  }, [navigate]);

  return (
    <div style={styles.center}>
      <p style={styles.text}>Session wird erstellt...</p>
    </div>
  );
}

const styles = {
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  text: { color: '#aaa', fontSize: '1.4rem' },
};
