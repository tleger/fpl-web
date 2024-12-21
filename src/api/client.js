import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const getPlayers = () => api.get('/players').then(res => res.data);

export const getCurrentGameweek = () => api.get('/gameweek/current').then(res => res.data);

export const getTeamPicks = (teamId) => api.get(`/team/${teamId}/picks`).then(res => res.data);

export const getPlayerPredictions = (playerId, lastGw) => 
  api.get(`/predictions/player/${playerId}`, {
    params: { last_gw: lastGw }
  }).then(res => res.data);

export const getPlayerPredictionSummary = (playerId, lastGw) => 
  api.get(`/predictions/player/${playerId}/summary`, {
    params: { last_gw: lastGw }
  }).then(res => res.data);

export const optimizeTeam = ({
  existingTeam,
  numFreeTransfers = 2,
  totalBudget = 1000,
  numCaptains = 1
}) => 
  api.post('/team/optimize', {
    existing_team: existingTeam?.map(Number) || null,
    num_free_transfers: Number(numFreeTransfers),
    total_budget: Number(totalBudget),
    num_captains: Number(numCaptains)
  }).then(res => res.data);