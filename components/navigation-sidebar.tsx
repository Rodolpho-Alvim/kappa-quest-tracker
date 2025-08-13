"use client";

import {
  CraftItem,
  HideoutItem,
  QuestItem,
  StreamerItem,
  UserProgress,
} from "@/types/quest-data";
import { useEffect, useState } from "react";

interface NavigationSidebarProps {
  sections: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
    items: Array<QuestItem | StreamerItem | CraftItem | HideoutItem>;
  }>;
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  getSectionOrder: (sectionId: string) => number;
  setFullSectionOrder: (order: string[]) => void;
  userProgress: UserProgress;
  onProgressUpdate: (itemId: string, field: string, value: any) => void;
  searchTerm: string; // Termo de busca da página principal
}

// Componente de item
function ItemDisplay({
  item,
  userProgress,
  onProgressUpdate,
  isCompleted,
}: {
  item: QuestItem | StreamerItem | CraftItem | HideoutItem;
  userProgress: UserProgress;
  onProgressUpdate: (itemId: string, field: string, value: any) => void;
  isCompleted: boolean;
}) {
  const progress = userProgress[item.id] || {};
  const qtdE = Number(progress.qtdE ?? item.qtdE ?? 0);
  const qtdR = Number(progress.qtdR ?? item.qtdR ?? 0);

  const addItem = () => {
    const newValue = Math.min(qtdE + 1, qtdR);
    onProgressUpdate(item.id, "qtdE", newValue);
  };

  const removeItem = () => {
    const newValue = Math.max(qtdE - 1, 0);
    onProgressUpdate(item.id, "qtdE", newValue);
  };

  const resetItem = () => {
    onProgressUpdate(item.id, "qtdE", 0);
  };

  const completeItem = () => {
    onProgressUpdate(item.id, "qtdE", qtdR);
  };

  // Forçar re-render quando o progresso mudar
  useEffect(() => {
    // Este useEffect garante que o componente seja re-renderizado
    // quando o userProgress mudar
  }, [userProgress[item.id]]);

  return (
    <div
      className={`group border border-border/50 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:border-border/70 ${
        isCompleted
          ? "bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/30"
          : "bg-card hover:bg-card/80"
      }`}
    >
      {/* Nome do item */}
      <div
        className={`font-medium mb-3 text-sm leading-tight ${
          isCompleted ? "text-green-700 dark:text-green-300" : "text-foreground"
        }`}
      >
        {item.item}
        {isCompleted && <span className="ml-2 text-green-600">✓</span>}
      </div>

      {/* Controles e progresso */}
      <div className="flex items-center justify-center gap-2">
        {/* Botões de controle */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetItem}
            disabled={qtdE <= 0}
            className="w-8 h-8 rounded-lg border border-red-200 hover:border-red-300 disabled:border-red-100 disabled:cursor-not-allowed text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-red-300 text-sm font-medium flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            title="Zerar progresso"
          >
            ↺
          </button>

          <button
            onClick={removeItem}
            disabled={qtdE <= 0}
            className="w-8 h-8 rounded-lg border border-gray-200 hover:border-gray-300 disabled:border-gray-100 disabled:cursor-not-allowed text-gray-600 hover:text-gray-700 hover:bg-gray-50 disabled:text-gray-300 text-sm font-medium flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            title="Remover 1 item"
          >
            −
          </button>

          <span
            className={`font-bold text-center min-w-[52px] text-sm px-3 py-1.5 rounded-full ${
              isCompleted
                ? "text-green-700 bg-green-100 dark:bg-green-800/30 dark:text-green-300"
                : "text-primary bg-primary/10"
            }`}
          >
            {qtdE}/{qtdR}
          </span>

          <button
            onClick={addItem}
            disabled={qtdE >= qtdR}
            className="w-8 h-8 rounded-lg border border-gray-200 hover:border-gray-300 disabled:border-gray-100 disabled:cursor-not-allowed text-gray-600 hover:text-gray-700 hover:bg-gray-50 disabled:text-gray-300 text-sm font-medium flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            title="Adicionar 1 item"
          >
            +
          </button>

          <button
            onClick={completeItem}
            disabled={qtdE >= qtdR}
            className="w-8 h-8 rounded-lg border border-green-200 hover:border-green-300 disabled:border-green-100 disabled:cursor-not-allowed text-green-600 hover:text-green-700 hover:bg-green-50 disabled:text-green-300 text-sm font-medium flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            title="Completar item"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

const NavigationSidebar = ({
  sections,
  activeSection,
  onSectionClick,
  getSectionOrder,
  setFullSectionOrder,
  userProgress,
  onProgressUpdate,
  searchTerm,
}: NavigationSidebarProps) => {
  const [hideCompleted, setHideCompleted] = useState(false);

  // Garante que todas as seções tenham uma ordem inicial baseada na ordem do array original
  const ensureOrder = () => {
    sections.forEach((section, idx) => {
      if (getSectionOrder(section.id) === 999) {
        setFullSectionOrder(sections.map((s) => s.id));
      }
    });
  };

  useEffect(() => {
    ensureOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sections)]);

  // Forçar re-render quando userProgress mudar
  useEffect(() => {
    // Este useEffect garante que o sidebar seja re-renderizado
    // quando qualquer item do userProgress mudar
  }, [userProgress]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      onSectionClick(sectionId);
    }
  };

  // Ordenar seções baseado apenas na ordem salva
  const sortedSections = [...sections].sort((a, b) => {
    return getSectionOrder(a.id) - getSectionOrder(b.id);
  });

  // Função para verificar se um item está completo
  const isItemCompleted = (item: any): boolean => {
    if (item.isReference) return false;
    const progress = userProgress[item.id] || {};
    const qtdE = Number(progress.qtdE ?? item.qtdE ?? 0);
    const qtdR = Number(progress.qtdR ?? item.qtdR ?? 0);
    const firRequired = item.fir === "Yes" || progress.fir === "Yes";
    const firOk = !firRequired || progress.fir === "Yes" || item.fir === "Yes";
    return qtdE >= qtdR && firOk && qtdR > 0;
  };

  // Coletar itens baseado na preferência do usuário
  const allItems = sortedSections.flatMap((section) =>
    section.items.filter((item) => !(item as any).isReference)
  );

  // Ordenar itens alfabeticamente
  const sortedItems = [...allItems].sort((a, b) =>
    a.item.localeCompare(b.item, "pt-BR", { sensitivity: "base" })
  );

  // Filtrar itens baseado na busca e no checkbox
  const filteredItems = sortedItems.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = !hideCompleted || !isItemCompleted(item);
    return matchesSearch && matchesVisibility;
  });

  // Itens a serem exibidos
  const itemsToShow = filteredItems;

  return (
    <div className="mt-0 md:mt-[10%]">
      <div className="flex flex-col h-full">
        {/* Header elegante */}
        <div className="p-6 pb-4 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground mb-2">
            🎯 Kappa Progress
          </h2>
          <p className="text-sm text-muted-foreground">
            {sortedItems.filter((item) => !isItemCompleted(item)).length} itens
            restantes
            {!hideCompleted &&
              sortedItems.filter((item) => isItemCompleted(item)).length >
                0 && (
                <span className="ml-2 text-green-600">
                  • {sortedItems.filter((item) => isItemCompleted(item)).length}{" "}
                  completos
                </span>
              )}
            {searchTerm && (
              <span className="block mt-1 text-blue-600">
                🔍 {itemsToShow.length} resultado
                {itemsToShow.length !== 1 ? "s" : ""} para "{searchTerm}"
              </span>
            )}
          </p>
        </div>

        {/* Checkbox para ocultar itens completos */}
        <div className="p-4 border-b border-border/30 bg-muted/20">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-muted-foreground">
              Ocultar itens completos
            </span>
          </label>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-4 overflow-y-auto">
          {itemsToShow.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Kappa Container Desbloqueado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Parabéns! Todos os itens foram coletados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {itemsToShow.map((item) => (
                <ItemDisplay
                  key={`${item.id}-${userProgress[item.id]?.qtdE ?? 0}`}
                  item={item}
                  userProgress={userProgress}
                  onProgressUpdate={onProgressUpdate}
                  isCompleted={isItemCompleted(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
