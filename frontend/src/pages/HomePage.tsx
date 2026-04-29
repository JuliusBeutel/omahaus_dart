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
    <div className="flex items-center justify-center min-h-screen bg-base">
      <p className="text-muted text-2xl">Session wird erstellt...</p>
    </div>
  );
}
