import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PlayerPrediction {
  fixture: number;
  event: number;
  kickoff_time: string;
  opponent_team: number;
  is_home: boolean;
  difficulty: number;
  prediction_4ft: number;
  prediction_8ft: number;
}

export interface TeamOptimization {
  full_squad: Player[];
  starting_11: Player[];
  bench: Player[];
  captains: Player[];
  transfers_in: Player[] | null;
  transfers_out: Player[] | null;
  trade_penalty: number;
}

export interface Player {
  id: number;
  now_cost: number;
  element_type: number;
  web_name: string;
  points_per_game: number;
  rolling_points: number;
  total_points: number;
  form: string;
  forecast_points_8ft_5gw: number;
}

// API functions
export const getTeamPicks = (teamId: string) => api.get(`/team/${teamId}/picks`).then(res => res.data);

export const getTopPlayersByPosition = (position: string) => api.get(`/top_players/${position}`).then(res => res.data);

export const optimizeTeam = ({
  existingTeam,
  numFreeTransfers = 2,
  totalBudget = 1000,
  numCaptains = 1
}: {
  existingTeam?: number[];
  numFreeTransfers?: number;
  totalBudget?: number;
  numCaptains?: number;
}) => 
  api.post<TeamOptimization>('/team/optimize', {
    existing_team: existingTeam,
    num_free_transfers: numFreeTransfers,
    total_budget: totalBudget,
    num_captains: numCaptains
  }).then(res => res.data);