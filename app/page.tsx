"use client";

import * as React from "react";

import { AvisoBanner } from "@/components/AvisoBanner";
import { Footer } from "@/components/Footer";
import { HeaderBar } from "@/components/HeaderBar";
import { HelpSection } from "@/components/HelpSection";
import { SearchBar } from "@/components/SearchBar";
import { SectionCard } from "@/components/section-card";
import { SectionList } from "@/components/SectionList";
import { SettingsDialog } from "@/components/SettingsDialog";
import { StatsDashboard } from "@/components/stats-dashboard";
import { FIXED_ITEMS } from "@/data/fixed-items";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSectionOrder } from "@/hooks/use-section-order";
import type {
  CustomItems,
  DeletedItems,
  UserProgress,
} from "@/types/quest-data";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const NavigationSidebar = dynamic(
  () => import("@/components/navigation-sidebar"),
  { ssr: false }
);
// Adicionar import para ícone de menu
import { Sheet, SheetOverlay, SheetPortal } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// SheetContent sem botão de fechar
import { cn } from "@/lib/utils";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentNoCloseProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const SheetContentNoClose = React.forwardRef<
  HTMLDivElement,
  SheetContentNoCloseProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContentNoClose.displayName = "SheetContentNoClose";

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
      chavesQuests: [],
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
  const [showAviso, setShowAviso] = useState(true);
  const [showHelp, setShowHelp] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Função para detectar mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  // Atualizar ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      chavesQuests: filterDeleted([
        ...FIXED_ITEMS.chavesQuests,
        ...((customItems.chavesQuests ?? []) as any[]),
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
      id: "streamer-items",
      title: "Streamer Items",
      sectionType: "streamer" as const,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: "⭐",
      items: allItems.streamerItems,
      addItemKey: "streamerItems" as keyof CustomItems,
    },
    // NOVA SEÇÃO: Chaves de Quests
    {
      id: "chavesQuests",
      title: "Chaves de Quests",
      sectionType: "chavesQuests",
      color: "bg-gradient-to-r from-lime-500 to-lime-600",
      icon: "🔑",
      items: allItems.chavesQuests,
      addItemKey: "chavesQuests" as keyof CustomItems,
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
      id: "troca-itens",
      title: "Troca Itens",
      subtitle: "Elcan (Break the deal)",
      sectionType: "troca-itens" as const,
      color: "bg-gradient-to-r from-cyan-500 to-cyan-600",
      icon: "🔄",
      items: allItems.trocaItens,
      addItemKey: "trocaItens" as keyof CustomItems,
    },
    {
      id: "hideout-importante",
      title: "Hideout Importante",
      subtitle: "LAVATÓRIO 2 (PENTE)",
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
        chavesQuests: [],
      });
      setDeletedItems({});
      alert("Tudo foi resetado!");
    }
  };

  // Calcular estatísticas
  const totalItems = Object.values(allItems)
    .flat()
    .filter((item) => !(item as any).isReference).length;
  const completedItems = Object.values(allItems)
    .flat()
    .filter((item) => {
      if ((item as any).isReference) return false;
      const qtdE = Number(
        userProgress[item.id]?.qtdE ?? (item as any).qtdE ?? 0
      );
      const qtdR = Number(
        userProgress[item.id]?.qtdR ?? (item as any).qtdR ?? 0
      );
      const firRequired =
        (item as any).fir === "Yes" || userProgress[item.id]?.fir === "Yes";
      const firOk =
        !firRequired ||
        userProgress[item.id]?.fir === "Yes" ||
        (item as any).fir === "Yes";
      return qtdE >= qtdR && firOk && qtdR > 0;
    }).length;

  // Dados para a sidebar de navegação
  const navigationSections = sortedSectionConfigs.map((config) => ({
    id: config.id,
    title: config.title,
    icon: config.icon,
    color: config.color,
    completedCount: config.items.filter((item) => {
      if ((item as any).isReference) return false;
      const qtdE = Number(
        userProgress[item.id]?.qtdE ?? (item as any).qtdE ?? 0
      );
      const qtdR = Number(
        userProgress[item.id]?.qtdR ?? (item as any).qtdR ?? 0
      );
      const firRequired =
        (item as any).fir === "Yes" || userProgress[item.id]?.fir === "Yes";
      const firOk =
        !firRequired ||
        userProgress[item.id]?.fir === "Yes" ||
        (item as any).fir === "Yes";
      return qtdE >= qtdR && firOk && qtdR > 0;
    }).length,
    totalCount: config.items.filter((item) => !(item as any).isReference)
      .length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Botão flutuante para abrir sidebar no mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContentNoClose side="right" className="block md:hidden p-0 w-64">
          <NavigationSidebar
            sections={sortedSectionConfigs.map((config) => ({
              id: config.id,
              title: config.title,
              icon: config.icon,
              color: config.color,
              completedCount: config.items.filter((item) => {
                if ((item as any).isReference) return false;
                const qtdE = Number(
                  userProgress[item.id]?.qtdE ?? (item as any).qtdE ?? 0
                );
                const qtdR = Number(
                  userProgress[item.id]?.qtdR ?? (item as any).qtdR ?? 0
                );
                const firRequired =
                  (item as any).fir === "Yes" ||
                  userProgress[item.id]?.fir === "Yes";
                const firOk =
                  !firRequired ||
                  userProgress[item.id]?.fir === "Yes" ||
                  (item as any).fir === "Yes";
                return qtdE >= qtdR && firOk && qtdR > 0;
              }).length,
              totalCount: config.items.filter(
                (item) => !(item as any).isReference
              ).length,
            }))}
            activeSection={activeSection}
            onSectionClick={(id) => {
              setActiveSection(id);
              setSidebarOpen(false);
            }}
            getSectionOrder={getSectionOrder}
            setFullSectionOrder={setFullSectionOrder}
            resetOrder={resetOrder}
          />
        </SheetContentNoClose>
        <button
          className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </Sheet>

      {/* Sidebar fixa só no desktop */}
      <div className="hidden md:block md:w-80 md:h-screen md:fixed md:top-0 md:right-0 md:z-0 bg-white border-l shadow-none overflow-y-auto">
        <NavigationSidebar
          sections={sortedSectionConfigs.map((config) => ({
            id: config.id,
            title: config.title,
            icon: config.icon,
            color: config.color,
            completedCount: config.items.filter((item) => {
              if ((item as any).isReference) return false;
              const qtdE = Number(
                userProgress[item.id]?.qtdE ?? (item as any).qtdE ?? 0
              );
              const qtdR = Number(
                userProgress[item.id]?.qtdR ?? (item as any).qtdR ?? 0
              );
              const firRequired =
                (item as any).fir === "Yes" ||
                userProgress[item.id]?.fir === "Yes";
              const firOk =
                !firRequired ||
                userProgress[item.id]?.fir === "Yes" ||
                (item as any).fir === "Yes";
              return qtdE >= qtdR && firOk && qtdR > 0;
            }).length,
            totalCount: config.items.filter(
              (item) => !(item as any).isReference
            ).length,
          }))}
          activeSection={activeSection}
          onSectionClick={setActiveSection}
          getSectionOrder={getSectionOrder}
          setFullSectionOrder={setFullSectionOrder}
          resetOrder={resetOrder}
        />
      </div>

      {/* Header */}
      <HeaderBar>
        {/* Botão de configurações alinhado ao conteúdo no desktop */}
        <div className="hidden md:flex w-full justify-center mt-6 mb-2">
          <div className="w-full max-w-[1400px] px-80 flex justify-end">
            <SettingsDialog
              handleExport={handleExport}
              handleImport={handleImport}
              restoreDefaults={restoreDefaults}
              handleReset={handleReset}
            />
          </div>
        </div>
        <div className="md:hidden">
          <SettingsDialog
            handleExport={handleExport}
            handleImport={handleImport}
            restoreDefaults={restoreDefaults}
            handleReset={handleReset}
            iconOnly
          />
        </div>
      </HeaderBar>

      {/* Aviso importante sobre atualização dos IDs dos itens */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 md:pr-80">
        <AvisoBanner showAviso={showAviso} setShowAviso={setShowAviso} />
      </div>

      <div className="max-w-[1400px] mx-auto px-3 py-8 md:px-6 md:pr-80">
        <HelpSection showHelp={showHelp} setShowHelp={setShowHelp} />

        {/* Dashboard de Estatísticas */}
        <StatsDashboard
          totalItems={totalItems}
          completedItems={completedItems}
          userProgress={userProgress}
          lastSaved={lastSaved}
        />

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <SectionList
          sortedSectionConfigs={sortedSectionConfigs}
          getFilteredItems={getFilteredItems}
          renderSection={renderSection}
        />
      </div>
      <Footer />
    </div>
  );
}
