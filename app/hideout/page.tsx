"use client";
import { Footer } from "@/components/Footer";
import { HeaderBar } from "@/components/HeaderBar";
import { HideoutCard } from "@/components/hideout-card";
import { HideoutSearch } from "@/components/hideout-search";
import { ItemSidebar } from "@/components/item-sidebar";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SkillCard } from "@/components/skill-card";
import { TraderCard } from "@/components/trader-card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useHideoutProgress } from "@/hooks/use-hideout-progress";
import { useHideoutSearch } from "@/hooks/use-hideout-search";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Menu } from "lucide-react";
import React, { useState } from "react";

// Componente SheetContent que não fecha automaticamente
const SheetContentNoClose = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  React.ComponentPropsWithoutRef<typeof SheetContent>
>(({ children, ...props }, ref) => (
  <SheetContent ref={ref} {...props}>
    {children}
  </SheetContent>
));
SheetContentNoClose.displayName = "SheetContentNoClose";

export default function HideoutPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const { filteredStations, allStations, highlightedItems, loading } =
    useHideoutSearch(searchTerm);
  const { getHideoutOverallProgress } = useHideoutProgress();
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(
    "kappa-hideout-progress",
    {}
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function resetProgress() {
    setProgress({});
  }

  // Dashboard: calcular progresso baseado nos níveis das estações em tempo real
  const hideoutProgress = React.useMemo(() => {
    if (!allStations || allStations.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    let totalLevels = 0;
    let completedLevels = 0;

    allStations.forEach((station) => {
      station.levels.forEach((level: any) => {
        // Contar apenas níveis que têm requisitos (excluir Stash nível 1)
        if (level.requirements && level.requirements.length > 0) {
          totalLevels++;

          // ULTRA SIMPLIFICADO: Só verificar se os itens estão completos
          // Ignorar completamente módulos, traders e skills
          // Se você completou os itens, o nível está completo!
          const itemReqs = level.requirements.filter(
            (req: any) => req.type === "item"
          );

          // ULTRA SIMPLES: Se o botão está verde, conta para o progresso!
          // Verificar se o nível está visualmente completo (verde)
          let isLevelComplete = false;

          // Verificar se TODOS os requisitos estão atendidos
          if (level.requirements && level.requirements.length > 0) {
            isLevelComplete = level.requirements.every((req: any) => {
              if (req.type === "item") {
                // Verificar se o item está completo
                const progressKey = `${station.name}-lvl${level.level}-${req.itemId}`;
                const currentProgress = progress[progressKey] || 0;
                return currentProgress >= (req.quantity || 0);
              } else if (req.type === "module") {
                // Verificar se o módulo base está completo
                const targetStation = allStations.find(
                  (s: any) =>
                    s.name.toLowerCase().replace(/\s+/g, "") ===
                    req.module.toLowerCase().replace(/\s+/g, "")
                );
                if (!targetStation) return false;

                const targetLevel = targetStation.levels.find(
                  (l: any) => l.level === req.level
                );
                if (!targetLevel) return false;

                // Se o módulo base tem itens, verificar se estão completos
                const targetItemReqs = targetLevel.requirements.filter(
                  (r: any) => r.type === "item"
                );
                if (targetItemReqs.length > 0) {
                  return targetItemReqs.every((itemReq: any) => {
                    const progressKey = `${targetStation.name}-lvl${targetLevel.level}-${itemReq.itemId}`;
                    return (
                      (progress[progressKey] || 0) >= (itemReq.quantity || 0)
                    );
                  });
                }
                // Se o módulo base não tem itens, verificar se está completo
                return true;
              } else if (req.type === "trader") {
                // Verificar se o trader está no nível correto
                const TRADER_DUMP_TO_ID: Record<string, string> = {
                  Mechanic: "54cb50c76803fa8b248b4571",
                  Skier: "54cb57776803fa99248b456e",
                  Peacekeeper: "579dc571d53a0658a154fbec",
                  Therapist: "58330581ace78e27b8b10cee",
                  Prapor: "5935c25fb3acc3127c3d8cd9",
                  Fence: "5a7c2eca46aef81a7ca2145d",
                  Jaeger: "5ac3b934156ae10c4430e83c",
                  Ragman: "5c0647fdd443bc2504c2d371",
                };

                const traderId =
                  TRADER_DUMP_TO_ID[req.traderId] || req.traderId;
                const traderProgressKey = `trader-${traderId}`;
                const traderLevel = progress[traderProgressKey] || 1;
                const requiredLevel = req.level || req.quantity || 0;
                return traderLevel >= requiredLevel;
              } else if (req.type === "skill") {
                // Verificar se a skill está no nível correto
                const globalSkillKey = `skill-${req.skill}`;
                const localSkillKey = `${station.name}-lvl${level.level}-skill-${req.skill}`;
                const skillLevel =
                  progress[globalSkillKey] ?? progress[localSkillKey] ?? 0;
                return skillLevel >= (req.level || 0);
              }
              return false;
            });
          }

          if (isLevelComplete) {
            completedLevels++;
          }
        }
      });
    });

    const percentage =
      totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    return {
      completed: completedLevels,
      total: totalLevels,
      percentage,
    };
  }, [allStations, progress]);

  const {
    completed: completedLevels,
    total: allLevels,
    percentage: percent,
  } = hideoutProgress;

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
              />
            </div>
          </HeaderBar>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Separador visual para o dashboard */}
            <div className="mb-8 flex items-center">
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
                    <svg
                      className="w-8 h-8 text-white drop-shadow-lg"
                      fill="none"
                      viewBox="0 0 100 100"
                    >
                      {/* Círculo externo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                      />
                      {/* Terceiro círculo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                      />
                      {/* Segundo círculo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="25"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                      />
                      {/* Círculo central (preenchido) */}
                      <circle cx="50" cy="50" r="15" fill="white" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-lg md:text-xl">
                        Progresso Geral do Hideout
                      </span>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-sm md:text-base bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm">
                        {completedLevels} / {allLevels} níveis • {percent}%
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
