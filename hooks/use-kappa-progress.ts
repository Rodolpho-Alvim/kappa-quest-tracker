import { FIXED_ITEMS } from "@/data/fixed-items";
import { useLocalStorage } from "./use-local-storage";

const KAPPA_STORAGE_KEY = "kappa-quest-progress-v4";

export function useKappaProgress() {
  const [progress, setProgress] = useLocalStorage<Record<string, any>>(
    KAPPA_STORAGE_KEY,
    {}
  );

  // Calcular progresso geral do Kappa
  function getKappaOverallProgress() {
    // Usar a mesma lógica da página do Kappa
    const allItems = Object.values(FIXED_ITEMS).flat();

    // Filtrar itens de referência
    const totalItems = allItems.filter(
      (item) => !(item as any).isReference
    ).length;

    // Calcular itens completos usando a mesma lógica da página do Kappa
    const completedItems = allItems.filter((item) => {
      if ((item as any).isReference) return false;

      const qtdE = Number(progress[item.id]?.qtdE ?? (item as any).qtdE ?? 0);
      const qtdR = Number(progress[item.id]?.qtdR ?? (item as any).qtdR ?? 0);

      const firRequired =
        (item as any).fir === "Yes" || progress[item.id]?.fir === "Yes";
      const firOk =
        !firRequired ||
        progress[item.id]?.fir === "Yes" ||
        (item as any).fir === "Yes";

      return qtdE >= qtdR && firOk && qtdR > 0;
    }).length;

    const percentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      completed: completedItems,
      total: totalItems,
      percentage,
    };
  }

  function setItemProgress(itemId: string, field: string, value: any) {
    setProgress((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        lastUpdated: Date.now(),
      },
    }));
  }

  function resetProgress() {
    setProgress({});
  }

  return {
    progress,
    setItemProgress,
    resetProgress,
    getKappaOverallProgress,
  };
}
