"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSectionOrder } from "@/hooks/use-section-order";
import type {
  CraftItem,
  HideoutItem,
  QuestItem,
  StreamerItem,
  UserProgress,
} from "@/types/quest-data";
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus } from "lucide-react";
import React, { useState } from "react";
import { ItemRow } from "./item-row";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  items: (QuestItem | StreamerItem | CraftItem | HideoutItem)[];
  sectionType:
    | "main"
    | "samples"
    | "recompensas-quests"
    | "troca-itens"
    | "streamer"
    | "craft"
    | "hideout"
    | "barter-gunsmith"
    | "barter-chaves"
    | "dorm206"
    | "portable-bunkhouse"
    | "dorm303"
    | "chavesQuests";
  userProgress: UserProgress;
  onProgressUpdate: (itemId: string, field: string, value: any) => void;
  onItemUpdate: (itemId: string, field: string, value: any) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: () => void;
  color: string;
  icon: string;
}

const SectionCardComponent = ({
  title,
  subtitle,
  items,
  sectionType,
  userProgress,
  onProgressUpdate,
  onItemUpdate,
  onDeleteItem,
  onAddItem,
  color,
  icon,
}: SectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const { getSectionOrder } = useSectionOrder();

  // Lógica de completude igual ao restante do app
  function isItemCompleted(item: any): boolean {
    if (item.isReference) return false;
    const progress = userProgress[item.id] || {};
    const qtdE = Number(progress.qtdE ?? item.qtdE ?? 0);
    const qtdR = Number(progress.qtdR ?? item.qtdR ?? 0);
    const firRequired = item.fir === "Yes" || progress.fir === "Yes";
    const firOk = !firRequired || progress.fir === "Yes" || item.fir === "Yes";
    return qtdE >= qtdR && firOk && qtdR > 0;
  }

  const completedCount = items.filter(isItemCompleted).length;
  const totalCount = items.filter((item) => !(item as any).isReference).length;

  const filteredItems = showCompleted
    ? items
    : items.filter((item) => !isItemCompleted(item));

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className={`${color} text-white p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
                {subtitle && (
                  <span className="text-sm font-medium opacity-90 bg-white/20 px-2 py-1 rounded">
                    {subtitle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-0"
                >
                  {completedCount}/{totalCount}
                </Badge>
                <div className="w-24 bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-white hover:bg-white/20"
              title={
                showCompleted
                  ? "Ocultar itens completos"
                  : "Mostrar itens completos"
              }
            >
              {showCompleted ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddItem}
              className="text-white hover:bg-white/20"
              title="Adicionar novo item personalizado"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20"
              title={isExpanded ? "Recolher seção" : "Expandir seção"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div>
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhum item encontrado</p>
                <Button
                  onClick={onAddItem}
                  variant="outline"
                  className="mt-2 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeiro item
                </Button>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  sectionType={sectionType}
                  userProgress={userProgress[item.id]}
                  onProgressUpdate={onProgressUpdate}
                  onItemUpdate={onItemUpdate}
                  onDeleteItem={onDeleteItem}
                  isEven={index % 2 === 0}
                />
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const SectionCard = React.memo(SectionCardComponent);
