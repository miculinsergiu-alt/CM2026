export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'user';
  total_points: number;
}

export interface Match {
  id: string;
  api_id?: number;
  team_home: string;
  team_away: string;
  start_time: string;
  score_home?: number;
  score_away?: number;
  status: 'scheduled' | 'live' | 'finished';
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home: number;
  predicted_away: number;
  points_earned: number;
  is_locked: boolean;
}
