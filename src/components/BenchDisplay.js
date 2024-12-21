import React from 'react';

const BenchDisplay = ({ bench }) => {
  // Sort bench with goalkeeper first
  const sortedBench = [...bench].sort((a, b) => a.element_type - b.element_type);

  return (
    <div className="mt-4">
      <h4 className="font-medium text-gray-900 mb-3">Bench</h4>
      <div className="flex gap-3">
        {sortedBench.map(player => (
          <div key={player.id} className="bg-white p-3 rounded-md shadow-sm flex flex-col items-center w-24">
            <span className="font-medium text-sm text-center">{player.web_name}</span>
            <span className="text-xs text-gray-600">£{(player.now_cost/10).toFixed(1)}m</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchDisplay;