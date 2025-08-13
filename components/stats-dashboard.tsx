"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { UserProgress } from "@/types/quest-data";
import { Trophy } from "lucide-react";

interface StatsDashboardProps {
  totalItems: number;
  completedItems: number;
  userProgress: UserProgress;
  lastSaved?: Date;
}

export function StatsDashboard({
  totalItems,
  completedItems,
  lastSaved,
}: StatsDashboardProps) {
  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const getProgressMessage = () => {
    if (progressPercentage === 100) return "🎉 Kappa Container desbloqueado!";
    if (progressPercentage >= 90) return "🔥 Quase lá!";
    if (progressPercentage >= 70) return "💪 Excelente progresso!";
    if (progressPercentage >= 50) return "📈 Meio do caminho!";
    if (progressPercentage >= 25) return "🚀 Bom começo!";
    return "🎯 Comece sua jornada!";
  };

  return (
    <Card className="bg-gradient-to-r from-[#bfa94a]/5 to-[#a68c2c]/5 border border-[#bfa94a]/20 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Ícone do troféu */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#bfa94a] to-[#a68c2c] flex items-center justify-center shadow-sm">
            <Trophy className="w-6 h-6 text-[#181a1b]" />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                Progresso Geral
              </h3>
              <span className="font-bold text-[#bfa94a] text-sm bg-[#bfa94a]/10 px-3 py-1 rounded-full">
                {completedItems}/{totalItems} • {progressPercentage}%
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="w-full h-2 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden mb-2">
              <div
                className="h-2 bg-gradient-to-r from-[#bfa94a] to-[#a68c2c] transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Mensagem de progresso */}
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {getProgressMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
