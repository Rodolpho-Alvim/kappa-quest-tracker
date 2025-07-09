"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react"
import { ItemRow } from "./item-row"
import type { QuestItem, StreamerItem, CraftItem, HideoutItem, UserProgress } from "@/types/quest-data"

interface SectionCardProps {
  title: string
  items: (QuestItem | StreamerItem | CraftItem | HideoutItem)[]
  sectionType: "main" | "secondary" | "streamer" | "craft" | "hideout"
  userProgress: UserProgress
  onProgressUpdate: (itemId: string, field: string, value: any) => void
  onItemUpdate: (itemId: string, field: string, value: any) => void
  onDeleteItem: (itemId: string) => void
  onAddItem: () => void
  color: string
  icon: string
}

export function SectionCard({
  title,
  items,
  sectionType,
  userProgress,
  onProgressUpdate,
  onItemUpdate,
  onDeleteItem,
  onAddItem,
  color,
  icon,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showCompleted, setShowCompleted] = useState(true)

  const completedCount = items.filter((item) => userProgress[item.id]?.completed).length
  const totalCount = items.length

  const filteredItems = showCompleted ? items : items.filter((item) => !userProgress[item.id]?.completed)

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className={`${color} text-white p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {completedCount}/{totalCount}
                </Badge>
                <div className="w-24 bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
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
              title={showCompleted ? "Ocultar itens completos" : "Mostrar itens completos"}
            >
              {showCompleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhum item encontrado</p>
                <Button onClick={onAddItem} variant="outline" className="mt-2 bg-transparent">
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
  )
}
