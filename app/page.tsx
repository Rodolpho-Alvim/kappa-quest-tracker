"use client";

import type React from "react";

import { NavigationSidebar } from "@/components/navigation-sidebar";
import { SectionCard } from "@/components/section-card";
import { StatsDashboard } from "@/components/stats-dashboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FIXED_ITEMS } from "@/data/fixed-items";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSectionOrder } from "@/hooks/use-section-order";
import type {
  CustomItems,
  DeletedItems,
  UserProgress,
} from "@/types/quest-data";
import {
  Download,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function KappaQuestTracker() {
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>(
    "kappa-quest-progress-v4",
    {}
  );
  const [customItems, setCustomItems] = useLocalStorage<CustomItems>(
    "kappa-custom-items-v6",
    {
      mainItems: [],
      samples: [],
      recompensasQuests: [],
      trocaItens: [],
      streamerItems: [],
      craftsItems: [],
      hideoutImportante: [],
      barterGunsmith: [],
      barterChaves: [],
      dorm206: [],
      portableBunkhouse: [],
      dorm303: [],
    }
  );
  const [deletedItems, setDeletedItems] = useLocalStorage<DeletedItems>(
    "kappa-deleted-items-v1",
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionOrderHook = useSectionOrder();
  const { getSectionOrder, setFullSectionOrder, resetOrder } = sectionOrderHook;

  // Auto-save
  useEffect(() => {
    if (
      Object.keys(userProgress).length > 0 ||
      Object.keys(customItems).some(
        (key) => customItems[key as keyof CustomItems].length > 0
      )
    ) {
      setLastSaved(new Date());
    }
  }, [userProgress, customItems, deletedItems]);

  // Intersection Observer para detectar seção ativa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    const sections = sectionConfigs.map((config) => config.id);
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Combinar itens fixos com customizados, excluindo deletados
  const getAllItems = () => {
    const filterDeleted = (items: any[]) =>
      items.filter((item) => !deletedItems[item.id]);

    return {
      mainItems: filterDeleted([
        ...FIXED_ITEMS.mainItems,
        ...customItems.mainItems,
      ]),
      samples: filterDeleted([...FIXED_ITEMS.samples, ...customItems.samples]),
      recompensasQuests: filterDeleted([
        ...FIXED_ITEMS.recompensasQuests,
        ...customItems.recompensasQuests,
      ]),
      trocaItens: filterDeleted([
        ...FIXED_ITEMS.trocaItens,
        ...customItems.trocaItens,
      ]),
      streamerItems: filterDeleted([
        ...FIXED_ITEMS.streamerItems,
        ...customItems.streamerItems,
      ]),
      craftsItems: filterDeleted([
        ...FIXED_ITEMS.craftsItems,
        ...customItems.craftsItems,
      ]),
      hideoutImportante: filterDeleted([
        ...FIXED_ITEMS.hideoutImportante,
        ...customItems.hideoutImportante,
      ]),
      barterGunsmith: filterDeleted([
        ...FIXED_ITEMS.barterGunsmith,
        ...customItems.barterGunsmith,
      ]),
      barterChaves: filterDeleted([
        ...FIXED_ITEMS.barterChaves,
        ...customItems.barterChaves,
      ]),
      dorm206: filterDeleted([...FIXED_ITEMS.dorm206, ...customItems.dorm206]),
      portableBunkhouse: filterDeleted([
        ...FIXED_ITEMS.portableBunkhouse,
        ...customItems.portableBunkhouse,
      ]),
      dorm303: filterDeleted([...FIXED_ITEMS.dorm303, ...customItems.dorm303]),
    };
  };

  const allItems = getAllItems();

  // Filtrar por busca
  const getFilteredItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Configuração das seções
  const sectionConfigs = [
    {
      id: "main-items",
      title: "Itens Principais",
      sectionType: "main" as const,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: "🎯",
      items: allItems.mainItems,
      addItemKey: "mainItems" as keyof CustomItems,
    },
    {
      id: "samples",
      title: "Samples",
      sectionType: "samples" as const,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      icon: "💉",
      items: allItems.samples,
      addItemKey: "samples" as keyof CustomItems,
    },
    {
      id: "recompensas-quests",
      title: "Recompensas de Quests",
      sectionType: "recompensas-quests" as const,
      color: "bg-gradient-to-r from-amber-500 to-amber-600",
      icon: "🏆",
      items: allItems.recompensasQuests,
      addItemKey: "recompensasQuests" as keyof CustomItems,
    },
    {
      id: "troca-itens",
      title: "Troca Itens",
      sectionType: "troca-itens" as const,
      color: "bg-gradient-to-r from-cyan-500 to-cyan-600",
      icon: "🔄",
      items: allItems.trocaItens,
      addItemKey: "trocaItens" as keyof CustomItems,
    },
    {
      id: "streamer-items",
      title: "Streamer Items",
      sectionType: "streamer" as const,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: "⭐",
      items: allItems.streamerItems,
      addItemKey: "streamerItems" as keyof CustomItems,
    },
    {
      id: "crafts-items",
      title: "Crafts Prováveis",
      sectionType: "craft" as const,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      icon: "🔧",
      items: allItems.craftsItems,
      addItemKey: "craftsItems" as keyof CustomItems,
    },
    {
      id: "hideout-importante",
      title: "Hideout Importante",
      subtitle: "LAVATÓRIO 2 (PENTE 6)",
      sectionType: "hideout" as const,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      icon: "🏠",
      items: allItems.hideoutImportante,
      addItemKey: "hideoutImportante" as keyof CustomItems,
    },
    {
      id: "barter-gunsmith",
      title: "Barter Gunsmith",
      sectionType: "barter-gunsmith" as const,
      color: "bg-gradient-to-r from-gray-500 to-gray-600",
      icon: "🔫",
      items: allItems.barterGunsmith,
      addItemKey: "barterGunsmith" as keyof CustomItems,
    },
    {
      id: "barter-chaves",
      title: "Barter Chaves",
      sectionType: "barter-chaves" as const,
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      icon: "🗝️",
      items: allItems.barterChaves,
      addItemKey: "barterChaves" as keyof CustomItems,
    },
    {
      id: "dorm206",
      title: "DORM 206",
      sectionType: "dorm206" as const,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      icon: "🏢",
      items: allItems.dorm206,
      addItemKey: "dorm206" as keyof CustomItems,
    },
    {
      id: "portable-bunkhouse",
      title: "Portable Bunkhouse",
      sectionType: "portable-bunkhouse" as const,
      color: "bg-gradient-to-r from-teal-500 to-teal-600",
      icon: "🏕️",
      items: allItems.portableBunkhouse,
      addItemKey: "portableBunkhouse" as keyof CustomItems,
    },
    {
      id: "dorm303",
      title: "DORM 303",
      sectionType: "dorm303" as const,
      color: "bg-gradient-to-r from-pink-500 to-pink-600",
      icon: "🏢",
      items: allItems.dorm303,
      addItemKey: "dorm303" as keyof CustomItems,
    },
  ];

  // Ordenar as seções conforme a ordem salva
  const sortedSectionConfigs = [...sectionConfigs].sort((a, b) => {
    return getSectionOrder(a.id) - getSectionOrder(b.id);
  });

  const renderSection = (config: (typeof sectionConfigs)[0]) => (
    <div key={config.id} id={config.id}>
      <SectionCard
        title={config.title}
        subtitle={config.subtitle}
        items={getFilteredItems(config.items)}
        sectionType={config.sectionType}
        userProgress={userProgress}
        onProgressUpdate={updateProgress}
        onItemUpdate={updateCustomItem}
        onDeleteItem={deleteItem}
        onAddItem={() => addNewItem(config.addItemKey)}
        color={config.color}
        icon={config.icon}
      />
    </div>
  );

  const updateProgress = (itemId: string, field: string, value: any) => {
    setUserProgress((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        lastUpdated: Date.now(),
      },
    }));
  };

  const updateCustomItem = (itemId: string, field: string, value: any) => {
    const updateSection = (section: keyof CustomItems) => {
      setCustomItems((prev) => ({
        ...prev,
        [section]: prev[section].map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      }));
    };

    // Encontrar em qual seção está o item
    Object.keys(customItems).forEach((section) => {
      if (
        customItems[section as keyof CustomItems].some(
          (item) => item.id === itemId
        )
      ) {
        updateSection(section as keyof CustomItems);
      }
    });
  };

  const addNewItem = (section: keyof CustomItems) => {
    const newId = `custom-${section}-${Date.now()}`;
    let newItem: any = {
      id: newId,
      item: "Novo Item",
      isCustom: true,
      qtdE: "",
      qtdR: "",
    };

    if (
      section === "mainItems" ||
      section === "samples" ||
      section === "recompensasQuests" ||
      section === "streamerItems"
    ) {
      newItem = { ...newItem, fir: "" };
    }

    setCustomItems((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const deleteItem = (itemId: string) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      setDeletedItems((prev) => ({ ...prev, [itemId]: true }));

      // Remover do progresso
      setUserProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[itemId];
        return newProgress;
      });
    }
  };

  const restoreDefaults = () => {
    if (
      confirm(
        "Tem certeza que deseja restaurar todos os itens padrão? Isso não afetará seu progresso."
      )
    ) {
      setDeletedItems({});
      alert("Itens padrão restaurados!");
    }
  };

  const handleExport = () => {
    const exportData = {
      progress: userProgress,
      customItems: customItems,
      deletedItems: deletedItems,
      exportDate: new Date().toISOString(),
      version: "v9",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kappa-progress-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.progress) setUserProgress(data.progress);
        if (data.customItems) setCustomItems(data.customItems);
        if (data.deletedItems) setDeletedItems(data.deletedItems);
        alert("Dados importados com sucesso!");
      } catch (error) {
        alert("Erro ao importar dados");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        "Tem certeza que deseja resetar TUDO? Esta ação não pode ser desfeita."
      )
    ) {
      setUserProgress({});
      setCustomItems({
        mainItems: [],
        samples: [],
        recompensasQuests: [],
        trocaItens: [],
        streamerItems: [],
        craftsItems: [],
        hideoutImportante: [],
        barterGunsmith: [],
        barterChaves: [],
        dorm206: [],
        portableBunkhouse: [],
        dorm303: [],
      });
      setDeletedItems({});
      alert("Tudo foi resetado!");
    }
  };

  // Calcular estatísticas
  const totalItems = Object.values(allItems).flat().length;
  const completedItems = Object.values(allItems)
    .flat()
    .filter((item) => userProgress[item.id]?.completed).length;

  // Dados para a sidebar de navegação
  const navigationSections = sortedSectionConfigs.map((config) => ({
    id: config.id,
    title: config.title,
    icon: config.icon,
    color: config.color,
    completedCount: config.items.filter(
      (item) => userProgress[item.id]?.completed
    ).length,
    totalCount: config.items.length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        sections={sortedSectionConfigs.map((config) => ({
          id: config.id,
          title: config.title,
          icon: config.icon,
          color: config.color,
          completedCount: config.items.filter(
            (item) => userProgress[item.id]?.completed
          ).length,
          totalCount: config.items.length,
        }))}
        activeSection={activeSection}
        onSectionClick={setActiveSection}
        getSectionOrder={getSectionOrder}
        setFullSectionOrder={setFullSectionOrder}
        resetOrder={resetOrder}
      />

      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/kappa-container.jpg"
                alt="Kappa Container"
                width={100}
                height={100}
                className="rounded-lg shadow-md border border-yellow-400 bg-white"
                priority
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Kappa Quest Tracker
                </h1>
                <p className="text-gray-600">
                  Escape from Tarkov - Container Kappa Progress
                </p>
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
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Progresso
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                    <Button
                      onClick={restoreDefaults}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restaurar Itens Padrão
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="destructive"
                      className="w-full"
                    >
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

      <div className="max-w-[1400px] mx-auto px-6 py-8 pr-80">
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
              <h3 className="font-medium text-blue-600">
                📊 Qtd. E (Quantidade Encontrada)
              </h3>
              <p className="text-gray-600">
                Quantos itens você já possui no seu stash ou encontrou. Atualize
                conforme coleta os itens.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-green-600">
                🎯 Qtd. R (Quantidade Requerida)
              </h3>
              <p className="text-gray-600">
                Quantos itens você precisa para completar a quest ou objetivo.
                Alguns podem ter requisitos específicos.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-purple-600">
                🔍 FIR (Found in Raid)
              </h3>
              <p className="text-gray-600">
                Se o item precisa ter status "Found in Raid" (encontrado na
                raid) para ser válido na quest.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Marque o checkbox quando tiver coletado
              todos os itens necessários para aquela entrada. Use a busca para
              encontrar itens específicos rapidamente.
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
        <div className="grid grid-cols-1 gap-8">
          {sortedSectionConfigs
            .filter((config) => getFilteredItems(config.items).length > 0)
            .map(renderSection)}
        </div>
      </div>
    </div>
  );
}
