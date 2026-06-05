import { useState, useEffect } from 'preact/hooks';
import { supabase } from '../lib/supabase';

export function useAdminData() {
  const [participants, setParticipants] = useState<{id: string, name: string}[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: pData } = await supabase.from('participants').select('id, name');
      const { data: mData } = await supabase.from('matches').select('*').order('start_time');
      if (pData) setParticipants(pData);
      if (mData) setMatches(mData);
      setLoading(false);
    }
    fetchData();
  }, []);

  return { participants, matches, loading };
}
