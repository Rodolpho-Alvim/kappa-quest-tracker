import React from "react";

const TRADERS = [
  {
    id: "54cb50c76803fa8b248b4571",
    name: "Prapor",
  },
  {
    id: "54cb57776803fa99248b456e",
    name: "Therapist",
  },
  {
    id: "579dc571d53a0658a154fbec",
    name: "Fence",
  },
  {
    id: "58330581ace78e27b8b10cee",
    name: "Skier",
  },
  {
    id: "5935c25fb3acc3127c3d8cd9",
    name: "Peacekeeper",
  },
  {
    id: "5a7c2eca46aef81a7ca2145d",
    name: "Mechanic",
  },
  {
    id: "5ac3b934156ae10c4430e83c",
    name: "Ragman",
  },
  {
    id: "5c0647fdd443bc2504c2d371",
    name: "Jaeger",
  },
];

interface TraderCardProps {
  progress: Record<string, number>;
  setProgress: (value: Record<string, number>) => void;
}

export const TraderCard: React.FC<TraderCardProps> = ({
  progress,
  setProgress,
}) => {
  function setTraderLevel(traderId: string, level: number) {
    setProgress({ ...progress, [`trader-${traderId}`]: level });
  }

  return (
    <div className="shadow-lg border-0 overflow-hidden mb-4 h-full min-h-[220px] bg-white rounded p-4">
      <h2 className="text-lg font-bold mb-4">Traders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {TRADERS.map((trader) => (
          <div
            key={trader.id}
            className="flex flex-col items-center bg-gray-50 rounded p-3 shadow"
          >
            <img
              src={`https://tarkov.dev/images/traders/${trader.name.toLowerCase()}.jpg`}
              alt={trader.name}
              className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-300"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="font-semibold mb-1">{trader.name}</span>
            <label className="text-xs mb-1">Nível:</label>
            <input
              type="number"
              min={0}
              max={4}
              value={progress[`trader-${trader.id}`] ?? 0}
              onChange={(e) =>
                setTraderLevel(trader.id, Number(e.target.value))
              }
              className="w-14 px-1 py-0.5 border rounded text-sm text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
