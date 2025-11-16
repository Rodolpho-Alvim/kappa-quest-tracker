import { useHideoutStations } from "@/hooks/use-hideout-stations";
import { useItemsMap } from "@/hooks/use-items-map";
import { useLocalStorage } from "@/hooks/use-local-storage";
import React from "react";

// Estilo CSS customizado para o efeito de zoom
const zoomStyle = `
  .item-zoom {
    transition: transform 0.3s ease;
    transform-origin: center;
    position: relative;
    max-width: 100%;
    overflow: visible;
  }
  .item-zoom:hover {
    transform: scale(2.1);
    z-index: 9999 !important;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  }
  .item-zoom:hover img {
    overflow: visible !important;
  }
`;

interface ItemSidebarProps {
  progress?: Record<string, number>;
  setProgress?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  hideCompleted?: boolean;
  onHideCompletedChange?: (hide: boolean) => void;
  searchTerm?: string; // Termo de pesquisa para destacar itens
}

export const ItemSidebar: React.FC<ItemSidebarProps> = ({
  progress: progressProp,
  setProgress,
  hideCompleted = false,
  onHideCompletedChange,
  searchTerm,
}) => {
  const { stations, loading } = useHideoutStations();
  const { itemsMap, loading: loadingItems } = useItemsMap();
  const [progressLS] = useLocalStorage<Record<string, number>>(
    "kappa-hideout-progress",
    {}
  );
  const progress = progressProp || progressLS;
  const [itemTotals, setItemTotals] = React.useState<Record<string, number>>(
    {}
  );
  const [itemFound, setItemFound] = React.useState<Record<string, number>>({});

  // Função para encontrar a próxima estação/nível que precisa de um item
  const findNextStationForItem = React.useCallback(
    (itemId: string, currentAmount: number) => {
      if (!setProgress) return;

      // Percorrer todas as estações em ordem
      for (const station of stations) {
        // Percorrer os níveis em ordem crescente
        for (const level of station.levels) {
          const itemReq = level.requirements?.find(
            (req: any) => req.type === "item" && req.itemId === itemId
          );

          if (itemReq) {
            const progressKey = `${station.name}-lvl${level.level}-${itemId}`;
            const currentProgress = progress[progressKey] || 0;
            const required = itemReq.quantity || 0;

            // Se este nível ainda precisa de mais itens
            if (currentProgress < required) {
              const canAdd = Math.min(
                currentAmount,
                required - currentProgress
              );
              if (canAdd > 0) {
                return { station, level, progressKey, canAdd };
              }
            }
          }
        }
      }
      return null;
    },
    [stations, progress, setProgress]
  );

  // Função para adicionar item ao próximo nível disponível
  const addItemToNextLevel = React.useCallback(
    (itemId: string, amount: number = 1) => {
      if (!setProgress) return;

      let remainingAmount = amount;

      while (remainingAmount > 0) {
        const nextStation = findNextStationForItem(itemId, remainingAmount);
        if (!nextStation) break;

        const { progressKey, canAdd } = nextStation;
        const currentProgress = progress[progressKey] || 0;

        setProgress((prev) => ({
          ...prev,
          [progressKey]: currentProgress + canAdd,
        }));

        remainingAmount -= canAdd;
      }
    },
    [findNextStationForItem, progress, setProgress]
  );

  // Função para remover item do último nível preenchido
  const removeItemFromLastLevel = React.useCallback(
    (itemId: string, amount: number = 1) => {
      if (!setProgress) return;

      let remainingAmount = amount;

      // Percorrer estações em ordem reversa para encontrar o último nível preenchido
      for (let i = stations.length - 1; i >= 0; i--) {
        const station = stations[i];
        for (let j = station.levels.length - 1; j >= 0; j--) {
          const level = station.levels[j];
          const itemReq = level.requirements?.find(
            (req: any) => req.type === "item" && req.itemId === itemId
          );

          if (itemReq) {
            const progressKey = `${station.name}-lvl${level.level}-${itemId}`;
            const currentProgress = progress[progressKey] || 0;

            if (currentProgress > 0) {
              const canRemove = Math.min(remainingAmount, currentProgress);
              if (canRemove > 0) {
                setProgress((prev) => ({
                  ...prev,
                  [progressKey]: currentProgress - canRemove,
                }));
                remainingAmount -= canRemove;
                if (remainingAmount <= 0) break;
              }
            }
          }
        }
        if (remainingAmount <= 0) break;
      }
    },
    [stations, progress, setProgress]
  );

  // Função para completar todas as unidades de um item de uma vez
  const completeAllItemUnits = React.useCallback(
    (itemId: string) => {
      if (!setProgress) return;

      // Percorrer todas as estações em ordem para preencher todos os níveis
      for (const station of stations) {
        for (const level of station.levels) {
          const itemReq = level.requirements?.find(
            (req: any) => req.type === "item" && req.itemId === itemId
          );

          if (itemReq) {
            const progressKey = `${station.name}-lvl${level.level}-${itemId}`;
            const currentProgress = progress[progressKey] || 0;
            const required = itemReq.quantity || 0;

            // Se este nível ainda precisa de mais itens, preencher completamente
            if (currentProgress < required) {
              setProgress((prev) => ({
                ...prev,
                [progressKey]: required,
              }));
            }
          }
        }
      }
    },
    [stations, progress, setProgress]
  );

  // Função para zerar completamente o progresso de um item
  const resetItemProgress = React.useCallback(
    (itemId: string) => {
      if (!setProgress) return;

      // Percorrer todas as estações para zerar todos os níveis deste item
      for (const station of stations) {
        for (const level of station.levels) {
          const itemReq = level.requirements?.find(
            (req: any) => req.type === "item" && req.itemId === itemId
          );

          if (itemReq) {
            const progressKey = `${station.name}-lvl${level.level}-${itemId}`;
            const currentProgress = progress[progressKey] || 0;

            // Se este nível tem progresso, zerar
            if (currentProgress > 0) {
              setProgress((prev) => ({
                ...prev,
                [progressKey]: 0,
              }));
            }
          }
        }
      }
    },
    [stations, progress, setProgress]
  );

  // Reverse map: nome -> id
  const nameToId = React.useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(itemsMap).forEach(([id, name]) => {
      map[(name as string).toLowerCase()] = id;
    });
    return map;
  }, [itemsMap]);

  // Ordenar por nome do item (alfabético) e filtrar itens completos se necessário
  const sortedItems = React.useMemo(() => {
    let items = Object.keys(itemTotals);

    // Se o checkbox estiver marcado, filtrar itens completos
    if (hideCompleted) {
      items = items.filter((itemId) => {
        const found = itemFound[itemId] || 0;
        const total = itemTotals[itemId] || 0;
        return found < total; // Mostrar apenas itens incompletos
      });
    }

    // Se houver termo de pesquisa, filtrar apenas itens que correspondem
    if (searchTerm && searchTerm.trim()) {
      items = items.filter((itemId) => {
        const itemName = itemsMap[itemId] || itemId;
        return itemName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Ordenar por nome
    return items.sort((a, b) => {
      const nameA = itemsMap[a] || a;
      const nameB = itemsMap[b] || b;
      return nameA.localeCompare(nameB);
    });
  }, [itemTotals, itemFound, hideCompleted, itemsMap, searchTerm]);

  React.useEffect(() => {
    if (loading) return;
    const totals: Record<string, number> = {};
    const found: Record<string, number> = {};
    stations.forEach((station) => {
      station.levels.forEach((level: any) => {
        (level.requirements || [])
          .filter((req: any) => req.type === "item")
          .forEach((req: any) => {
            // Sempre tentar obter o ID
            let itemId = req.itemId;
            if (!itemId && req.name) {
              // Tentar converter nome para id
              const idByName = nameToId[(req.name || "").toLowerCase()];
              if (idByName) itemId = idByName;
            }
            if (!itemId) return; // Ignorar se não conseguir ID
            // Total necessário
            totals[itemId] = (totals[itemId] || 0) + (req.quantity || 0);
            // Progresso encontrado - chave EXATAMENTE igual ao HideoutCard
            const progressKey = `${station.name}-lvl${level.level}-${itemId}`;
            found[itemId] = (found[itemId] || 0) + (progress[progressKey] || 0);
          });
      });
    });
    setItemTotals(totals);
    setItemFound(found);
  }, [stations, loading, progress, nameToId]);

  if (loading || loadingItems) {
    return (
      <aside className="w-80 p-4 bg-background border-r border-border h-full overflow-y-auto overflow-x-hidden">
        <div className="text-muted-foreground">Carregando itens...</div>
      </aside>
    );
  }

  return (
    <aside className="w-72 p-4 bg-background border-r border-border h-full overflow-y-auto overflow-x-hidden max-w-[288px]">
      <style dangerouslySetInnerHTML={{ __html: zoomStyle }} />
      <div className="w-full max-w-full overflow-x-hidden">
        <h2 className="text-lg font-bold mb-4">Itens necessários no Hideout</h2>

      {/* Indicador de pesquisa */}
      {searchTerm && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            🔍 Pesquisando por:{" "}
            <span className="font-semibold">"{searchTerm}"</span>
            <span className="ml-2 text-xs opacity-75">
              ({sortedItems.length}{" "}
              {sortedItems.length === 1
                ? "item encontrado"
                : "itens encontrados"}
              )
            </span>
          </span>
        </div>
      )}

      {/* Checkbox para ocultar itens completos */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => onHideCompletedChange?.(e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-muted-foreground">Ocultar itens completos</span>
        </label>
      </div>

      {sortedItems.length === 0 && searchTerm ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">Nenhum item encontrado para "{searchTerm}"</p>
          <p className="text-xs mt-1">Tente um termo diferente</p>
        </div>
      ) : (
        <ul className="space-y-2 relative overflow-x-hidden">
          {sortedItems.map((itemId) => {
            const found = itemFound[itemId] || 0;
            const total = itemTotals[itemId] || 0;
            const percent = total > 0 ? (found / total) * 100 : 0;
            let bg = "";
            if (percent >= 100) {
              bg = "bg-green-200 dark:bg-green-700/70";
            } else if (percent >= 90) {
              bg = "bg-yellow-500 dark:bg-yellow-500/90";
            } else if (percent >= 80) {
              bg = "bg-yellow-400 dark:bg-yellow-500/80";
            } else if (percent >= 70) {
              bg = "bg-yellow-300 dark:bg-yellow-500/70";
            } else if (percent >= 60) {
              bg = "bg-yellow-200 dark:bg-yellow-500/60";
            } else if (percent >= 50) {
              bg = "bg-yellow-200 dark:bg-yellow-500/50";
            } else if (percent >= 40) {
              bg = "bg-yellow-100 dark:bg-yellow-500/40";
            } else if (percent >= 30) {
              bg = "bg-yellow-100 dark:bg-yellow-500/30";
            } else if (percent >= 20) {
              bg = "bg-yellow-100 dark:bg-yellow-500/20";
            } else if (percent >= 10) {
              bg = "bg-yellow-100 dark:bg-yellow-500/15";
            } else if (percent >= 1) {
              bg = "bg-yellow-100 dark:bg-yellow-500/10";
            } else {
              bg = "";
            }
            return (
              <li
                key={itemId}
                className={`relative transition-all duration-300 ${bg} p-3 rounded-lg overflow-hidden ${
                  searchTerm &&
                  (itemsMap[itemId] || itemId)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                    ? "ring-2 ring-blue-500 ring-opacity-70 shadow-lg scale-[1.02]"
                    : ""
                }`}
              >
                {/* Primeira linha: Ícone + Nome do item */}
                <div className="flex items-center gap-3 mb-2 overflow-hidden">
                  <div className="relative flex-shrink-0 overflow-visible">
                    <img
                      src={`https://assets.tarkov.dev/${itemId}-icon.webp`}
                      alt={itemsMap[itemId] || itemId}
                      className="w-8 h-8 rounded bg-muted object-contain border item-zoom cursor-pointer max-w-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <span className="text-sm font-medium block truncate">
                      {itemsMap[itemId] || itemId}
                    </span>
                  </div>
                </div>

                {/* Segunda linha: Botões de controle centralizados */}
                {setProgress && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {/* Botão de reset para zerar o item */}
                    <button
                      onClick={() => resetItemProgress(itemId)}
                      disabled={found <= 0}
                      className="w-7 h-7 rounded border border-red-300 hover:border-red-400 disabled:border-red-200 disabled:cursor-not-allowed text-red-600 hover:text-red-800 disabled:text-red-300 text-sm font-medium flex items-center justify-center transition-all hover:bg-red-50"
                      title="Zerar progresso deste item"
                    >
                      ↺
                    </button>

                    <button
                      onClick={() => removeItemFromLastLevel(itemId, 1)}
                      disabled={found <= 0}
                      className="w-7 h-7 rounded border border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-600 hover:text-gray-800 disabled:text-gray-300 text-sm font-medium flex items-center justify-center transition-all hover:bg-gray-50"
                      title="Remover 1 item"
                    >
                      −
                    </button>

                    <span className="font-bold text-primary text-center min-w-[52px] text-sm">
                      {found}/{total}
                    </span>

                    <button
                      onClick={() => addItemToNextLevel(itemId, 1)}
                      disabled={found >= total}
                      className="w-7 h-7 rounded border border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-600 hover:text-gray-800 disabled:text-gray-300 text-sm font-medium flex items-center justify-center transition-all hover:bg-gray-50"
                      title="Adicionar 1 item"
                    >
                      +
                    </button>

                    {/* Botão de check para completar todas as unidades */}
                    <button
                      onClick={() => completeAllItemUnits(itemId)}
                      disabled={found >= total}
                      className="w-7 h-7 rounded border border-green-300 hover:border-green-400 disabled:border-green-200 disabled:cursor-not-allowed text-green-600 hover:text-green-800 disabled:text-green-300 text-sm font-medium flex items-center justify-center transition-all hover:bg-green-50"
                      title="Completar todas as unidades deste item"
                    >
                      ✓
                    </button>
                  </div>
                )}

                {/* Terceira linha: Estação */}
                {setProgress && found < total && (
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground block">
                      Estação:{" "}
                      {(() => {
                        const nextStation = findNextStationForItem(itemId, 1);
                        if (nextStation) {
                          return `${nextStation.station.name} Nível ${nextStation.level.level}`;
                        }
                        return "Nenhum nível disponível";
                      })()}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </aside>
  );
};

export default ItemSidebar;
