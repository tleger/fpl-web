import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import SoccerField from './components/SoccerField';
import BenchDisplay from './components/BenchDisplay';
import TopPlayersTable from './components/TopPlayersTable.js';
import { getTeamPicks, getTopPlayersByPosition, optimizeTeam } from './api/client.ts';

const queryClient = new QueryClient();

function TeamOptimizer() {
  const [formData, setFormData] = useState({
    free_transfers: 1,
    total_budget: 100,
    must_include: [],
    must_exclude: [],
    fpl_id: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await optimizeTeam({
        existingTeam: formData.current_team?.map(p => p.element),
        numFreeTransfers: formData.free_transfers,
        totalBudget: formData.total_budget * 10,
        numCaptains: 1
      });
      setResult(result);
    } catch (err) {
      console.error('Optimization error:', err);
      setError(err.response?.data?.detail ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||
        'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async () => {
    if (!formData.fpl_id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await getTeamPicks(formData.fpl_id);
      if (!response || !response.picks) {
        throw new Error('Invalid team data received');
      }
      setFormData(prev => ({
        ...prev,
        current_team: response.picks
      }));
    } catch (err) {
      console.error('Team loading error:', err);
      const errorMessage = err.response?.data?.detail ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||
        'Failed to load team. Please check your FPL ID.';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let newValue = value;

      switch (name) {
        case 'fpl_id':
          // fpl_id should be an integer
          newValue = parseInt(value, 10) || '';
          break;
        case 'total_budget':
          // total_budget should allow decimal values
          newValue = parseFloat(value) || '';
          break;
        default:
          // For all other fields, just use the raw value
          newValue = value;
      }

      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const totalValue = result?.full_squad?.reduce((sum, p) => sum + p.now_cost, 0) || 0;

  const { data: top_goalkeepers, isLoadingGkp, errorGkp } = useQuery(['topPlayers', 'gkp'], () => getTopPlayersByPosition('gkp'))
  const { data: top_defenders, isLoadingDef, errorDef } = useQuery(['topPlayers', 'def'], () => getTopPlayersByPosition('def'))
  const { data: top_midfielders, isLoadingMid, errorMid } = useQuery(['topPlayers', 'mid'], () => getTopPlayersByPosition('mid'))
  const { data: top_forwards, isLoadingFwd, errorFwd } = useQuery(['topPlayers', 'fwd'], () => getTopPlayersByPosition('fwd'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-8xl font-bold text-white text-center mb-12">FPL Genius</h1>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Free Transfers</label>
                  <input
                    type="number"
                    name="free_transfers"
                    value={formData.free_transfers}
                    onChange={handleInputChange}
                    min="0"
                    max="15"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Budget (£m)</label>
                  <input
                    type="number"
                    name="total_budget"
                    value={formData.total_budget}
                    onChange={handleInputChange}
                    min="90"
                    max="1100"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">FPL Team ID</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="number"
                      name="fpl_id"
                      value={formData.fpl_id}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your FPL ID"
                    />
                    <button
                      type="button"
                      onClick={loadTeam}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Load
                    </button>

                    {/* Only show the Clear button if there's an ID to clear */}
                    {formData.current_team?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            fpl_id: '',
                            current_team: null // or null, whichever makes sense for your UI
                          }));
                          setResult(null); // optional if you also want to clear the previous optimization result
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {formData.current_team && (
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-900">Current Team Loaded</h4>
                    <p className="text-sm text-blue-700">Team loaded with {formData.current_team.length} players</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Optimizing...' : 'Optimize Team'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Squad Details */}
              {result && (
                <div className="mt-8 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Bench</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {result.bench.map(player => (
                        <div key={player.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                          <span className="font-medium">{player.web_name}</span>
                          <span className="text-sm text-gray-600">£{(player.now_cost / 10).toFixed(1)}m</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-3">Captain</h4>
                    {result.captains.map(player => (
                      <div key={player.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                        <span className="font-medium">{player.web_name}</span>
                        <span className="text-sm text-gray-600">£{(player.now_cost / 10).toFixed(1)}m</span>
                      </div>
                    ))}
                  </div>

                  {result.transfers_in?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Transfers</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-green-600 mb-2">Transfers In</h5>
                          {result.transfers_in.map(player => (
                            <div key={player.id} className="flex justify-between text-green-600 text-sm">
                              <span>{player.web_name}</span>
                              <span>£{(player.now_cost / 10).toFixed(1)}m</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-red-600 mb-2">Transfers Out</h5>
                          {result.transfers_out.map(player => (
                            <div key={player.id} className="flex justify-between text-red-600 text-sm">
                              <span>{player.web_name}</span>
                              <span>£{(player.now_cost / 10).toFixed(1)}m</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {totalValue > 0 && (
                    <div className="text-sm text-gray-600">
                      Total Team Value: £{(totalValue / 10).toFixed(1)}m
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Soccer Field */}
            <div className="bg-gray-50 p-8">
              {result ? (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Starting XI</h3>
                  <SoccerField starting11={result.starting_11} captains={result.captains} />
                  <div className="mt-6">
                    <BenchDisplay bench={result.bench} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Optimize your team to see the starting XI
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Predicted Points (Next 5 Gameweeks)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Goalkeepers */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white text-center">Top Goalkeepers</h3>
              {isLoadingGkp && <p className="text-white text-center">Loading goalkeepers...</p>}
              {errorGkp && <p className="text-red-500 text-center">Error loading goalkeepers</p>}
              {top_goalkeepers && <TopPlayersTable players={top_goalkeepers} position="goalkeeper" />}
            </div>

            {/* Defenders */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white text-center">Top Defenders</h3>
              {isLoadingDef && <p className="text-white text-center">Loading defenders...</p>}
              {errorDef && <p className="text-red-500 text-center">Error loading defenders</p>}
              {top_defenders && <TopPlayersTable players={top_defenders} position="defender" />}
            </div>

            {/* Midfielders */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white text-center">Top Midfielders</h3>
              {isLoadingMid && <p className="text-white text-center">Loading midfielders...</p>}
              {errorMid && <p className="text-red-500 text-center">Error loading midfielders</p>}
              {top_midfielders && <TopPlayersTable players={top_midfielders} position="midfielder" />}
            </div>

            {/* Forwards */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white text-center">Top Forwards</h3>
              {isLoadingFwd && <p className="text-white text-center">Loading forwards...</p>}
              {errorFwd && <p className="text-red-500 text-center">Error loading forwards</p>}
              {top_forwards && <TopPlayersTable players={top_forwards} position="forward" />}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TeamOptimizer />
    </QueryClientProvider>
  );
}

export default App;