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
    <Card className="shadow-2xl border-0 overflow-hidden mb-4 transition-all duration-300 hover:shadow-3xl h-full">
      <CardHeader
        className={`${color} text-white p-4 relative overflow-hidden h-auto min-h-[120px] flex flex-col justify-between`}
      >
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full animate-pulse"></div>

        {/* Título e ícone no topo */}
        <div className="flex items-start gap-3 relative z-10 mb-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 shadow-lg backdrop-blur-sm">
              <span className="text-2xl drop-shadow-lg">{icon}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-xl font-bold text-gray-100 drop-shadow-lg leading-tight">
                {title}
              </CardTitle>
              {subtitle && (
                <span className="text-xs font-medium opacity-90 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm border border-white/30 shadow-lg self-start">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controles e progresso na parte inferior */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 px-3 py-1.5 text-xs font-bold backdrop-blur-sm shadow-lg"
            >
              {completedCount}/{totalCount} itens
            </Badge>

            <div className="flex-1 max-w-40">
              <div className="w-full bg-white/20 rounded-full h-2.5 shadow-inner overflow-hidden">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-700 shadow-lg"
                  style={{
                    width: `${
                      totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <span className="text-xs font-bold text-white/90 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
              {totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0}
              %
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-white hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
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
              className="text-white hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              title="Adicionar novo item personalizado"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
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
              <div className="p-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/30">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-4">
                  Nenhum item encontrado
                </p>
                <Button
                  onClick={onAddItem}
                  variant="outline"
                  className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeiro item
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map((item, index) => (
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
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const SectionCard = React.memo(SectionCardComponent);
