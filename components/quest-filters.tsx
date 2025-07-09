"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Upload, RotateCcw } from "lucide-react"

interface QuestFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: "all" | "completed" | "pending"
  onFilterStatusChange: (value: "all" | "completed" | "pending") => void
  filterFIR: "all" | "yes" | "no"
  onFilterFIRChange: (value: "all" | "yes" | "no") => void
  totalItems: number
  completedItems: number
  onExport: () => void
  onImport: (file: File) => void
  onReset: () => void
}

export function QuestFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterFIR,
  onFilterFIRChange,
  totalItems,
  completedItems,
  onExport,
  onImport,
  onReset,
}: QuestFiltersProps) {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImport(file)
    }
  }

  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="bg-white p-4 border-b space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kappa Quest Tracker</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {completedItems}/{totalItems} ({progressPercentage}%)
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Importar
                </span>
              </Button>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Completos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterFIR} onValueChange={onFilterFIRChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="FIR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos FIR</SelectItem>
            <SelectItem value="yes">Sim</SelectItem>
            <SelectItem value="no">Não</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
