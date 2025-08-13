import React, { useMemo } from "react";

interface SectionListProps {
  sortedSectionConfigs: any[];
  getFilteredItems: (items: any[]) => any[];
  renderSection: (config: any) => React.ReactNode;
}

export const SectionList: React.FC<SectionListProps> = ({
  sortedSectionConfigs,
  getFilteredItems,
  renderSection,
}) => {
  const filteredConfigs = sortedSectionConfigs.filter(
    (config) => getFilteredItems(config.items).length > 0
  );

  // Calcula a altura aproximada de cada card baseado no número de itens
  const cardsWithHeight = useMemo(() => {
    return filteredConfigs.map((config) => {
      const itemCount = getFilteredItems(config.items).length;
      // Altura base do header + altura por item + margem
      const estimatedHeight = 128 + itemCount * 60 + 24;
      return { config, estimatedHeight };
    });
  }, [filteredConfigs, getFilteredItems]);

  // Organiza os cards em 2 colunas balanceadas
  const balancedColumns = useMemo(() => {
    const leftColumn: typeof cardsWithHeight = [];
    const rightColumn: typeof cardsWithHeight = [];
    let leftHeight = 0;
    let rightHeight = 0;

    cardsWithHeight.forEach((card) => {
      if (leftHeight <= rightHeight) {
        leftColumn.push(card);
        leftHeight += card.estimatedHeight;
      } else {
        rightColumn.push(card);
        rightHeight += card.estimatedHeight;
      }
    });

    return { leftColumn, rightColumn };
  }, [cardsWithHeight]);

  return (
    <>
      <div className="block lg:hidden">
        {/* Layout mobile: 1 coluna */}
        <div className="space-y-6">
          {filteredConfigs.map((config) => (
            <div key={config.id} className="transition-all duration-300">
              {renderSection(config)}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        {/* Layout desktop: 2 colunas balanceadas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            {balancedColumns.leftColumn.map(({ config }) => (
              <div key={config.id} className="transition-all duration-300">
                {renderSection(config)}
              </div>
            ))}
          </div>

          {/* Coluna direita */}
          <div className="space-y-6">
            {balancedColumns.rightColumn.map(({ config }) => (
              <div key={config.id} className="transition-all duration-300">
                {renderSection(config)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
