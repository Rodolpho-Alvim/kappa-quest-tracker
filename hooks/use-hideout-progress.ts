import { useCallback } from "react";
import { useHideoutStations } from "./use-hideout-stations";
import { useLocalStorage } from "./use-local-storage";

const STORAGE_KEY = "kappa-hideout-progress";

// Função isModuleLevelComplete copiada da página do Hideout
function isModuleLevelComplete(
  stationName: string,
  level: number,
  allStations: any[],
  progress: Record<string, number>
): boolean {
  // Stash nível 1 é sempre completo
  if (stationName === "Stash" && level === 1) return true;

  const targetStation = allStations.find(
    (s: any) =>
      s.name.toLowerCase().replace(/\s+/g, "") ===
      stationName.toLowerCase().replace(/\s+/g, "")
  );
  if (!targetStation) return false;

  const targetLevel = targetStation.levels.find((l: any) => l.level === level);
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
    isModuleLevelComplete(req.module, req.level, allStations, progress)
  );

  // Traders
  const traderReqs = targetLevel.requirements.filter(
    (r: any) => r.type === "trader"
  );
  const TRADER_DUMP_TO_ID: Record<number, string> = {
    0: "54cb50c76803fa8b248b4571",
    1: "54cb57776803fa99248b456e",
    2: "579dc571d53a0658a154fbec",
    3: "58330581ace78e27b8b10cee",
    4: "5935c25fb3acc3127c3d8cd9",
    5: "5a7c2eca46aef81a7ca2145d",
    6: "5ac3b934156ae10c4430e83c",
    7: "5c0647fdd443bc2504c2d371",
    8: "54cb50c76803fa8b248b4571",
  };
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
    const skillLevel = progress[globalSkillKey] ?? progress[localSkillKey] ?? 0;
    return skillLevel >= (req.level || 0);
  });

  return itemsOk && modulesOk && tradersOk && skillsOk;
}

export function useHideoutProgress() {
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(
    STORAGE_KEY,
    {}
  );
  const { stations } = useHideoutStations();

  function setItemProgress(itemId: string, value: number) {
    setProgress((prev) => ({ ...prev, [itemId]: value }));
  }

  function resetProgress() {
    setProgress({});
  }

  // Calcular progresso geral do Hideout - MESMA LÓGICA DO /hideout
  const getHideoutOverallProgress = useCallback(() => {
    if (!stations || stations.length === 0)
      return { completed: 0, total: 0, percentage: 0 };

    let totalLevels = 0;
    let completedLevels = 0;

    stations.forEach((station) => {
      station.levels.forEach((level: any) => {
        // Contar apenas níveis que têm requisitos (excluir Stash nível 1)
        if (level.requirements && level.requirements.length > 0) {
          totalLevels++;

          // ULTRA SIMPLES: Se o botão está verde, conta para o progresso!
          // Verificar se o nível está visualmente completo (verde)
          let isLevelComplete = false;

          // Verificar se TODOS os requisitos estão atendidos
          if (level.requirements && level.requirements.length > 0) {
            isLevelComplete = level.requirements.every((req: any) => {
              if (req.type === "item") {
                // Verificar se o item está completo
                const progressKey = `${station.name}-lvl${level.level}-${req.itemId}`;
                const currentProgress = progress[progressKey] || 0;
                return currentProgress >= (req.quantity || 0);
              } else if (req.type === "module") {
                // Verificar se o módulo base está completo
                const targetStation = stations.find(
                  (s: any) =>
                    s.name.toLowerCase().replace(/\s+/g, "") ===
                    req.module.toLowerCase().replace(/\s+/g, "")
                );
                if (!targetStation) return false;

                const targetLevel = targetStation.levels.find(
                  (l: any) => l.level === req.level
                );
                if (!targetLevel) return false;

                // Se o módulo base tem itens, verificar se estão completos
                const targetItemReqs = targetLevel.requirements.filter(
                  (r: any) => r.type === "item"
                );
                if (targetItemReqs.length > 0) {
                  return targetItemReqs.every((itemReq: any) => {
                    const progressKey = `${targetStation.name}-lvl${targetLevel.level}-${itemReq.itemId}`;
                    return (
                      (progress[progressKey] || 0) >= (itemReq.quantity || 0)
                    );
                  });
                }
                // Se o módulo base não tem itens, verificar se está completo
                return true;
              } else if (req.type === "trader") {
                // Verificar se o trader está no nível correto
                const TRADER_DUMP_TO_ID: Record<string, string> = {
                  Mechanic: "54cb50c76803fa8b248b4571",
                  Skier: "54cb57776803fa99248b456e",
                  Peacekeeper: "579dc571d53a0658a154fbec",
                  Therapist: "58330581ace78e27b8b10cee",
                  Prapor: "5935c25fb3acc3127c3d8cd9",
                  Fence: "5a7c2eca46aef81a7ca2145d",
                  Jaeger: "5ac3b934156ae10c4430e83c",
                  Ragman: "5c0647fdd443bc2504c2d371",
                };

                const traderId =
                  TRADER_DUMP_TO_ID[req.traderId] || req.traderId;
                const traderProgressKey = `trader-${traderId}`;
                const traderLevel = progress[traderProgressKey] || 1;
                const requiredLevel = req.level || req.quantity || 0;
                return traderLevel >= requiredLevel;
              } else if (req.type === "skill") {
                // Verificar se a skill está no nível correto
                const globalSkillKey = `skill-${req.skill}`;
                const localSkillKey = `${station.name}-lvl${level.level}-skill-${req.skill}`;
                const skillLevel =
                  progress[globalSkillKey] ?? progress[localSkillKey] ?? 0;
                return skillLevel >= (req.level || 0);
              }
              return false;
            });
          }

          if (isLevelComplete) {
            completedLevels++;
          }
        }
      });
    });

    const percentage =
      totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    return {
      completed: completedLevels,
      total: totalLevels,
      percentage,
    };
  }, [stations, progress]);

  return {
    progress,
    setItemProgress,
    resetProgress,
    getHideoutOverallProgress,
  };
}
