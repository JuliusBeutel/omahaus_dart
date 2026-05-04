import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    createSession()
      .then(({ sessionId }) => navigate(`/display/${sessionId}`, { replace: true }))
      .catch(console.error);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full bg-base">
      <span className="text-muted text-lg">Verbinde...</span>
    </div>
  );
}
