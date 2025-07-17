import { useMemo } from "react";
import { useHideoutStations } from "./use-hideout-stations";
import { useItemsMap } from "./use-items-map";

export const useHideoutSearch = (searchTerm: string) => {
  const { stations, loading } = useHideoutStations();
  const { itemsMap, loading: loadingItems } = useItemsMap();

  const filteredStations = useMemo(() => {
    if (!searchTerm.trim() || loading || loadingItems) {
      return stations;
    }

    const term = searchTerm.toLowerCase().trim();

    return stations.filter((station) => {
      // Verificar se o nome da estação contém o termo de busca
      if (station.name.toLowerCase().includes(term)) {
        return true;
      }

      // Verificar se algum item da estação contém o termo de busca
      return station.levels.some((level: any) => {
        return (level.requirements || []).some((req: any) => {
          if (req.type === "item") {
            const itemName = itemsMap[req.itemId] || req.name || "";
            return itemName.toLowerCase().includes(term);
          }
          return false;
        });
      });
    });
  }, [stations, searchTerm, itemsMap, loading, loadingItems]);

  // Encontrar itens que correspondem ao termo de busca
  const highlightedItems = useMemo(() => {
    if (!searchTerm.trim() || loading || loadingItems) {
      return new Set();
    }

    const term = searchTerm.toLowerCase().trim();
    const items = new Set<string>();

    stations.forEach((station) => {
      station.levels.forEach((level: any) => {
        (level.requirements || []).forEach((req: any) => {
          if (req.type === "item") {
            const itemName = itemsMap[req.itemId] || req.name || "";
            if (itemName.toLowerCase().includes(term)) {
              items.add(req.itemId);
            }
          }
        });
      });
    });

    return items;
  }, [stations, searchTerm, itemsMap, loading, loadingItems]);

  return {
    filteredStations,
    allStations: stations, // Todas as estações para cálculo do progresso
    highlightedItems,
    loading: loading || loadingItems,
  };
};
