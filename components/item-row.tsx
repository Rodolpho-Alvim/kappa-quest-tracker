"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit3, Check, X } from "lucide-react"
import type { QuestItem, StreamerItem, CraftItem, HideoutItem, UserProgress } from "@/types/quest-data"

interface ItemRowProps {
  item: QuestItem | StreamerItem | CraftItem | HideoutItem
  sectionType: "main" | "secondary" | "streamer" | "craft" | "hideout"
  userProgress?: UserProgress[string]
  onProgressUpdate: (itemId: string, field: string, value: any) => void
  onItemUpdate: (itemId: string, field: string, value: any) => void
  onDeleteItem: (itemId: string) => void
  isEven: boolean
}

export function ItemRow({
  item,
  sectionType,
  userProgress,
  onProgressUpdate,
  onItemUpdate,
  onDeleteItem,
  isEven,
}: ItemRowProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(item.item)

  const isCompleted = userProgress?.completed || false
  const bgColor = isEven ? "bg-gray-50" : "bg-white"
  const completedBg = isCompleted ? "bg-green-50 border-l-4 border-l-green-500" : ""

  const handleNameSave = () => {
    onItemUpdate(item.id, "item", editName)
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setEditName(item.item)
    setIsEditingName(false)
  }

  const getValue = (field: string, defaultValue: any = "") => {
    return userProgress?.[field as keyof UserProgress[string]] ?? (item as any)[field] ?? defaultValue
  }

  const getFirValue = () => {
    const value = getValue("fir", "")
    return value === "" || value === "N/A" ? "-" : value
  }

  return (
    <div className={`${bgColor} ${completedBg} p-4 border-b hover:bg-gray-100 transition-colors group`}>
      <div className="flex items-center gap-4">
        {/* Checkbox de conclusão */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) => onProgressUpdate(item.id, "completed", checked)}
          className="flex-shrink-0"
        />

        {/* Nome do item */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave()
                  if (e.key === "Escape") handleNameCancel()
                }}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleNameSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleNameCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isCompleted ? "line-through text-gray-500" : ""}`}>{item.item}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Campos editáveis baseados no tipo de seção */}
        <div className="flex items-center gap-3">
          {/* Qtd. E - Quantidade Encontrada */}
          {(sectionType === "main" ||
            sectionType === "secondary" ||
            sectionType === "streamer" ||
            sectionType === "craft") && (
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1" title="Quantidade Encontrada">
                Qtd. E
              </label>
              <Input
                type="number"
                value={getValue("qtdE")}
                onChange={(e) => onProgressUpdate(item.id, "qtdE", e.target.value)}
                className="w-16 h-8 text-center text-xs"
                placeholder="0"
                title="Quantidade que você já encontrou/possui"
              />
            </div>
          )}

          {/* E (para hideout) - Quantidade Encontrada */}
          {sectionType === "hideout" && (
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1" title="Quantidade Encontrada">
                Qtd. E
              </label>
              <Input
                type="number"
                value={getValue("e")}
                onChange={(e) => onProgressUpdate(item.id, "e", e.target.value)}
                className="w-16 h-8 text-center text-xs"
                placeholder="0"
                title="Quantidade que você já encontrou/possui"
              />
            </div>
          )}

          {/* Qtd. R - Quantidade Requerida */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1" title="Quantidade Requerida">
              Qtd. R
            </label>
            <Input
              value={getValue("qtdR")}
              onChange={(e) => onProgressUpdate(item.id, "qtdR", e.target.value)}
              className="w-20 h-8 text-center text-xs"
              placeholder="-"
              title="Quantidade necessária para completar a quest"
            />
          </div>

          {/* FIR - Found in Raid (apenas para seções que têm) */}
          {(sectionType === "main" || sectionType === "secondary" || sectionType === "streamer") && (
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1" title="Found in Raid (Encontrados na Raid)">
                FIR
              </label>
              <Select
                value={getFirValue()}
                onValueChange={(value) => onProgressUpdate(item.id, "fir", value === "-" ? "" : value)}
              >
                <SelectTrigger className="w-16 h-8 text-xs" title="Precisa ser encontrado na raid?">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">-</SelectItem>
                  <SelectItem value="Yes">Sim</SelectItem>
                  <SelectItem value="No">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botão deletar */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteItem(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            title="Deletar item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
