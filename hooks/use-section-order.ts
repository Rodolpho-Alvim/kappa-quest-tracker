"use client";

import { useLocalStorage } from "./use-local-storage";

export interface SectionOrder {
  id: string;
  order: number;
}

export function useSectionOrder() {
  const [sectionOrder, setSectionOrder] = useLocalStorage<SectionOrder[]>(
    "kappa-section-order-v1",
    []
  );

  const getSectionOrder = (sectionId: string): number => {
    const order = sectionOrder.find((s) => s.id === sectionId);
    return order ? order.order : 999;
  };

  const setSectionOrderById = (sectionId: string, newOrder: number) => {
    setSectionOrder((prev) => {
      const existing = prev.find((s) => s.id === sectionId);
      if (existing) {
        return prev.map((s) =>
          s.id === sectionId ? { ...s, order: newOrder } : s
        );
      } else {
        return [...prev, { id: sectionId, order: newOrder }];
      }
    });
  };

  // NOVA FUNÇÃO: sobrescreve a ordem de todas as seções
  const setFullSectionOrder = (ids: string[]) => {
    setSectionOrder(ids.map((id, idx) => ({ id, order: idx })));
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const currentOrder = getSectionOrder(sectionId);
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    const targetSection = sectionOrder.find((s) => s.order === newOrder);
    if (targetSection) {
      setSectionOrderById(sectionId, newOrder);
      setSectionOrderById(targetSection.id, currentOrder);
    } else {
      setSectionOrderById(sectionId, newOrder);
    }
  };

  const resetOrder = () => {
    setSectionOrder([]);
  };

  return {
    sectionOrder,
    getSectionOrder,
    setSectionOrderById,
    setFullSectionOrder, // <-- exporta a nova função
    moveSection,
    resetOrder,
  };
}
