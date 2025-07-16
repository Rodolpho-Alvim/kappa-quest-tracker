"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHideoutStations } from "@/hooks/use-hideout-stations";
import { useItemsMap } from "@/hooks/use-items-map";
import * as React from "react";

interface Requirement {
  type: "item" | "module" | "trader" | "skill";
  itemId?: string;
  module?: string;
  traderId?: string;
  skill?: string;
  quantity?: number;
  level?: number;
}

interface HideoutLevel {
  level: number;
  requirements: Requirement[];
}

interface HideoutCardProps {
  station: {
    id: number;
    name: string;
    description: string;
    img?: string;
    levels: HideoutLevel[];
  };
  currentLevel?: number;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
  className?: string;
  progress: Record<string, number>;
  setProgress: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function HideoutCard({
  station,
  currentLevel,
  onUpgrade,
  onDowngrade,
  className,
  progress,
  setProgress,
}: HideoutCardProps) {
  const [selectedLevel, setSelectedLevel] = React.useState(currentLevel || 1);
  const levelData = station.levels.find((lvl) => lvl.level === selectedLevel);
  const { itemsMap, loading: loadingItems } = useItemsMap();
  const { stations } = useHideoutStations(); // Para checar progresso de módulos

  // Função recursiva para checar se um módulo/nível está completo
  function isModuleLevelComplete(moduleName: string, level: number): boolean {
    // Stash nível 1 é sempre completo
    if (moduleName === "Stash" && level === 1) return true;
    const targetStation = stations.find(
      (s) =>
        s.name.toLowerCase().replace(/\s+/g, "") ===
        moduleName.toLowerCase().replace(/\s+/g, "")
    );
    if (!targetStation) return false;
    const targetLevel = targetStation.levels.find(
      (l: any) => l.level === level
    );
    if (!targetLevel) return false;
    // Itens
    const itemReqs = targetLevel.requirements.filter(
      (r: any) => r.type === "item"
    );
    const itemsOk =
      itemReqs.length > 0 &&
      itemReqs.every((req: any) => {
        const progressKey = `${targetStation.name}-lvl${targetLevel.level}-${req.itemId}`;
        return (progress[progressKey] || 0) >= (req.quantity || 0);
      });
    // Módulos (recursivo)
    const moduleReqs = targetLevel.requirements.filter(
      (r: any) => r.type === "module"
    );
    const modulesOk = moduleReqs.every((req: any) =>
      isModuleLevelComplete(req.module, req.level)
    );
    // Traders
    const traderReqs = targetLevel.requirements.filter(
      (r: any) => r.type === "trader"
    );
    const tradersOk = traderReqs.every((req: any) => {
      const traderId = TRADER_DUMP_TO_ID[Number(req.traderId)];
      const traderProgressKey = `trader-${traderId}`;
      const traderLevel = progress[traderProgressKey] || 1;
      const requiredLevel = req.level || req.quantity || 0;
      return traderLevel >= requiredLevel;
    });
    // Skills
    const skillReqs = targetLevel.requirements.filter(
      (r: any) => r.type === "skill"
    );
    const skillsOk = skillReqs.every((req: any) => {
      const globalSkillKey = `skill-${req.skill}`;
      const localSkillKey = `${targetStation.name}-lvl${targetLevel.level}-skill-${req.skill}`;
      const skillLevel =
        progress[globalSkillKey] ?? progress[localSkillKey] ?? 0;
      return skillLevel >= (req.level || 0);
    });
    return itemsOk && modulesOk && tradersOk && skillsOk;
  }

  // Substituir setItemProgress por:
  function setItemProgress(itemKey: string, value: number) {
    setProgress((prev) => ({ ...prev, [itemKey]: value }));
  }

  // Mapeamento padrão dos traders por número
  const TRADER_NUMBER_MAP: Record<number, string> = {
    0: "Prapor",
    1: "Therapist",
    2: "Fence",
    3: "Skier",
    4: "Peacekeeper",
    5: "Mechanic",
    6: "Ragman",
    7: "Jaeger",
    8: "Prapor",
  };

  // Mapeamento do número do dump para o id real do trader
  const TRADER_DUMP_TO_ID: Record<number, string> = {
    0: "54cb50c76803fa8b248b4571", // Prapor
    1: "54cb57776803fa99248b456e", // Therapist
    2: "579dc571d53a0658a154fbec", // Fence
    3: "58330581ace78e27b8b10cee", // Skier
    4: "5935c25fb3acc3127c3d8cd9", // Peacekeeper
    5: "5a7c2eca46aef81a7ca2145d", // Mechanic
    6: "5ac3b934156ae10c4430e83c", // Ragman
    7: "5c0647fdd443bc2504c2d371", // Jaeger
    8: "54cb50c76803fa8b248b4571", // Prapor
  };

  // Mapeamento de cores por estação
  const STATION_COLOR_MAP: Record<string, string> = {
    "Rest space": "bg-gradient-to-r from-blue-700 to-blue-400",
    "Air Filtering Unit": "bg-gradient-to-r from-green-800 to-green-400",
    "Bitcoin farm": "bg-gradient-to-r from-yellow-900 to-yellow-500",
    "Nutrition Unit": "bg-gradient-to-r from-lime-800 to-lime-400",
    "Solar power": "bg-gradient-to-r from-orange-900 to-yellow-300",
    Vents: "bg-gradient-to-r from-gray-800 to-gray-400",
    "Christmas Tree": "bg-gradient-to-r from-emerald-900 to-emerald-400",
    Generator: "bg-gradient-to-r from-yellow-700 to-yellow-400",
    Heating: "bg-gradient-to-r from-orange-700 to-orange-400",
    Medstation: "bg-gradient-to-r from-rose-700 to-rose-400",
    "Water collector": "bg-gradient-to-r from-cyan-700 to-cyan-400",
    Workbench: "bg-gradient-to-r from-gray-700 to-gray-400",
    Lavatory: "bg-gradient-to-r from-indigo-700 to-indigo-400",
    Stash: "bg-gradient-to-r from-amber-700 to-amber-400",
    "Intelligence center": "bg-gradient-to-r from-purple-700 to-purple-400",
    "Shooting range": "bg-gradient-to-r from-green-700 to-green-400",
    "Booze generator": "bg-gradient-to-r from-pink-700 to-pink-400",
    "Scav case": "bg-gradient-to-r from-teal-700 to-teal-400",
    Illumination: "bg-gradient-to-r from-fuchsia-700 to-fuchsia-400",
    Security: "bg-gradient-to-r from-slate-700 to-slate-400",
    Library: "bg-gradient-to-r from-emerald-700 to-emerald-400",
    "Hall of Fame": "bg-gradient-to-r from-red-700 to-red-400",
    // Adicione outras estações conforme necessário
  };
  const headerColor =
    STATION_COLOR_MAP[station.name] ||
    "bg-gradient-to-r from-blue-700 to-blue-400";

  return (
    <Card
      className={`shadow-lg border-0 overflow-hidden mb-4 h-full min-h-[520px] ${
        className ?? ""
      }`}
    >
      <CardHeader className={`${headerColor} text-white p-4`}>
        <div className="flex items-center gap-3">
          <img
            src={`https://assets.tarkov.dev/${station.id}-icon.webp`}
            alt={station.name}
            className="w-10 h-10 rounded bg-white/20 object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <CardTitle className="text-lg font-bold">{station.name}</CardTitle>
            <div className="text-xs opacity-80">{station.description}</div>
          </div>
        </div>
        {/* Mensagem de parabenização centralizada no card se nível máximo completo */}
        {(() => {
          const maxLevel = Math.max(...station.levels.map((l) => l.level));
          const isMaxComplete = isModuleLevelComplete(station.name, maxLevel);
          if (isMaxComplete) {
            return (
              <div className="w-full flex justify-center mt-4">
                <div className="flex items-center gap-2 text-yellow-200 bg-yellow-700/30 rounded px-3 py-2 font-semibold text-base shadow">
                  <span role="img" aria-label="Troféu" className="text-2xl">
                    🏆
                  </span>
                  Nível máximo da estação atingido! Parabéns!
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-2 flex-wrap">
          {station.levels.map((lvl) => {
            const completed = isModuleLevelComplete(station.name, lvl.level);
            return (
              <Button
                key={lvl.level}
                size="sm"
                variant={selectedLevel === lvl.level ? "default" : "outline"}
                className={
                  completed
                    ? selectedLevel === lvl.level
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-700 hover:text-white"
                      : "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:text-green-900"
                    : ""
                }
                onClick={() => setSelectedLevel(lvl.level)}
              >
                Nível {lvl.level}
              </Button>
            );
          })}
        </div>
        {levelData ? (
          <div>
            <div className="mb-2 font-semibold">
              Requisitos para o nível {levelData.level}:
            </div>
            {levelData.requirements.length === 0 ? (
              <div className="text-gray-500">
                Nenhum requisito para este nível.
              </div>
            ) : loadingItems ? (
              <div className="text-gray-500">Carregando nomes dos itens...</div>
            ) : (
              <ul className="ml-0 space-y-1">
                {/* Primeiro, itens */}
                {levelData.requirements
                  .filter((r) => r.type === "item")
                  .map((req, idx) => {
                    // Chave única por estação, nível e itemId
                    const progressKey = `${station.name}-lvl${levelData.level}-${req.itemId}`;
                    const found = progress[progressKey] || 0;
                    const required = req.quantity || 0;
                    const completed = found >= required;
                    return (
                      <li
                        key={"item-" + idx}
                        className="grid grid-cols-[1fr_50px_90px] items-center gap-2 py-0.5 pl-5 pr-0"
                      >
                        <span className="truncate">
                          Item:{" "}
                          <span className="font-semibold">
                            {itemsMap[req.itemId!] || req.itemId}
                          </span>{" "}
                          x{required}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={required}
                          value={found}
                          onChange={(e) =>
                            setItemProgress(progressKey, Number(e.target.value))
                          }
                          className="w-16 px-1 py-0.5 border rounded text-sm text-right"
                        />
                        <span
                          className={`text-xs font-bold text-right block ${
                            completed ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {completed ? (
                            <>
                              <span className="align-middle">✔️</span> Completo
                            </>
                          ) : (
                            `${found}/${required}`
                          )}
                        </span>
                      </li>
                    );
                  })}
                {/* Depois, módulos, traders e skills */}
                {levelData.requirements
                  .filter((r) => r.type !== "item")
                  .map((req, idx) => {
                    if (req.type === "module") {
                      const completed = isModuleLevelComplete(
                        req.module!,
                        req.level!
                      );
                      return (
                        <li
                          key={"module-" + idx}
                          className="grid grid-cols-[1fr_50px_90px] items-center gap-2 py-0.5 pl-5 pr-0"
                        >
                          <span className="truncate">
                            Módulo:{" "}
                            <span className="font-semibold">{req.module}</span>{" "}
                            nível {req.level}
                          </span>
                          <span></span>
                          <span
                            className={`text-xs font-bold text-right block ${
                              completed ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {completed ? (
                              <>
                                <span className="align-middle">✔️</span>{" "}
                                Completo
                              </>
                            ) : null}
                          </span>
                        </li>
                      );
                    }
                    if (req.type === "trader") {
                      const traderId = TRADER_DUMP_TO_ID[Number(req.traderId)];
                      const traderName = traderId
                        ? TRADER_NUMBER_MAP[Number(req.traderId)] ||
                          `Trader ${req.traderId}`
                        : `Trader desconhecido (${req.traderId})`;
                      const traderProgressKey = `trader-${traderId}`;
                      const traderLevel = Number(
                        progress[traderProgressKey] ?? 1
                      );
                      const requiredLevel = Number(req.level ?? 0);
                      const completed = traderLevel >= requiredLevel;
                      return (
                        <li
                          key={"trader-" + idx}
                          className="grid grid-cols-[1fr_50px_90px] items-center gap-2 py-0.5 pl-5 pr-0"
                        >
                          <span className="truncate">
                            Trader:{" "}
                            <span className="font-semibold">{traderName}</span>{" "}
                            nível {requiredLevel}
                          </span>
                          <span></span>
                          <span className="text-xs font-mono font-bold text-right block min-w-[40px]">
                            {completed ? (
                              <span className="text-green-600 font-bold">
                                ✔️ Completo
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                {traderLevel}/{requiredLevel}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    }
                    if (req.type === "skill") {
                      const globalSkillKey = `skill-${req.skill}`;
                      const localSkillKey = `${station.name}-lvl${levelData.level}-skill-${req.skill}`;
                      const skillLevel =
                        progress[globalSkillKey] ??
                        progress[localSkillKey] ??
                        0;
                      const requiredLevel = Number(req.level ?? 0);
                      const completed = skillLevel >= requiredLevel;
                      return (
                        <li
                          key={"skill-" + idx}
                          className="grid grid-cols-[1fr_50px_90px] items-center gap-2 py-0.5 pl-5 pr-0"
                        >
                          <span className="truncate">
                            Skill:{" "}
                            <span className="font-semibold">{req.skill}</span>{" "}
                            nível {requiredLevel}
                          </span>
                          <span></span>
                          <span className="text-xs font-mono font-bold text-right block min-w-[40px]">
                            {completed ? (
                              <span className="text-green-600 font-bold">
                                ✔️ Completo
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                {skillLevel}/{requiredLevel}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    }
                    return null;
                  })}
              </ul>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Nível não encontrado.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default HideoutCard;
