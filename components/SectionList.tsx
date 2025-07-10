import React from "react";

interface SectionListProps {
  sortedSectionConfigs: any[];
  getFilteredItems: (items: any[]) => any[];
  renderSection: (config: any) => React.ReactNode;
}

export const SectionList: React.FC<SectionListProps> = ({
  sortedSectionConfigs,
  getFilteredItems,
  renderSection,
}) => (
  <div className="grid grid-cols-1 gap-8">
    {sortedSectionConfigs
      .filter((config) => getFilteredItems(config.items).length > 0)
      .map(renderSection)}
  </div>
);
