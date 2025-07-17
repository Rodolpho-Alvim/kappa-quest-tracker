import { useEffect, useState } from "react";

// Níveis máximos conhecidos por estação (pode ser expandido conforme necessário)
const STATION_MAX_LEVELS: Record<string, number> = {
  Stash: 4,
  Generator: 3,
  Medstation: 3,
  Workbench: 3,
  "Water collector": 3,
  "Nutrition Unit": 3,
  "Rest space": 3,
  Heating: 3,
  Illumination: 3,
  Security: 3,
  Vents: 3,
  Lavatory: 3,
  "Intelligence center": 3,
  "Shooting range": 3,
  Library: 1,
  "Air Filtering Unit": 1,
  "Bitcoin farm": 3,
  "Booze generator": 1,
  "Scav case": 1,
  "Solar power": 1,
  "Hall of Fame": 1,
  "Defective Wall": 1,
  Gym: 1,
  "Weapon Rack": 1,
};

export function useHideoutStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/hideout.json")
      .then((res) => res.json())
      .then((data) => {
        const normalize = (str: string) =>
          str.toLowerCase().replace(/\s+/g, "");
        const mapRequirements = (requirements: any[]) =>
          requirements.map((req: any) => {
            if (req.type === "item") {
              return { type: "item", itemId: req.name, quantity: req.quantity };
            }
            if (req.type === "module") {
              return { type: "module", module: req.name, level: req.quantity };
            }
            if (req.type === "trader") {
              return {
                type: "trader",
                traderId: req.name,
                level: req.quantity,
              };
            }
            if (req.type === "skill") {
              return { type: "skill", skill: req.name, level: req.quantity };
            }
            return req;
          });

        const stations = data.stations
          .filter((station: any) => !station.disabled)
          .map((station: any) => {
            const levelsRaw = data.modules.filter(
              (mod: any) =>
                normalize(mod.module) === normalize(station.locales.en)
            );
            // Descobrir o número máximo de níveis para a estação
            const maxLevel =
              STATION_MAX_LEVELS[station.locales.en] ||
              Math.max(1, ...levelsRaw.map((l: any) => l.level));
            // Montar todos os níveis, preenchendo vazios se necessário
            const levels = Array.from({ length: maxLevel }, (_, i) => {
              const found = levelsRaw.find((l: any) => l.level === i + 1);
              // Sempre incluir o nível 1 do Stash para visualização e progresso
              if (station.locales.en === "Stash" && i + 1 === 1) {
                return {
                  level: 1,
                  requirements: [],
                  isBaseLevel: true,
                };
              }
              // Remover filtro do Stash nível 1 para visualização
              if (!found || !found.require || found.require.length === 0) {
                return null;
              }
              return {
                level: found.level,
                requirements: mapRequirements(found.require),
              };
            }).filter(Boolean); // Remove nulls
            return {
              id: station.id,
              name: station.locales.en,
              description: station.function,
              img: station.imgSource,
              levels,
            };
          });
        setStations(stations);
        setLoading(false);
      });
  }, []);

  return { stations, loading };
}
