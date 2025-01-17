import React from 'react';

const SoccerField = ({ starting11, captains }) => {
  const gk = starting11.filter(p => p.element_type === 1);
  const def = starting11.filter(p => p.element_type === 2);
  const mid = starting11.filter(p => p.element_type === 3);
  const fwd = starting11.filter(p => p.element_type === 4);

  const isCaptain = (player) => captains.some(c => c.id === player.id);

  return (
    <div
      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg"
      style={{
        background: `
          repeating-linear-gradient(
            0deg,
            #00ae56, #00ae56 calc(100% / 8),
            #00ba5c calc(100% / 8), #00ba5c calc(200% / 8)
          )
        `,
      }}
    >
      {/* Field lines */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-2 border-l-2 border-r-2 border-white" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t-2 border-l-2 border-r-2 border-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 border-b-2 border-l-2 border-r-2 border-white" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 border-t-2 border-l-2 border-r-2 border-white" />
      </div>

      {/* Players */}
      <div className="relative h-full flex flex-col py-8">
        <div className="absolute top-[26%] left-0 right-0 flex justify-center">
          <div className="grid gap-2" style={{
            gridTemplateColumns: `repeat(${fwd.length}, minmax(0, 1fr))`,
            gap: '0.5rem'
          }}>
            {fwd.map(player => <PlayerCard key={player.id} player={player} isCaptain={isCaptain(player)} />)}
          </div>
        </div>

        <div className="absolute top-[46%] left-0 right-0 flex justify-center">
          <div className="grid gap-2" style={{
            gridTemplateColumns: `repeat(${mid.length}, minmax(0, 1fr))`,
            gap: '0.5rem'
          }}>
            {mid.map(player => <PlayerCard key={player.id} player={player} isCaptain={isCaptain(player)} />)}
          </div>
        </div>

        <div className="absolute top-[66%] left-0 right-0 flex justify-center">
          <div className="grid gap-2" style={{
            gridTemplateColumns: `repeat(${def.length}, minmax(0, 1fr))`,
            gap: '0.5rem'
          }}>
            {def.map(player => <PlayerCard key={player.id} player={player} isCaptain={isCaptain(player)} />)}
          </div>
        </div>

        <div className="absolute top-[86%] left-0 right-0">
          <div className="flex justify-center">
            {gk.map(player => <PlayerCard key={player.id} player={player} isCaptain={isCaptain(player)} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerCard = ({ player, isCaptain }) => {
  const isLongName = player.web_name.length > 10;

  return (
    <div
      className={`${isCaptain ? 'bg-yellow-200/90' : 'bg-white/90'
        } backdrop-blur-sm rounded-lg px-1 py-1 shadow-md transform transition-transform hover:scale-105
      w-14 h-10 sm:w-24 sm:h-14 flex flex-col justify-center items-center mx-1`}
    >
      <div
        className={`font-bold text-gray-800 text-center w-full ${isLongName ? 'text-[9px] sm:text-xs' : 'text-[9px] sm:text-sm'
          }`}
      >
        {player.web_name}
      </div>
      <div className="text-[8px] sm:text-xs text-gray-600 text-center">
        £{(player.now_cost / 10).toFixed(1)}m
      </div>
    </div>
  );
};

export default SoccerField;
