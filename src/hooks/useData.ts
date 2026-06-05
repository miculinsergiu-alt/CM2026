import { useState, useEffect } from 'preact/hooks';
import { supabase } from '../lib/supabase';
import type { Match, Profile } from '../types';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('start_time', { ascending: true });

      if (data) setMatches(data);
      setLoading(false);
    }

    fetchMatches();
  }, []);

  return { matches, loading };
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading };
}

export function useLeaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('total_points', { ascending: false });

      if (data) setProfiles(data);
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  return { profiles, loading };
}
