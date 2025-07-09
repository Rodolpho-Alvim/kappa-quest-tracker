"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { FIXED_ITEMS } from "@/data/fixed-items"
import { SectionCard } from "@/components/section-card"
import { StatsDashboard } from "@/components/stats-dashboard"
import { NavigationSidebar } from "@/components/navigation-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Upload, RotateCcw, Search, Settings, RefreshCw, Package } from "lucide-react"
import type { UserProgress, CustomItems, DeletedItems } from "@/types/quest-data"

export default function KappaQuestTracker() {
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>("kappa-quest-progress-v4", {})
  const [customItems, setCustomItems] = useLocalStorage<CustomItems>("kappa-custom-items-v2", {
    mainItems: [],
    secondaryItems: [],
    streamerItems: [],
    craftsItems: [],
    hideoutItems: [],
  })
  const [deletedItems, setDeletedItems] = useLocalStorage<DeletedItems>("kappa-deleted-items-v1", {})
  const [searchTerm, setSearchTerm] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Auto-save
  useEffect(() => {
    if (
      Object.keys(userProgress).length > 0 ||
      Object.keys(customItems).some((key) => customItems[key as keyof CustomItems].length > 0)
    ) {
      setLastSaved(new Date())
    }
  }, [userProgress, customItems, deletedItems])

  // Intersection Observer para detectar seção ativa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: "-20% 0px -20% 0px",
      },
    )

    const sections = ["main-items", "secondary-items", "streamer-items", "crafts-items", "hideout-items"]
    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // Combinar itens fixos com customizados, excluindo deletados
  const getAllItems = () => {
    const filterDeleted = (items: any[]) => items.filter((item) => !deletedItems[item.id])

    return {
      mainItems: filterDeleted([...FIXED_ITEMS.mainItems, ...customItems.mainItems]),
      secondaryItems: filterDeleted([...FIXED_ITEMS.secondaryItems, ...customItems.secondaryItems]),
      streamerItems: filterDeleted([...FIXED_ITEMS.streamerItems, ...customItems.streamerItems]),
      craftsItems: filterDeleted([...FIXED_ITEMS.craftsItems, ...customItems.craftsItems]),
      hideoutItems: filterDeleted([...FIXED_ITEMS.hideoutItems, ...customItems.hideoutItems]),
    }
  }

  const allItems = getAllItems()

  // Filtrar por busca
  const getFilteredItems = (items: any[]) => {
    if (!searchTerm) return items
    return items.filter((item) => item.item.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const updateProgress = (itemId: string, field: string, value: any) => {
    setUserProgress((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        lastUpdated: Date.now(),
      },
    }))
  }

  const updateCustomItem = (itemId: string, field: string, value: any) => {
    const updateSection = (section: keyof CustomItems) => {
      setCustomItems((prev) => ({
        ...prev,
        [section]: prev[section].map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
      }))
    }

    // Encontrar em qual seção está o item
    Object.keys(customItems).forEach((section) => {
      if (customItems[section as keyof CustomItems].some((item) => item.id === itemId)) {
        updateSection(section as keyof CustomItems)
      }
    })
  }

  const addNewItem = (section: keyof CustomItems) => {
    const newId = `custom-${section}-${Date.now()}`
    let newItem: any = {
      id: newId,
      item: "Novo Item",
      isCustom: true,
    }

    if (section === "mainItems" || section === "secondaryItems" || section === "streamerItems") {
      newItem = { ...newItem, qtdE: "", qtdR: "", fir: "" }
    } else if (section === "craftsItems") {
      newItem = { ...newItem, qtdE: "", qtdR: "" }
    } else if (section === "hideoutItems") {
      newItem = { ...newItem, e: "", qtdR: "" }
    }

    setCustomItems((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }))
  }

  const deleteItem = (itemId: string) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      setDeletedItems((prev) => ({ ...prev, [itemId]: true }))

      // Remover do progresso
      setUserProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[itemId]
        return newProgress
      })
    }
  }

  const restoreDefaults = () => {
    if (confirm("Tem certeza que deseja restaurar todos os itens padrão? Isso não afetará seu progresso.")) {
      setDeletedItems({})
      alert("Itens padrão restaurados!")
    }
  }

  const handleExport = () => {
    const exportData = {
      progress: userProgress,
      customItems: customItems,
      deletedItems: deletedItems,
      exportDate: new Date().toISOString(),
      version: "v5",
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kappa-progress-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.progress) setUserProgress(data.progress)
        if (data.customItems) setCustomItems(data.customItems)
        if (data.deletedItems) setDeletedItems(data.deletedItems)
        alert("Dados importados com sucesso!")
      } catch (error) {
        alert("Erro ao importar dados")
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar TUDO? Esta ação não pode ser desfeita.")) {
      setUserProgress({})
      setCustomItems({
        mainItems: [],
        secondaryItems: [],
        streamerItems: [],
        craftsItems: [],
        hideoutItems: [],
      })
      setDeletedItems({})
      alert("Tudo foi resetado!")
    }
  }

  // Calcular estatísticas
  const totalItems = Object.values(allItems).flat().length
  const completedItems = Object.values(allItems)
    .flat()
    .filter((item) => userProgress[item.id]?.completed).length

  // Dados para a sidebar de navegação
  const navigationSections = [
    {
      id: "main-items",
      title: "Itens Principais",
      icon: "🎯",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      completedCount: allItems.mainItems.filter((item) => userProgress[item.id]?.completed).length,
      totalCount: allItems.mainItems.length,
    },
    {
      id: "secondary-items",
      title: "Itens Secundários",
      icon: "📦",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      completedCount: allItems.secondaryItems.filter((item) => userProgress[item.id]?.completed).length,
      totalCount: allItems.secondaryItems.length,
    },
    {
      id: "streamer-items",
      title: "Streamer Items",
      icon: "⭐",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      completedCount: allItems.streamerItems.filter((item) => userProgress[item.id]?.completed).length,
      totalCount: allItems.streamerItems.length,
    },
    {
      id: "crafts-items",
      title: "Crafts Prováveis",
      icon: "🔧",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      completedCount: allItems.craftsItems.filter((item) => userProgress[item.id]?.completed).length,
      totalCount: allItems.craftsItems.length,
    },
    {
      id: "hideout-items",
      title: "Hideout Importante",
      icon: "🏠",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      completedCount: allItems.hideoutItems.filter((item) => userProgress[item.id]?.completed).length,
      totalCount: allItems.hideoutItems.length,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        sections={navigationSections}
        activeSection={activeSection}
        onSectionClick={setActiveSection}
      />

      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kappa Quest Tracker</h1>
                <p className="text-gray-600">Escape from Tarkov - Container Kappa Progress</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurações</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button onClick={handleExport} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Progresso
                    </Button>
                    <label className="cursor-pointer">
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Progresso
                        </span>
                      </Button>
                      <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                    <Button onClick={restoreDefaults} variant="outline" className="w-full bg-transparent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restaurar Itens Padrão
                    </Button>
                    <Button onClick={handleReset} variant="destructive" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Completo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pr-80">
        {/* Dashboard de Estatísticas */}
        <StatsDashboard
          totalItems={totalItems}
          completedItems={completedItems}
          userProgress={userProgress}
          lastSaved={lastSaved}
        />

        {/* Seção de Ajuda */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📚 Como usar o Kappa Quest Tracker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-blue-600">📊 Qtd. E (Quantidade Encontrada)</h3>
              <p className="text-gray-600">
                Quantos itens você já possui no seu stash ou encontrou. Atualize conforme coleta os itens.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-green-600">🎯 Qtd. R (Quantidade Requerida)</h3>
              <p className="text-gray-600">
                Quantos itens você precisa para completar a quest ou objetivo. Alguns podem ter requisitos específicos.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-purple-600">🔍 FIR (Found in Raid)</h3>
              <p className="text-gray-600">
                Se o item precisa ter status "Found in Raid" (encontrado na raid) para ser válido na quest.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Marque o checkbox quando tiver coletado todos os itens necessários para aquela
              entrada. Use a busca para encontrar itens específicos rapidamente.
            </p>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Seções */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div id="main-items">
            <SectionCard
              title="Itens Principais"
              items={getFilteredItems(allItems.mainItems)}
              sectionType="main"
              userProgress={userProgress}
              onProgressUpdate={updateProgress}
              onItemUpdate={updateCustomItem}
              onDeleteItem={deleteItem}
              onAddItem={() => addNewItem("mainItems")}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              icon="🎯"
            />
          </div>

          <div id="secondary-items">
            <SectionCard
              title="Itens Secundários"
              items={getFilteredItems(allItems.secondaryItems)}
              sectionType="secondary"
              userProgress={userProgress}
              onProgressUpdate={updateProgress}
              onItemUpdate={updateCustomItem}
              onDeleteItem={deleteItem}
              onAddItem={() => addNewItem("secondaryItems")}
              color="bg-gradient-to-r from-green-500 to-green-600"
              icon="📦"
            />
          </div>

          <div id="streamer-items">
            <SectionCard
              title="Streamer Items"
              items={getFilteredItems(allItems.streamerItems)}
              sectionType="streamer"
              userProgress={userProgress}
              onProgressUpdate={updateProgress}
              onItemUpdate={updateCustomItem}
              onDeleteItem={deleteItem}
              onAddItem={() => addNewItem("streamerItems")}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              icon="⭐"
            />
          </div>

          <div id="crafts-items">
            <SectionCard
              title="Crafts Prováveis"
              items={getFilteredItems(allItems.craftsItems)}
              sectionType="craft"
              userProgress={userProgress}
              onProgressUpdate={updateProgress}
              onItemUpdate={updateCustomItem}
              onDeleteItem={deleteItem}
              onAddItem={() => addNewItem("craftsItems")}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              icon="🔧"
            />
          </div>

          <div id="hideout-items" className="lg:col-span-2">
            <SectionCard
              title="Hideout Importante"
              items={getFilteredItems(allItems.hideoutItems)}
              sectionType="hideout"
              userProgress={userProgress}
              onProgressUpdate={updateProgress}
              onItemUpdate={updateCustomItem}
              onDeleteItem={deleteItem}
              onAddItem={() => addNewItem("hideoutItems")}
              color="bg-gradient-to-r from-red-500 to-red-600"
              icon="🏠"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
