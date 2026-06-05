import { useState, useEffect } from 'preact/hooks';

const API_URL = 'https://cm2026flex2.onrender.com';

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

// Stubs for remaining exports to fix the build
export function useLeaderboard() { return { profiles: [], loading: false }; }
export function useProfile(userId: string | undefined) { return { profile: null, loading: false }; }
export function useUserPredictions(userId: string | undefined) { return { predictions: {}, loading: false }; }
