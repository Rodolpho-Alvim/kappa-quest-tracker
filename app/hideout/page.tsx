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
const SheetContentNoClose = React.forwardRef<
  HTMLDivElement,
  { side?: "right"; className?: string; children?: React.ReactNode }
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

function getLevelCompletion(
  level: any,
  progress: Record<string, number>,
  stations: any[],
  traderLevels?: Record<string, number>,
  skillLevels?: Record<string, number>
) {
  // Itens
  const itemReqs = level.requirements.filter((r: any) => r.type === "item");
  const moduleReqs = level.requirements.filter((r: any) => r.type === "module");
  const traderReqs = level.requirements.filter((r: any) => r.type === "trader");
  const skillReqs = level.requirements.filter((r: any) => r.type === "skill");
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
  // Traders
  const tradersOk = traderReqs.every((req: any) => {
    if (!traderLevels) return false;
    return (traderLevels[req.traderId] || 0) >= (req.level || 0);
  });
  // Skills
  const skillsOk = skillReqs.every((req: any) => {
    if (!skillLevels) return false;
    return (skillLevels[req.skill] || 0) >= (req.level || 0);
  });
  return itemsOk && modulesOk && tradersOk && skillsOk;
}

// Copiar a função isModuleLevelComplete do HideoutCard para uso local
function isModuleLevelComplete(
  stationName: string,
  level: number,
  allStations: any[],
  progress: Record<string, number>
): boolean {
  // Stash nível 1 é sempre completo
  if (stationName === "Stash" && level === 1) return true;
  const targetStation = allStations.find(
    (s: any) =>
      s.name.toLowerCase().replace(/\s+/g, "") ===
      stationName.toLowerCase().replace(/\s+/g, "")
  );
  if (!targetStation) return false;
  const targetLevel = targetStation.levels.find((l: any) => l.level === level);
  if (!targetLevel) return false;
  // Itens
  const itemReqs = targetLevel.requirements.filter(
    (r: any) => r.type === "item"
  );
  const itemsOk =
    itemReqs.length > 0 &&
    itemReqs.every((req: any) => {
      const progressKey = `${targetStation.name}-lvl${targetLevel.level}-${req.itemId}`;
      return (progress[progressKey] || 0) >= (req.quantity || 0);
    });
  // Módulos (recursivo)
  const moduleReqs = targetLevel.requirements.filter(
    (r: any) => r.type === "module"
  );
  const modulesOk = moduleReqs.every((req: any) =>
    isModuleLevelComplete(req.module, req.level, allStations, progress)
  );
  // Traders
  const traderReqs = targetLevel.requirements.filter(
    (r: any) => r.type === "trader"
  );
  const TRADER_DUMP_TO_ID: Record<number, string> = {
    0: "54cb50c76803fa8b248b4571",
    1: "54cb57776803fa99248b456e",
    2: "579dc571d53a0658a154fbec",
    3: "58330581ace78e27b8b10cee",
    4: "5935c25fb3acc3127c3d8cd9",
    5: "5a7c2eca46aef81a7ca2145d",
    6: "5ac3b934156ae10c4430e83c",
    7: "5c0647fdd443bc2504c2d371",
    8: "54cb50c76803fa8b248b4571",
  };
  const tradersOk = traderReqs.every((req: any) => {
    const traderId = TRADER_DUMP_TO_ID[Number(req.traderId)];
    const traderProgressKey = `trader-${traderId}`;
    const traderLevel = progress[traderProgressKey] || 1;
    const requiredLevel = req.level || req.quantity || 0;
    return traderLevel >= requiredLevel;
  });
  // Skills
  const skillReqs = targetLevel.requirements.filter(
    (r: any) => r.type === "skill"
  );
  const skillsOk = skillReqs.every((req: any) => {
    const globalSkillKey = `skill-${req.skill}`;
    const localSkillKey = `${targetStation.name}-lvl${targetLevel.level}-skill-${req.skill}`;
    const skillLevel = progress[globalSkillKey] ?? progress[localSkillKey] ?? 0;
    return skillLevel >= (req.level || 0);
  });
  return itemsOk && modulesOk && tradersOk && skillsOk;
}

export default function HideoutPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
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
      allStations
        .flatMap((s) =>
          s.levels
            .filter(
              (l: any) =>
                (l.requirements && l.requirements.length > 0) ||
                (l.isBaseLevel && s.name === "Stash")
            )
            .map((l: any) => ({ ...l, station: s.name }))
        )
        // Remover o Stash nível 1 do progresso geral
        .filter((l: any) => !(l.station === "Stash" && l.level === 1)),
    [allStations]
  );
  if (typeof window !== "undefined") {
    // Log de depuração para ver todos os níveis carregados
    console.log(
      "ALL LEVELS DEBUG:",
      allStations.flatMap((s) =>
        s.levels.map((l: any) => ({
          station: s.name,
          level: l.level,
          reqs: l.requirements?.length,
        }))
      )
    );
  }
  // Adicionar mocks para traderLevels e skillLevels até integrar com o progresso real
  const traderLevels = {};
  const skillLevels = {};
  const completedLevels = allLevels.filter((level) =>
    isModuleLevelComplete(level.station, level.level, allStations, progress)
  );
  if (typeof window !== "undefined") {
    // Log de depuração para ver quais níveis estão completos
    console.log(
      "COMPLETED LEVELS DEBUG:",
      completedLevels.map((l) => ({ station: l.station, level: l.level }))
    );
    console.log(
      "ALL LEVELS DEBUG:",
      allLevels.map((l) => ({ station: l.station, level: l.level }))
    );
  }
  const percent =
    (completedLevels.length === allLevels.length - 1 &&
      allLevels.some((l) => l.isBaseLevel && l.station === "Stash")) ||
    (completedLevels.length > 0 && completedLevels.length === allLevels.length)
      ? 100
      : allLevels.length > 0
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
            showApiHubButton={false}
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
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
            {/* Título principal com melhor hierarquia */}
            <div className="mb-6 text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#5a6b4a] via-[#4a5b3a] to-[#6b7c5a] bg-clip-text text-transparent drop-shadow-sm tracking-tight mb-4 font-tarkov">
                Hideout Tracker
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed font-tarkov">
                Gerencie seu progresso do Hideout com precisão
              </p>
            </div>
            {/* Separador visual elegante */}
            <div className="mb-10 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <div className="px-6 py-2 bg-gradient-to-r from-[#5a6b4a] to-[#4a5b3a] rounded-full shadow-lg">
                <span className="text-white font-semibold text-sm">
                  🎯 PROGRESSO
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>
            {/* Dashboard de progresso elegante */}
            <div className="mb-10 p-6 bg-gradient-to-r from-[#5a6b4a]/10 via-[#4a5b3a]/8 to-[#6b7c5a]/6 dark:from-[#5a6b4a]/20 dark:via-[#4a5b3a]/15 dark:to-[#6b7c5a]/12 rounded-2xl shadow-xl border border-[#5a6b4a]/30 dark:border-[#5a6b4a]/40 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center w-full gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5a6b4a] via-[#4a5b3a] to-[#6b7c5a] shadow-2xl p-3">
                    <Target className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-lg md:text-xl font-tarkov">
                        Progresso Geral do Hideout
                      </span>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-sm md:text-base bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm">
                        {completedLevels.length} / {allLevels.length} níveis •{" "}
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full h-5 bg-gray-200/60 dark:bg-zinc-800/60 rounded-full shadow-inner overflow-hidden relative">
                      <div
                        className="absolute left-0 top-0 h-5 rounded-full bg-gradient-to-r from-[#5a6b4a] via-[#4a5b3a] to-[#6b7c5a] transition-all duration-700 shadow-lg"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Traders e Skills com melhor layout */}
            <div className="flex flex-col lg:flex-row gap-6 mb-10">
              <div className="flex-1">
                <div className="transition-all duration-300">
                  <TraderCard progress={progress} setProgress={setProgress} />
                </div>
              </div>
              <div className="flex-1">
                <div className="transition-all duration-300">
                  <SkillCard progress={progress} setProgress={setProgress} />
                </div>
              </div>
            </div>
            {/* Separador visual para busca */}
            <div className="mb-8 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <div className="px-6 py-2 bg-gradient-to-r from-[#6b7c5a] to-[#5a6b4a] rounded-full shadow-lg">
                <span className="text-[#181a1b] font-semibold text-sm">
                  🔍 BUSCA
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>
            {/* Campo de busca */}
            <HideoutSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {/* Link para o Hub da API */}
            {/* <div className="mb-6 text-center">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">
                  🚀 Hub da API Tarkov.dev
                </h3>
                <p className="text-muted-foreground mb-4">
                  Acesse ferramentas avançadas de sincronização, comparação e
                  análise dos dados oficiais
                </p>
                <a
                  href="/hideout/hubapi"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  🌐 Acessar Hub da API
                </a>
              </div>
            </div> */}
            {/* Separador visual para as estações */}
            <div className="mb-10 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <div className="px-6 py-2 bg-gradient-to-r from-[#6b7c5a] to-[#5a6b4a] rounded-full shadow-lg">
                <span className="text-white font-semibold text-sm">
                  🏗️ ESTAÇÕES
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>

            {/* Grid de estações com melhor espaçamento */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#5a6b4a] to-[#4a5b3a] shadow-2xl mb-4">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  Carregando estações do Hideout...
                </p>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-2xl mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">
                  Nenhuma estação encontrada para este filtro.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tente ajustar os termos de pesquisa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {filteredStations.map((station: any) => (
                  <div key={station.id} className="transition-all duration-300">
                    <HideoutCard
                      station={station}
                      progress={progress}
                      setProgress={setProgress}
                      highlightedItems={highlightedItems as Set<string>}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
          <Footer />
        </div>
        {/* Sidebar de itens necessários - visível apenas em telas md+ */}
        <div className="hidden md:block sticky top-0 h-screen z-10">
          <ItemSidebar
            progress={progress}
            setProgress={setProgress}
            hideCompleted={hideCompleted}
            onHideCompletedChange={setHideCompleted}
            searchTerm={searchTerm}
          />
        </div>
        {/* Botão para abrir o sidebar no mobile */}
        <button
          className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[#5a6b4a] to-[#4a5b3a] text-white rounded-2xl p-5 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="w-7 h-7" />
        </button>
        {/* Sidebar mobile (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContentNoClose
            side="right"
            className="block md:hidden p-0 w-70"
          >
            <ItemSidebar
              progress={progress}
              setProgress={setProgress}
              hideCompleted={hideCompleted}
              onHideCompletedChange={setHideCompleted}
              searchTerm={searchTerm}
            />
          </SheetContentNoClose>
        </Sheet>
      </div>
    </div>
  );
}
