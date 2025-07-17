"use client";
import { Footer } from "@/components/Footer";
import { HeaderBar } from "@/components/HeaderBar";
import { HideoutCard } from "@/components/hideout-card";
import HideoutSearch from "@/components/hideout-search";
import ItemSidebar from "@/components/item-sidebar";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SkillCard } from "@/components/skill-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { TraderCard } from "@/components/trader-card";
import { Sheet, SheetOverlay, SheetPortal } from "@/components/ui/sheet";
import { useHideoutSearch } from "@/hooks/use-hideout-search";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { Menu, Target } from "lucide-react";
import * as React from "react";
import { useState } from "react";

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);
const SheetContentNoClose = React.forwardRef(
  ({ side = "right", className, children, ...props }, ref) => (
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
  )
);
SheetContentNoClose.displayName = "SheetContentNoClose";

function getLevelCompletion(
  level: any,
  progress: Record<string, number>,
  stations: any[]
) {
  // Considera completo se todos os requisitos (itens e módulos) estão completos
  const itemReqs = level.requirements.filter((r: any) => r.type === "item");
  const moduleReqs = level.requirements.filter((r: any) => r.type === "module");
  // Itens
  const itemsOk = itemReqs.every((req: any) => {
    const progressKey = `${level.station}-lvl${level.level}-${req.itemId}`;
    return (progress[progressKey] || 0) >= (req.quantity || 0);
  });
  // Módulos
  const modulesOk = moduleReqs.every((req: any) => {
    const targetStation = stations.find(
      (s: any) =>
        s.name.toLowerCase().replace(/\s+/g, "") ===
        req.module.toLowerCase().replace(/\s+/g, "")
    );
    if (!targetStation) return false;
    const targetLevel = targetStation.levels.find(
      (l: any) => l.level === req.level
    );
    if (!targetLevel) return false;
    const itemReqs = targetLevel.requirements.filter(
      (r: any) => r.type === "item"
    );
    if (itemReqs.length === 0) return false;
    return itemReqs.every((itemReq: any) => {
      const progressKey = `${targetStation.name}-lvl${targetLevel.level}-${itemReq.itemId}`;
      return (progress[progressKey] || 0) >= (itemReq.quantity || 0);
    });
  });
  return itemsOk && modulesOk;
}

export default function HideoutPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { filteredStations, allStations, highlightedItems, loading } =
    useHideoutSearch(searchTerm);
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(
    "kappa-hideout-progress",
    {}
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  function resetProgress() {
    setProgress({});
  }

  // Dashboard: total de níveis e completos (usar todas as estações)
  const allLevels = React.useMemo(
    () =>
      allStations.flatMap((s) =>
        s.levels
          .filter((l: any) => !(s.name === "Stash" && l.level === 1))
          .map((l: any) => ({ ...l, station: s.name }))
      ),
    [allStations]
  );
  const completedLevels = allLevels.filter((level) =>
    getLevelCompletion(level, progress, allStations)
  );
  const percent =
    allLevels.length > 0
      ? Math.round((completedLevels.length / allLevels.length) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#101112]">
      <div className="flex flex-row flex-1 min-h-0">
        {/* Conteúdo principal do Hideout */}
        <div className="flex-1 min-w-0">
          <HeaderBar
            imageSrc="/images/Banner_hideout.png"
            title="Hideout"
            subtitle="Hideout Progress"
            showHubButton={true}
          >
            <div className="flex items-center justify-center md:justify-end w-full md:w-auto gap-2">
              <SettingsDialog
                handleExport={() => {
                  // Exportar progresso do Hideout
                  const exportData = {
                    progress,
                    exportDate: new Date().toISOString(),
                    version: "v1-hideout",
                  };
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `hideout-progress-${
                    new Date().toISOString().split("T")[0]
                  }.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                handleImport={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const data = JSON.parse(e.target?.result as string);
                      if (data.progress) setProgress(data.progress);
                      alert("Dados importados com sucesso!");
                    } catch (error) {
                      alert("Erro ao importar dados");
                    }
                  };
                  reader.readAsText(file);
                }}
                restoreDefaults={() => {}}
                handleReset={() => {
                  if (
                    confirm(
                      "Tem certeza que deseja resetar TODO o progresso do Hideout? Esta ação não pode ser desfeita."
                    )
                  ) {
                    setProgress({});
                    alert("Progresso do Hideout resetado!");
                  }
                }}
                iconOnly={false}
                showRestoreDefaults={false}
              />
              <ThemeToggle />
            </div>
          </HeaderBar>
          <main className="flex-1 max-w-5xl mx-auto w-full px-2 py-6">
            {/* Dashboard de progresso */}
            <div className="mb-6 p-4 bg-cyan-100/60 dark:bg-cyan-900/40 rounded-xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-cyan-200 dark:border-cyan-900/60">
              <div className="flex flex-col md:flex-row items-center w-full gap-4">
                <div className="flex items-center gap-3 w-full">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-green-400 shadow-lg">
                    <Target className="w-5 h-5 text-gray-900 dark:text-gray-200 drop-shadow" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800 dark:text-gray-300 text-sm md:text-base">
                        Progresso geral
                      </span>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-xs md:text-sm">
                        {completedLevels.length} / {allLevels.length} níveis •{" "}
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-zinc-800 rounded-full shadow-inner overflow-hidden relative">
                      <div
                        className="absolute left-0 top-0 h-4 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 transition-all duration-500 shadow"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Cards de Traders e Skills */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <TraderCard progress={progress} setProgress={setProgress} />
              </div>
              <div className="flex-1">
                <SkillCard progress={progress} setProgress={setProgress} />
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-center dark:text-gray-100 text-gray-900 drop-shadow-sm tracking-tight">
                Hideout
              </h1>
              <p className="text-center text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-2 font-medium">
                Gerencie seu progresso do Hideout
              </p>
            </div>
            {/* Campo de busca */}
            <HideoutSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            {loading ? (
              <div className="text-center text-gray-500 py-12">
                Carregando estações do Hideout...
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                Nenhuma estação encontrada para este filtro.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {filteredStations.map((station: any) => (
                  <HideoutCard
                    key={station.id}
                    station={station}
                    progress={progress}
                    setProgress={setProgress}
                    highlightedItems={highlightedItems}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </main>
          <Footer />
        </div>
        {/* Sidebar de itens necessários - visível apenas em telas md+ */}
        <div className="hidden md:block sticky top-0 h-screen z-10">
          <ItemSidebar progress={progress} />
        </div>
        {/* Botão para abrir o sidebar no mobile */}
        <button
          className="md:hidden fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/80 transition"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Sidebar mobile (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContentNoClose
            side="right"
            className="block md:hidden p-0 w-70"
          >
            <ItemSidebar progress={progress} />
          </SheetContentNoClose>
        </Sheet>
      </div>
    </div>
  );
}
