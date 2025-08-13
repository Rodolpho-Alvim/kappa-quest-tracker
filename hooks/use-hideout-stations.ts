import { useEffect, useState } from "react";

// Níveis máximos conhecidos por estação (pode ser expandido conforme necessário)
const STATION_MAX_LEVELS: Record<string, number> = {
  Stash: 4,
  Generator: 3,
  Medstation: 3,
  Workbench: 3,
  "Water Collector": 3,
  "Nutrition Unit": 3,
  "Rest Space": 3,
  Heating: 3,
  Illumination: 3,
  Security: 3,
  Vents: 3,
  Lavatory: 3,
  "Intelligence Center": 3,
  "Shooting Range": 3,
  Library: 1,
  "Air Filtering Unit": 1,
  "Bitcoin Farm": 3,
  "Booze Generator": 1,
  "Scav Case": 1,
  "Solar Power": 1,
  "Hall of Fame": 3,
  "Defective Wall": 6,
  Gym: 1,
  "Weapon Rack": 3,
  "Gear Rack": 3,
  "Cultist Circle": 1,
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
            // Usar os níveis diretamente da estação se disponíveis
            let levels = station.levels || [];

            // Se não há níveis na estação, tentar usar a lógica antiga como fallback
            if (!levels || levels.length === 0) {
              const levelsRaw =
                data.modules?.filter(
                  (mod: any) =>
                    normalize(mod.module) === normalize(station.locales.en)
                ) || [];

              // Descobrir o número máximo de níveis para a estação
              const maxLevel =
                STATION_MAX_LEVELS[station.locales.en] ||
                Math.max(1, ...levelsRaw.map((l: any) => l.level));

              // Montar todos os níveis, preenchendo vazios se necessário
              levels = Array.from({ length: maxLevel }, (_, i) => {
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
            }

            // Mapear os requisitos para o formato correto quando usando dados diretos
            if (levels && levels.length > 0) {
              levels = levels.map((level) => ({
                ...level,
                requirements:
                  level.requirements?.map((req: any) => {
                    if (req.type === "item") {
                      return {
                        type: "item",
                        itemId: req.itemId,
                        quantity: req.quantity,
                      };
                    }
                    if (req.type === "module") {
                      return {
                        type: "module",
                        module: req.module,
                        level: req.level,
                      };
                    }
                    if (req.type === "trader") {
                      return {
                        type: "trader",
                        traderId: req.traderId,
                        level: req.level,
                      };
                    }
                    if (req.type === "skill") {
                      return {
                        type: "skill",
                        skill: req.skill,
                        level: req.level,
                      };
                    }
                    return req;
                  }) || [],
              }));
            }

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
