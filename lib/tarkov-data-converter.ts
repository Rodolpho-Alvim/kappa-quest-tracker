/**
 * Utilitário para converter dados da API do Tarkov.dev para o formato usado pelo nosso sistema
 */

export interface ApiHideoutStation {
  id: string;
  name: string;
  levels: {
    level: number;
    itemRequirements: {
      item: {
        id: string;
        name: string;
        shortName: string;
      };
      count: number;
    }[];
    traderRequirements: {
      trader: {
        id: string;
        name: string;
      };
      level: number;
    }[];
    skillRequirements: {
      name: string;
      level: number;
    }[];
  }[];
}

export interface ConvertedHideoutStation {
  id: string;
  name: string;
  description: string;
  levels: {
    level: number;
    requirements: {
      type: "item" | "trader" | "skill" | "module";
      itemId?: string;
      itemName?: string;
      quantity?: number;
      traderId?: string;
      traderName?: string;
      skill?: string;
      module?: string;
    }[];
  }[];
}

export interface ApiItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  basePrice: number;
  weight: number;
  gridImageLink: string;
  iconLink: string;
}

/**
 * Interface para itens locais (compatível com items.json)
 */
export interface LocalItem {
  id: string;
  name: string;
  icon?: string;
  shortName?: string;
  description?: string;
}

/**
 * Converte dados da API para o formato do nosso sistema
 */
export function convertApiDataToLocalFormat(
  apiStations: ApiHideoutStation[],
  apiItems: ApiItem[]
): ConvertedHideoutStation[] {
  return apiStations.map((station) => ({
    id: station.id,
    name: station.name,
    description: `Estação ${station.name} do Hideout`,
    levels: station.levels.map((level) => ({
      level: level.level,
      requirements: [
        // Requisitos de itens
        ...level.itemRequirements.map((req) => ({
          type: "item" as const,
          itemId: req.item.id,
          itemName: req.item.name,
          quantity: req.count,
        })),
        // Requisitos de traders
        ...level.traderRequirements.map((req) => ({
          type: "trader" as const,
          traderId: req.trader.id,
          traderName: req.trader.name,
          level: req.level,
        })),
        // Requisitos de skills
        ...level.skillRequirements.map((req) => ({
          type: "skill" as const,
          skill: req.name,
          level: req.level,
        })),
      ],
    })),
  }));
}

/**
 * Atualiza dados locais com dados da API, aplicando as mudanças detectadas
 */
export function applyApiChangesToLocalData(
  localData: any[],
  apiData: ApiHideoutStation[]
): any[] {
  if (!localData || !Array.isArray(localData)) {
    return convertApiDataToLocalFormat(apiData, []);
  }

  return localData.map((localStation) => {
    // Buscar estação correspondente na API por nome (mais confiável que ID)
    const apiStation = apiData.find(
      (s) => s.name.toLowerCase() === localStation.name.toLowerCase()
    );

    if (!apiStation) {
      console.log(`⚠️ Estação não encontrada na API: ${localStation.name}`);
      return localStation; // Manter estação local se não existir na API
    }

    return {
      ...localStation,
      levels: localStation.levels.map((localLevel: any) => {
        const apiLevel = apiStation.levels.find(
          (l) => l.level === localLevel.level
        );

        if (!apiLevel) {
          console.log(
            `⚠️ Nível ${localLevel.level} não encontrado na API para ${localStation.name}`
          );
          return localLevel; // Manter nível local se não existir na API
        }

        return {
          ...localLevel,
          requirements: localLevel.requirements.map((localReq: any) => {
            if (localReq.type === "item") {
              // Buscar item na API por nome (mais confiável que ID)
              const apiReq = apiLevel.itemRequirements.find(
                (r) =>
                  r.item.name.toLowerCase() ===
                    localReq.itemName?.toLowerCase() ||
                  r.item.name.toLowerCase() === localReq.itemId?.toLowerCase()
              );

              if (apiReq) {
                console.log(
                  `🔄 Atualizando ${localReq.itemName || localReq.itemId}: ${
                    localReq.quantity
                  } → ${apiReq.count}`
                );
                // Atualizar quantidade com dados da API
                return {
                  ...localReq,
                  quantity: apiReq.count,
                  itemName: apiReq.item.name,
                };
              } else {
                console.log(
                  `⚠️ Item não encontrado na API: ${
                    localReq.itemName || localReq.itemId
                  }`
                );
              }
            }

            return localReq; // Manter outros tipos de requisitos
          }),
        };
      }),
    };
  });
}

/**
 * Cria um mapeamento de itens da API para uso local
 */
export function createItemsMap(apiItems: ApiItem[]): Record<string, string> {
  const itemsMap: Record<string, string> = {};

  apiItems.forEach((item) => {
    itemsMap[item.id] = item.name;
    // Também mapear pelo nome curto para compatibilidade
    if (item.shortName && item.shortName !== item.name) {
      itemsMap[item.shortName] = item.name;
    }
  });

  return itemsMap;
}

/**
 * Sincroniza dados de itens locais com a API, incluindo ícones
 */
export function syncItemsWithApi(
  localItems: Record<string, LocalItem>,
  apiItems: ApiItem[]
): {
  updatedItems: Record<string, LocalItem>;
  newItems: string[];
  updatedIcons: string[];
  removedItems: string[];
} {
  const updatedItems: Record<string, LocalItem> = { ...localItems };
  const newItems: string[] = [];
  const updatedIcons: string[] = [];
  const removedItems: string[] = [];

  // Processar itens da API
  apiItems.forEach((apiItem) => {
    const localItem = localItems[apiItem.id];

    if (!localItem) {
      // Novo item
      updatedItems[apiItem.id] = {
        id: apiItem.id,
        name: apiItem.name,
        shortName: apiItem.shortName,
        description: apiItem.description,
        icon: apiItem.iconLink || apiItem.gridImageLink,
      };
      newItems.push(apiItem.name);
    } else {
      // Item existente - verificar se precisa atualizar
      const needsUpdate =
        localItem.name !== apiItem.name ||
        localItem.shortName !== apiItem.shortName ||
        localItem.description !== apiItem.description ||
        localItem.icon !== (apiItem.iconLink || apiItem.gridImageLink);

      if (needsUpdate) {
        updatedItems[apiItem.id] = {
          ...localItem,
          name: apiItem.name,
          shortName: apiItem.shortName,
          description: apiItem.description,
          icon: apiItem.iconLink || apiItem.gridImageLink,
        };

        // Se o ícone mudou, marcar como atualizado
        if (localItem.icon !== (apiItem.iconLink || apiItem.gridImageLink)) {
          updatedIcons.push(apiItem.name);
        }
      }
    }
  });

  // Identificar itens locais que não estão mais na API
  Object.keys(localItems).forEach((itemId) => {
    if (!apiItems.find((api) => api.id === itemId)) {
      removedItems.push(localItems[itemId].name);
      delete updatedItems[itemId];
    }
  });

  return {
    updatedItems,
    newItems,
    updatedIcons,
    removedItems,
  };
}

/**
 * Gera relatório de sincronização de itens
 */
export function generateItemsSyncReport(
  syncResult: ReturnType<typeof syncItemsWithApi>
): string {
  let report = "📦 Relatório de Sincronização de Itens\n\n";

  if (syncResult.newItems.length > 0) {
    report += `🆕 Novos Itens (${syncResult.newItems.length}):\n`;
    syncResult.newItems.forEach((item) => {
      report += `  • ${item}\n`;
    });
    report += "\n";
  }

  if (syncResult.updatedIcons.length > 0) {
    report += `🖼️ Ícones Atualizados (${syncResult.updatedIcons.length}):\n`;
    syncResult.updatedIcons.forEach((item) => {
      report += `  • ${item}\n`;
    });
    report += "\n";
  }

  if (syncResult.removedItems.length > 0) {
    report += `🗑️ Itens Removidos (${syncResult.removedItems.length}):\n`;
    syncResult.removedItems.forEach((item) => {
      report += `  • ${item}\n`;
    });
    report += "\n";
  }

  if (
    syncResult.newItems.length === 0 &&
    syncResult.updatedIcons.length === 0 &&
    syncResult.removedItems.length === 0
  ) {
    report +=
      "✅ Nenhuma mudança detectada nos itens. Dados já estão atualizados!\n";
  }

  return report;
}

/**
 * Compara dados locais com dados da API e retorna as diferenças
 */
export function compareHideoutData(
  localData: any[] | null | undefined,
  apiData: ApiHideoutStation[]
): {
  newStations: string[];
  updatedStations: string[];
  newItems: string[];
  changedQuantities: Array<{
    station: string;
    level: number;
    itemId: string;
    oldQuantity: number;
    newQuantity: number;
    itemName: string;
  }>;
} {
  const newStations: string[] = [];
  const updatedStations: string[] = [];
  const newItems: string[] = [];
  const changedQuantities: Array<{
    station: string;
    level: number;
    itemId: string;
    oldQuantity: number;
    newQuantity: number;
    itemName: string;
  }> = [];

  if (!localData || !Array.isArray(localData) || localData.length === 0) {
    // Primeira sincronização
    newStations.push(...apiData.map((s) => s.name));
    apiData.forEach((station) => {
      station.levels.forEach((level) => {
        level.itemRequirements.forEach((req) => {
          newItems.push(req.item.name);
        });
      });
    });
    return { newStations, updatedStations, newItems, changedQuantities };
  }

  // Comparar estações existentes
  apiData.forEach((apiStation) => {
    const localStation = localData.find(
      (s) => s.name.toLowerCase() === apiStation.name.toLowerCase()
    );

    if (!localStation) {
      newStations.push(apiStation.name);
      return;
    }

    // Comparar níveis
    apiStation.levels.forEach((apiLevel) => {
      const localLevel = localStation.levels?.find(
        (l: any) => l.level === apiLevel.level
      );

      if (!localLevel) {
        updatedStations.push(apiStation.name);
        return;
      }

      // Comparar requisitos de itens
      apiLevel.itemRequirements.forEach((apiReq) => {
        const localReq = localLevel.requirements?.find(
          (r: any) =>
            r.type === "item" &&
            (r.itemName?.toLowerCase() === apiReq.item.name.toLowerCase() ||
              r.itemId?.toLowerCase() === apiReq.item.name.toLowerCase())
        );

        if (!localReq) {
          newItems.push(apiReq.item.name);
        } else if (localReq.quantity !== apiReq.count) {
          changedQuantities.push({
            station: apiStation.name,
            level: apiLevel.level,
            itemId: apiReq.item.id,
            oldQuantity: localReq.quantity,
            newQuantity: apiReq.count,
            itemName: apiReq.item.name,
          });
        }
      });
    });
  });

  return { newStations, updatedStations, newItems, changedQuantities };
}

/**
 * Gera um relatório de mudanças em formato legível
 */
export function generateChangeReport(
  changes: ReturnType<typeof compareHideoutData>
): string {
  let report = "📊 Relatório de Sincronização\n\n";

  if (changes.newStations.length > 0) {
    report += `🆕 Novas Estações:\n${changes.newStations
      .map((s) => `  • ${s}`)
      .join("\n")}\n\n`;
  }

  if (changes.updatedStations.length > 0) {
    report += `🔄 Estações Atualizadas:\n${changes.updatedStations
      .map((s) => `  • ${s}`)
      .join("\n")}\n\n`;
  }

  if (changes.newItems.length > 0) {
    report += `📦 Novos Itens:\n${changes.newItems
      .map((i) => `  • ${i}`)
      .join("\n")}\n\n`;
  }

  if (changes.changedQuantities.length > 0) {
    report += `🔢 Quantidades Alteradas:\n`;
    changes.changedQuantities.forEach((change) => {
      report += `  • ${change.station} Nível ${change.level}: ${
        change.itemName || change.itemId
      } (${change.oldQuantity} → ${change.newQuantity})\n`;
    });
    report += "\n";
  }

  if (
    changes.newStations.length === 0 &&
    changes.updatedStations.length === 0 &&
    changes.newItems.length === 0 &&
    changes.changedQuantities.length === 0
  ) {
    report += "✅ Nenhuma mudança detectada. Dados já estão atualizados!\n";
  }

  return report;
}
