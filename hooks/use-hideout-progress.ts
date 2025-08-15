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
        // Contar apenas níveis que têm requisitos E que podem ser completados
        if (level.requirements && level.requirements.length > 0) {
          // Filtrar apenas requisitos de ITENS (mesmo que os botões)
          const itemRequirements = level.requirements.filter(
            (req: any) => req.type === "item"
          );

          // SÓ contar se tem itens para completar (mesmo que os botões)
          if (itemRequirements.length > 0) {
            totalLevels++;

            // LÓGICA ULTRA SIMPLES: Usar EXATAMENTE a mesma lógica dos botões verdes!
            // Se o botão está verde, conta como COMPLETO na barra de progresso
            let isLevelComplete = false;

            // MESMA lógica dos botões: verificar se há itens incompletos
            const hasIncompleteItems = itemRequirements.some((req: any) => {
              const progressKey = `${station.name}-lvl${level.level}-${req.itemId}`;
              const found = progress[progressKey] || 0;
              const required = req.quantity || 0;
              return found < required;
            });

            // Se NÃO há itens incompletos, o nível está COMPLETO (botão verde)
            isLevelComplete = !hasIncompleteItems;

            if (isLevelComplete) {
              completedLevels++;
            }
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
