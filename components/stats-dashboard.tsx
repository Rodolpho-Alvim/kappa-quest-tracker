"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, CheckCircle, Clock } from "lucide-react"
import type { UserProgress } from "@/types/quest-data"

interface StatsDashboardProps {
  totalItems: number
  completedItems: number
  userProgress: UserProgress
  lastSaved?: Date
}

export function StatsDashboard({ totalItems, completedItems, userProgress, lastSaved }: StatsDashboardProps) {
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const remainingItems = totalItems - completedItems

  const getProgressMessage = () => {
    if (progressPercentage === 100) return "🎉 Parabéns! Kappa Container desbloqueado!"
    if (progressPercentage >= 90) return "🔥 Quase lá! Falta pouco para o Kappa!"
    if (progressPercentage >= 70) return "💪 Excelente progresso! Continue coletando!"
    if (progressPercentage >= 50) return "📈 Você está no meio do caminho para o Kappa!"
    if (progressPercentage >= 25) return "🚀 Bom começo! Continue encontrando itens FIR!"
    return "🎯 Comece sua jornada para o Kappa Container!"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Progresso Geral */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Progresso Kappa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{progressPercentage}%</div>
          <Progress value={progressPercentage} className="h-2 bg-white/20" />
          <p className="text-xs mt-2 opacity-90">{getProgressMessage()}</p>
        </CardContent>
      </Card>

      {/* Itens Completos */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedItems}</div>
          <p className="text-xs opacity-90">itens coletados</p>
        </CardContent>
      </Card>

      {/* Itens Restantes */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Restantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{remainingItems}</div>
          <p className="text-xs opacity-90">itens para coletar</p>
        </CardContent>
      </Card>

      {/* Último Save */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Último Save
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">{lastSaved ? lastSaved.toLocaleTimeString() : "Nunca"}</div>
          <p className="text-xs opacity-90">salvo automaticamente</p>
        </CardContent>
      </Card>
    </div>
  )
}
