"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useHideoutStations } from "@/hooks/use-hideout-stations";
import { useItemsMap } from "@/hooks/use-items-map";
import * as React from "react";
import { QuantityInput } from "./QuantityInput";

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
  highlightedItems?: Set<string>;
}

export function HideoutCard({
  station,
  currentLevel,
  onUpgrade,
  onDowngrade,
  className,
  progress,
  setProgress,
  highlightedItems = new Set(),
}: HideoutCardProps) {
  // Encontrar níveis que contêm itens destacados
  const levelsWithHighlightedItems = React.useMemo(() => {
    if (highlightedItems.size === 0) return new Set<number>();

    const levels = new Set<number>();
    station.levels.forEach((level) => {
      level.requirements.forEach((req) => {
        if (req.type === "item" && highlightedItems.has(req.itemId!)) {
          levels.add(level.level);
        }
      });
    });
    return levels;
  }, [station.levels, highlightedItems]);

  const [selectedLevel, setSelectedLevel] = React.useState(currentLevel || 1);

  // Auto-selecionar nível com itens destacados quando há pesquisa
  React.useEffect(() => {
    if (highlightedItems.size > 0 && levelsWithHighlightedItems.size > 0) {
      // Selecionar o primeiro nível que contém itens destacados
      const firstHighlightedLevel = Math.min(
        ...Array.from(levelsWithHighlightedItems)
      );
      setSelectedLevel(firstHighlightedLevel);
    }
  }, [highlightedItems, levelsWithHighlightedItems]);
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
      itemReqs.length === 0 || // Se não há requisitos de item, considerar OK
      itemReqs.every((req: any) => {
        const progressKey = `${targetStation.name}-lvl${targetLevel.level}-${req.itemId}`;
        const currentProgress = progress[progressKey] || 0;
        const required = req.quantity || 0;
        return currentProgress >= required;
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
      // Mapear nome do trader para ID correto
      const traderName = req.traderId;
      const traderId = getTraderIdByName(traderName);
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

  // Função para mapear nome do trader para ID
  const getTraderIdByName = (traderName: string): string => {
    const traderMap: Record<string, string> = {
      Prapor: "54cb50c76803fa8b248b4571",
      Therapist: "54cb57776803fa99248b456e",
      Fence: "579dc571d53a0658a154fbec",
      Skier: "58330581ace78e27b8b10cee",
      Peacekeeper: "5935c25fb3acc3127c3d8cd9",
      Mechanic: "5a7c2eca46aef81a7ca2145d",
      Ragman: "5ac3b934156ae10c4430e83c",
      Jaeger: "5c0647fdd443bc2504c2d371",
    };
    return traderMap[traderName] || traderName;
  };

  // Mapeamento de cores por estação
  const STATION_COLOR_MAP: Record<string, string> = {
    "Rest Space": "bg-gradient-to-r from-blue-700 to-blue-400",
    "Air Filtering Unit": "bg-gradient-to-r from-green-800 to-green-400",
    "Bitcoin Farm": "bg-gradient-to-r from-yellow-900 to-yellow-500",
    "Nutrition Unit": "bg-gradient-to-r from-lime-800 to-lime-400",
    "Solar Power": "bg-gradient-to-r from-orange-900 to-yellow-300",
    Vents: "bg-gradient-to-r from-gray-800 to-gray-400",

    Generator: "bg-gradient-to-r from-yellow-700 to-yellow-400",
    Heating: "bg-gradient-to-r from-orange-700 to-orange-400",
    Medstation: "bg-gradient-to-r from-rose-700 to-rose-400",
    "Water Collector": "bg-gradient-to-r from-cyan-700 to-cyan-400",
    Workbench: "bg-gradient-to-r from-gray-700 to-gray-400",
    Lavatory: "bg-gradient-to-r from-indigo-700 to-indigo-400",
    Stash: "bg-gradient-to-r from-amber-700 to-amber-400",
    "Intelligence Center": "bg-gradient-to-r from-purple-700 to-purple-400",
    "Shooting Range": "bg-gradient-to-r from-green-700 to-green-400",
    "Booze Generator": "bg-gradient-to-r from-pink-700 to-pink-400",
    "Scav Case": "bg-gradient-to-r from-teal-700 to-teal-400",
    Illumination: "bg-gradient-to-r from-fuchsia-700 to-fuchsia-400",
    Security: "bg-gradient-to-r from-slate-700 to-slate-400",
    Library: "bg-gradient-to-r from-emerald-700 to-emerald-400",
    "Hall of Fame": "bg-gradient-to-r from-red-700 to-red-400",
    "Defective Wall": "bg-gradient-to-r from-red-800 to-red-500",
    Gym: "bg-gradient-to-r from-purple-800 to-purple-500",
    "Gear Rack": "bg-gradient-to-r from-blue-800 to-blue-500",
    "Cultist Circle": "bg-gradient-to-r from-purple-900 to-purple-600",
    "Weapon Rack": "bg-gradient-to-r from-gray-900 to-gray-600",
    // Adicione outras estações conforme necessário
  };
  const headerColor =
    STATION_COLOR_MAP[station.name] ||
    "bg-gradient-to-r from-blue-700 to-blue-400";

  // Função auxiliar para obter a imagem de uma estação
  const getStationImage = React.useCallback((stationName: string, stationId?: number) => {
    const imageMap: Record<string, string> = {
      "Air Filtering Unit": "/images/air-filtering-unit.png",
      "Bitcoin Farm": "/images/bitcoin-farm.png",
      "Booze Generator": "/images/booze-generator.png",
      "Cultist Circle": "/images/cultist-circle.png",
      "Defective Wall": "https://assets.tarkov.dev/station-defective-wall.png",
      "Gear Rack": "/images/Gear_Rack_Portrait.png",
      Generator: "/images/Generator_Portrait.png",
      Gym: "/images/Gym_Portrait.png",
      "Hall of Fame": "/images/Hall_of_Fame_Portrait.png",
      Heating: "/images/Heating_Portrait.png",
      Illumination: "/images/Illumination_Portrait.png",
      "Intelligence Center": "/images/Intelligence_Center_Portrait.png",
      Lavatory: "/images/Lavatory_Portrait.png",
      Library: "/images/Library_Portrait.png",
      Medstation: "/images/Medstation_Portrait.png",
      "Nutrition Unit": "/images/Nutrition_Unit_Portrait.png",
      "Rest Space": "/images/Rest_Space_Portrait.png",
      "Scav Case": "/images/Scav_Case_Portrait.png",
      Security: "/images/Security_Portrait.png",
      "Shooting Range": "/images/Shooting_Range_Portrait.png",
      "Solar Power": "/images/Solar_power_Portrait.png",
      Stash: "/images/Stash_Portrait.png",
      Vents: "/images/Vents_Portrait.png",
      "Water Collector": "/images/Water_Collector_Portrait.png",
      "Weapon Rack": "/images/Weapon_Rack_Portrait.png",
      Workbench: "/images/Workbench_Portrait.png",
    };
    return imageMap[stationName] || (stationId ? `https://assets.tarkov.dev/${stationId}-icon.webp` : "");
  }, []);

  return (
    <Card
      className={`shadow-2xl border-0 overflow-hidden mb-4 h-full min-h-[520px] transition-all duration-300 ${
        className ?? ""
      }`}
    >
      <CardHeader
        className={`${headerColor} p-4 relative overflow-hidden h-20 flex flex-col justify-center`}
      >
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full animate-pulse"></div>
        <div className="flex items-center gap-4 h-full">
          {(() => {
            const imagePath = getStationImage(station.name, station.id);
            if (imagePath) {
              return (
                <div className="flex-shrink-0">
                  <img
                    src={imagePath}
                    alt={station.name}
                    className="w-10 h-10 rounded-lg bg-white/20 object-contain border border-white/30 shadow-lg"
                    onError={(e) => {
                      // Se a imagem local falhar, tentar a API do Tarkov.dev
                      e.currentTarget.src = `https://assets.tarkov.dev/${station.id}-icon.webp`;
                      e.currentTarget.onerror = () => {
                        e.currentTarget.style.display = "none";
                      };
                    }}
                  />
                </div>
              );
            }
            return null;
          })()}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-200 mb-1 leading-tight">
              {station.name}
            </CardTitle>
            <div className="text-xs opacity-90 text-gray-200 leading-snug">
              {station.description}
            </div>
          </div>
        </div>
        {/* Mensagem de parabenização no topo direito do cabeçalho se nível máximo completo */}
        {(() => {
          const maxLevel = Math.max(...station.levels.map((l) => l.level));
          const isMaxComplete = isModuleLevelComplete(station.name, maxLevel);
          if (isMaxComplete) {
            return (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-2 text-yellow-200 bg-gradient-to-r from-yellow-600/90 to-orange-600/90 backdrop-blur-sm rounded-full px-3 py-1.5 font-bold text-xs shadow-xl border border-yellow-400/40 animate-pulse">
                  <span
                    role="img"
                    aria-label="Troféu"
                    className="text-lg drop-shadow-lg"
                  >
                    🏆
                  </span>
                  <span className="drop-shadow-lg">Máximo!</span>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-3 mb-4 flex-wrap">
          {station.levels.map((lvl) => {
            const completed = isModuleLevelComplete(station.name, lvl.level);
            const hasHighlightedItems = levelsWithHighlightedItems.has(
              lvl.level
            );

            return (
              <Button
                key={lvl.level}
                size="sm"
                variant={selectedLevel === lvl.level ? "default" : "outline"}
                className={`
                  relative overflow-hidden transition-all duration-300 transform hover:scale-105
                  ${
                    hasHighlightedItems
                      ? selectedLevel === lvl.level
                        ? "bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-700 dark:to-orange-700 text-white border-0 shadow-xl hover:shadow-2xl"
                        : "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700/50 hover:from-yellow-200 hover:to-orange-200 dark:hover:from-yellow-800/40 dark:hover:to-orange-800/40 shadow-lg"
                      : completed
                      ? selectedLevel === lvl.level
                        ? "bg-gradient-to-r from-[#5a6b4a] to-[#4a5b3a] dark:from-[#5a6b4a] dark:to-[#4a5b3a] text-white border-0 shadow-xl hover:shadow-2xl"
                        : "bg-gradient-to-r from-[#5a6b4a]/20 to-[#4a5b3a]/20 dark:from-[#5a6b4a]/30 dark:to-[#4a5b3a]/30 text-[#5a6b4a] dark:text-[#5a6b4a] border-[#5a6b4a]/40 dark:border-[#5a6b4a]/50 hover:from-[#5a6b4a]/30 hover:to-[#4a5b3a]/30 dark:hover:from-[#5a6b4a]/40 dark:hover:to-[#4a5b3a]/40 shadow-lg"
                      : "hover:shadow-md"
                  }
                  ${
                    selectedLevel === lvl.level
                      ? "ring-2 ring-white/50 ring-offset-2 ring-offset-gray-800 dark:ring-offset-gray-950"
                      : ""
                  }
                `}
                onClick={() => setSelectedLevel(lvl.level)}
              >
                {/* Efeito de brilho para botões selecionados */}
                {selectedLevel === lvl.level && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 transform -skew-x-12 -translate-x-full animate-pulse"></div>
                )}
                <span className="relative z-10 font-semibold">
                  Nível {lvl.level}
                </span>
                {hasHighlightedItems && (
                  <span className="ml-2 text-xs bg-yellow-200 dark:bg-yellow-900/50 px-2 py-1 rounded-full text-yellow-800 dark:text-yellow-200">
                    🔍
                  </span>
                )}
              </Button>
            );
          })}

          {/* Botão para completar ou resetar o nível selecionado - alinhado à direita */}
          {(() => {
            if (!levelData) return null;

            // Verificar se há itens para completar
            const itemRequirements = levelData.requirements.filter(
              (r) => r.type === "item"
            );

            const hasIncompleteItems = itemRequirements.some((req) => {
              const progressKey = `${station.name}-lvl${levelData.level}-${req.itemId}`;
              const found = progress[progressKey] || 0;
              const required = req.quantity || 0;
              return found < required;
            });

            // Se não há itens, não mostrar botão
            if (itemRequirements.length === 0) {
              return null;
            }

            // Se há itens incompletos, mostrar botão de completar
            if (hasIncompleteItems) {
              return (
                <div className="ml-auto">
                  <Button
                    onClick={() => {
                      // Completar todos os itens do nível atual de uma vez
                      const updates: Record<string, number> = {};
                      itemRequirements.forEach((req) => {
                        const progressKey = `${station.name}-lvl${levelData.level}-${req.itemId}`;
                        const required = req.quantity || 0;
                        updates[progressKey] = required;
                      });

                      // Atualizar todos os itens de uma vez usando uma função de callback
                      setProgress((prevProgress) => {
                        const newProgress = { ...prevProgress };
                        Object.entries(updates).forEach(([key, value]) => {
                          newProgress[key] = value;
                        });
                        return newProgress;
                      });
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-[#5a6b4a] to-[#4a5b3a] dark:from-[#5a6b4a] dark:to-[#4a5b3a] hover:from-[#4a5b3a] hover:to-[#5a6b4a] dark:hover:from-[#4a5b3a] dark:hover:to-[#5a6b4a] text-white font-bold px-4 py-2 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105 border-2 border-white/20 dark:border-white/10 backdrop-blur-sm w-[110px]"
                    title="Completar todos os itens necessários para este nível"
                  >
                    <div className="flex items-center justify-center w-full text-center">
                      <span className="text-sm text-white flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-xs flex-shrink-0 ml-1">
                        Completar
                      </span>
                      <span className="text-xs opacity-90 flex-shrink-0 ml-0.5">
                        ({itemRequirements.length})
                      </span>
                    </div>
                  </Button>
                </div>
              );
            }

            // Se todos os itens estão completos, mostrar botão de reset
            return (
              <div className="ml-auto">
                <Button
                  onClick={() => {
                    // Resetar todos os itens do nível atual para 0
                    const updates: Record<string, number> = {};
                    itemRequirements.forEach((req) => {
                      const progressKey = `${station.name}-lvl${levelData.level}-${req.itemId}`;
                      updates[progressKey] = 0;
                    });

                    // Atualizar todos os itens de uma vez usando uma função de callback
                    setProgress((prevProgress) => {
                      const newProgress = { ...prevProgress };
                      Object.entries(updates).forEach(([key, value]) => {
                        newProgress[key] = value;
                      });
                      return newProgress;
                    });
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-[#3a4b2a] to-[#2a3b1a] dark:from-[#3a4b2a] dark:to-[#2a3b1a] hover:from-[#2a3b1a] hover:to-[#3a4b2a] dark:hover:from-[#2a3b1a] dark:hover:to-[#3a4b2a] text-white font-bold px-4 py-2 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105 border-2 border-white/20 dark:border-white/10 backdrop-blur-sm w-[110px]"
                  title="Resetar progresso deste nível para zero"
                >
                  <div className="flex items-center justify-center w-full text-center">
                    <span className="text-sm text-white flex-shrink-0">↺</span>
                    <span className="text-xs flex-shrink-0 ml-1">Resetar</span>
                    <span className="text-xs opacity-90 flex-shrink-0 ml-0.5">
                      ({itemRequirements.length})
                    </span>
                  </div>
                </Button>
              </div>
            );
          })()}
        </div>
        {levelData ? (
          <div>
            {/* Substituir a renderização dos requisitos para o nível 1 do Stash */}
            {levelData.level === 1 &&
            station.name === "Stash" &&
            (levelData as any).isBaseLevel ? (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5a6b4a] to-[#4a5b3a] flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">
                    Requisitos para o Nível 1
                  </h3>
                </div>
                <div className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-lg border-l-4 border-[#5a6b4a]">
                  Possuir a edição padrão do jogo
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5a6b4a] to-[#4a5b3a] flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {levelData.level}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">
                    Requisitos para o Nível {levelData.level}
                  </h3>
                </div>
              </div>
            )}
            {levelData.requirements.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">
                Nenhum requisito para este nível.
              </div>
            ) : loadingItems ? (
              <div className="text-gray-500 dark:text-gray-400">
                Carregando nomes dos itens...
              </div>
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
                    const isHighlighted = highlightedItems.has(req.itemId!);

                    return (
                      <li
                        key={"item-" + idx}
                        className={`grid grid-cols-[1fr_50px_90px] items-center gap-2 py-0.5 pl-5 pr-0 transition-all duration-200 ${
                          isHighlighted
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r shadow-sm"
                            : ""
                        }`}
                      >
                        <span className="truncate text-gray-800 dark:text-gray-300">
                          Item:{" "}
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span
                                className={`font-semibold select-none ${
                                  isHighlighted
                                    ? "text-yellow-800 dark:text-yellow-200"
                                    : ""
                                }`}
                              >
                                {itemsMap[req.itemId!] || req.itemId}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto p-3">
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={`https://assets.tarkov.dev/${req.itemId}.webp`}
                                  alt={itemsMap[req.itemId!] || req.itemId}
                                  className="w-24 h-24 rounded bg-muted object-contain border"
                                  onError={(e) => {
                                    // Fallback para -icon se a imagem completa não existir
                                    const target = e.currentTarget;
                                    target.src = `https://assets.tarkov.dev/${req.itemId}-icon.webp`;
                                    target.onerror = () => {
                                      target.style.display = "none";
                                    };
                                  }}
                                />
                                <span className="text-sm font-semibold text-center">
                                  {itemsMap[req.itemId!] || req.itemId}
                                </span>
                              </div>
                            </HoverCardContent>
                          </HoverCard>{" "}
                          x{required}
                        </span>
                        <QuantityInput
                          value={found}
                          onChange={(val) => setItemProgress(progressKey, val)}
                          min={0}
                          max={required}
                          className={`w-16 text-sm text-right -ml-4 ${
                            isHighlighted
                              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                              : ""
                          } ${
                            found > required ? "border-red-500 bg-red-50" : ""
                          }`}
                        />
                        <span
                          className={`text-xs font-bold text-right block ${
                            completed
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-400 dark:text-gray-400"
                          }`}
                        >
                          {completed ? (
                            <>
                              <span className="align-middle">✔️</span> Completo
                            </>
                          ) : found > required ? (
                            <span
                              className="text-red-600"
                              title="Quantidade excede o necessário"
                            >
                              {required}/{required} ⚠️
                            </span>
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
                      // Encontrar a estação correspondente ao módulo
                      const moduleStation = stations.find(
                        (s) =>
                          s.name.toLowerCase().replace(/\s+/g, "") ===
                          req.module!.toLowerCase().replace(/\s+/g, "")
                      );
                      const stationImage = moduleStation ? getStationImage(moduleStation.name, moduleStation.id) : "";
                      return (
                        <li
                          key={"module-" + idx}
                          className="grid grid-cols-[1fr_50px_90px] items-center gap-2 py-0.5 pl-5 pr-0"
                        >
                          <span className="truncate text-gray-800 dark:text-gray-300">
                            Módulo:{" "}
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <span className="font-semibold select-none">
                                  {req.module}
                                </span>
                              </HoverCardTrigger>
                              {stationImage && (
                                <HoverCardContent className="w-auto p-3">
                                  <div className="flex flex-col items-center gap-2">
                                    <img
                                      src={stationImage}
                                      alt={req.module!}
                                      className="w-24 h-24 rounded bg-muted object-contain border"
                                      onError={(e) => {
                                        // Fallback para API do Tarkov.dev se a imagem local falhar
                                        if (moduleStation) {
                                          e.currentTarget.src = `https://assets.tarkov.dev/${moduleStation.id}-icon.webp`;
                                          e.currentTarget.onerror = () => {
                                            e.currentTarget.style.display = "none";
                                          };
                                        } else {
                                          e.currentTarget.style.display = "none";
                                        }
                                      }}
                                    />
                                    <span className="text-sm font-semibold text-center">
                                      {req.module}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Nível {req.level}
                                    </span>
                                  </div>
                                </HoverCardContent>
                              )}
                            </HoverCard>{" "}
                            nível {req.level}
                          </span>
                          <span></span>
                          <span
                            className={`text-xs font-bold text-right block ${
                              completed
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-400 dark:text-gray-400"
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
                      // Mapear o nome do trader para o ID correto usado no TraderCard
                      const traderName = req.traderId || "Trader Desconhecido";
                      const traderId = getTraderIdByName(traderName);
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
                          <span className="truncate text-gray-800 dark:text-gray-300">
                            Trader:{" "}
                            <span className="font-semibold">{traderName}</span>{" "}
                            nível {requiredLevel}
                          </span>
                          <span></span>
                          <span className="text-xs font-mono font-bold text-right block min-w-[40px]">
                            {completed ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                ✔️ Completo
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-400">
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
                          <span className="truncate text-gray-800 dark:text-gray-300">
                            Skill:{" "}
                            <span className="font-semibold">{req.skill}</span>{" "}
                            nível {requiredLevel}
                          </span>
                          <span></span>
                          <span className="text-xs font-mono font-bold text-right block min-w-[40px]">
                            {completed ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                ✔️ Completo
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-400">
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
