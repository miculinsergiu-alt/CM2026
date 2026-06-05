import { useState, useEffect } from 'preact/hooks';

const API_URL = 'https://cm2026flex2-backend.onrender.com/api'; // Actualizează cu URL-ul backend-ului tău real de pe Render

export function useMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/matches`)
      .then(res => res.json())
      .then(data => { setMatches(data); setLoading(false); });
  }, []);

  return { matches, loading };
}

export function useLeaderboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => { setProfiles(data); setLoading(false); });
  }, []);

  return { profiles, loading };
}

export function useProfile(participantId: string | undefined) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!participantId) { setLoading(false); return; }
    fetch(`${API_URL}/profile/${participantId}`)
      .then(res => res.json())
      .then(data => { setProfile(data); setLoading(false); });
  }, [participantId]);

  return { profile, loading };
}

export function useUserPredictions(participantId: string | undefined) {
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!participantId) { setLoading(false); return; }
    fetch(`${API_URL}/predictions/${participantId}`)
      .then(res => res.json())
      .then(data => {
        const predMap: Record<string, { home: number; away: number }> = {};
        data.forEach((p: any) => {
          predMap[p.match_id] = { home: p.predicted_home, away: p.predicted_away };
        });
        setPredictions(predMap);
        setLoading(false);
      });
  }, [participantId]);

  return { predictions, loading };
}

export function useAdminData() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/participants`).then(res => res.json()),
      fetch(`${API_URL}/matches`).then(res => res.json())
    ]).then(([pData, mData]) => {
      setParticipants(pData);
      setMatches(mData);
      setLoading(false);
    });
  }, []);

  return { participants, matches, loading };
}
