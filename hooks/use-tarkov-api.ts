import {
  applyApiChangesToLocalData,
  compareHideoutData,
  convertApiDataToLocalFormat,
  createItemsMap,
  generateChangeReport,
  generateItemsSyncReport,
  syncItemsWithApi,
  type ApiHideoutStation,
  type ApiItem,
  type LocalItem,
} from "@/lib/tarkov-data-converter";
import { useCallback, useEffect, useState } from "react";

// Usar as interfaces do conversor
type TarkovItem = ApiItem;
type HideoutStation = ApiHideoutStation;

interface UseTarkovApiReturn {
  items: TarkovItem[];
  hideoutStations: HideoutStation[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  searchItems: (query: string) => Promise<TarkovItem[]>;
  getHideoutRequirements: () => Promise<any>;
  getItemsMap: () => Record<string, string>;
  compareWithLocalData: (
    localData: any[]
  ) => ReturnType<typeof compareHideoutData>;
  generateChangeReport: (localData: any[]) => string;
  syncItemsWithLocalData: (
    localItems: Record<string, LocalItem>
  ) => ReturnType<typeof syncItemsWithApi>;
  generateItemsSyncReport: (
    syncResult: ReturnType<typeof syncItemsWithApi>
  ) => string;
  applyChangesToLocalData: (localData: any[]) => any[];
}

export function useTarkovApi(): UseTarkovApiReturn {
  const [items, setItems] = useState<TarkovItem[]>([]);
  const [hideoutStations, setHideoutStations] = useState<HideoutStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query GraphQL para buscar itens
  const fetchItems = useCallback(async () => {
    const query = `
      query {
        items {
          id
          name
          shortName
          description
          basePrice
          weight
          gridImageLink
          iconLink
        }
      }
    `;

    try {
      const response = await fetch("https://api.tarkov.dev/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.items;
    } catch (err) {
      console.error("Erro ao buscar itens:", err);
      throw err;
    }
  }, []);

  // Query GraphQL para buscar estações do hideout
  const fetchHideoutStations = useCallback(async () => {
    const query = `
      query {
        hideoutStations {
          id
          name
          levels {
            level
            itemRequirements {
              item {
                id
                name
              }
              count
            }
            traderRequirements {
              trader {
                id
                name
              }
              level
            }
            skillRequirements {
              name
              level
            }
          }
        }
      }
    `;

    try {
      const response = await fetch("https://api.tarkov.dev/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.hideoutStations;
    } catch (err) {
      console.error("Erro ao buscar estações do hideout:", err);
      throw err;
    }
  }, []);

  // Buscar todos os dados
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [itemsData, hideoutData] = await Promise.all([
        fetchItems(),
        fetchHideoutStations(),
      ]);

      setItems(itemsData);
      setHideoutStations(hideoutData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [fetchItems, fetchHideoutStations]);

  // Buscar itens por query
  const searchItems = useCallback(
    async (query: string): Promise<TarkovItem[]> => {
      if (!query.trim()) return [];

      const searchQuery = `
      query SearchItems($query: String!) {
        items(name: $query, limit: 20) {
          id
          name
          shortName
          description
          basePrice
          weight
          gridImageLink
          iconLink
        }
      }
    `;

      try {
        const response = await fetch("https://api.tarkov.dev/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            variables: { query: query.trim() },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        return data.data.items;
      } catch (err) {
        console.error("Erro ao buscar itens:", err);
        return [];
      }
    },
    []
  );

  // Buscar requisitos específicos do hideout
  const getHideoutRequirements = useCallback(async () => {
    try {
      const stations = await fetchHideoutStations();
      const items = await fetchItems();

      // Usar o conversor para formatar os dados
      const processedStations = convertApiDataToLocalFormat(stations, items);

      return processedStations;
    } catch (err) {
      console.error("Erro ao processar requisitos do hideout:", err);
      throw err;
    }
  }, [fetchHideoutStations, fetchItems]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    items,
    hideoutStations,
    loading,
    error,
    refreshData,
    searchItems,
    getHideoutRequirements,
    getItemsMap: () => createItemsMap(items),
    compareWithLocalData: (localData: any[] | null | undefined) =>
      compareHideoutData(localData, hideoutStations),
    generateChangeReport: (localData: any[] | null | undefined) => {
      const changes = compareHideoutData(localData, hideoutStations);
      return generateChangeReport(changes);
    },
    syncItemsWithLocalData: (localItems: Record<string, LocalItem>) =>
      syncItemsWithApi(localItems, items),
    generateItemsSyncReport: (
      syncResult: ReturnType<typeof syncItemsWithApi>
    ) => generateItemsSyncReport(syncResult),
    applyChangesToLocalData: (localData: any[]) =>
      applyApiChangesToLocalData(localData, hideoutStations),
  };
}
