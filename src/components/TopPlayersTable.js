import React from 'react';

const TopPlayersTable = ({ players, position }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4 text-center capitalize">{position}s</h3>
      <table className="table-auto w-full text-sm text-left">
        <thead>
          <tr>
            <th className="px-4 py-2 font-semibold">Player</th>
            <th className="px-4 py-2 font-semibold">Cost (£m)</th>
            <th className="px-4 py-2 font-semibold">Predicted Points</th>
          </tr>
        </thead>
        <tbody>
          {players.slice(0, 10).map((player, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{player.web_name}</td>
              <td className="px-4 py-2">£{(player.now_cost / 10).toFixed(1)}</td>
              <td className="px-4 py-2">{player.forecast_points_8ft_5gw.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopPlayersTable;
