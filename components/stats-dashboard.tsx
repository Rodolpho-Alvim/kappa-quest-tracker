"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { UserProgress } from "@/types/quest-data";
import { CheckCircle, Clock, Target, Trophy } from "lucide-react";

interface StatsDashboardProps {
  totalItems: number;
  completedItems: number;
  userProgress: UserProgress;
  lastSaved?: Date;
}

export function StatsDashboard({
  totalItems,
  completedItems,
  userProgress,
  lastSaved,
}: StatsDashboardProps) {
  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const remainingItems = totalItems - completedItems;

  const getProgressColor = () => {
    if (progressPercentage === 100) return "from-emerald-500 to-green-600";
    if (progressPercentage >= 90) return "from-yellow-500 to-orange-600";
    if (progressPercentage >= 70) return "from-amber-500 to-yellow-600";
    if (progressPercentage >= 50) return "from-yellow-500 to-amber-600";
    if (progressPercentage >= 25) return "from-amber-500 to-orange-600";
    return "from-yellow-500 to-amber-600";
  };

  return (
    <div className="space-y-4">
      {/* Card principal de progresso - mais compacto */}
      <Card className="bg-gradient-to-r from-yellow-50/60 via-amber-50/40 to-yellow-50/60 dark:from-yellow-950/30 dark:via-amber-950/20 dark:to-yellow-950/30 border border-yellow-200/20 dark:border-yellow-800/30 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 shadow-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg font-tarkov">
                  Progresso Kappa
                </h3>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                  {completedItems}/{totalItems} • {progressPercentage}%
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200/50 dark:bg-zinc-800/50 rounded-full shadow-inner overflow-hidden">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 shadow-sm`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de estatísticas - mais compacto */}
      <div className="grid grid-cols-3 gap-3">
        {/* Itens Completos */}
        <Card className="bg-gradient-to-br from-green-50/60 to-emerald-50/40 dark:from-green-950/20 dark:to-emerald-950/15 border border-green-200/20 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Completos
              </span>
            </div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300">
              {completedItems}
            </div>
          </CardContent>
        </Card>

        {/* Itens Restantes */}
        <Card className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-orange-950/20 dark:to-amber-950/15 border border-orange-200/20 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Target className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                Restantes
              </span>
            </div>
            <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
              {remainingItems}
            </div>
          </CardContent>
        </Card>

        {/* Último Save */}
        <Card className="bg-gradient-to-br from-purple-50/60 to-pink-50/40 dark:from-purple-950/20 dark:to-pink-950/15 border border-purple-200/20 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Save
              </span>
            </div>
            <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {lastSaved
                ? lastSaved.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Nunca"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
