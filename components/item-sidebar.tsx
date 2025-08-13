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
  }
  .item-zoom:hover {
    transform: scale(2.1);
    z-index: 9999 !important;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  }
`;

interface ItemSidebarProps {
  progress?: Record<string, number>;
  hideCompleted?: boolean;
  onHideCompletedChange?: (hide: boolean) => void;
}

export const ItemSidebar: React.FC<ItemSidebarProps> = ({
  progress: progressProp,
  hideCompleted = false,
  onHideCompletedChange,
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

    // Ordenar por nome
    return items.sort((a, b) => {
      const nameA = itemsMap[a] || a;
      const nameB = itemsMap[b] || b;
      return nameA.localeCompare(nameB);
    });
  }, [itemTotals, itemFound, hideCompleted, itemsMap]);

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
      <aside className="w-72 p-4 bg-background border-r border-border h-full overflow-y-auto overflow-x-visible">
        <div className="text-muted-foreground">Carregando itens...</div>
      </aside>
    );
  }

  return (
    <aside className="w-72 p-4 bg-background border-r border-border h-full overflow-y-auto overflow-x-visible">
      <style dangerouslySetInnerHTML={{ __html: zoomStyle }} />
      <h2 className="text-lg font-bold mb-4">Itens necessários no Hideout</h2>

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

      <ul className="space-y-2 relative">
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
              className={`flex items-center gap-3 relative transition-colors duration-300 ${bg}`}
            >
              <div className="relative">
                <img
                  src={`https://assets.tarkov.dev/${itemId}-icon.webp`}
                  alt={itemsMap[itemId] || itemId}
                  className="w-8 h-8 rounded bg-muted object-contain border item-zoom cursor-pointer"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <span className="flex-1 truncate">
                {itemsMap[itemId] || itemId}
              </span>
              <span className="font-bold text-primary text-right min-w-[48px]">
                {found}/{total}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default ItemSidebar;
