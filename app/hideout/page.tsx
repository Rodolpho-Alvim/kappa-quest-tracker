"use client";
import { Footer } from "@/components/Footer";
import { HeaderBar } from "@/components/HeaderBar";
import { HideoutCard } from "@/components/hideout-card";
import { HideoutSearch } from "@/components/hideout-search";
import { HideoutStationNavigation } from "@/components/hideout-station-navigation";
import { ItemSidebar } from "@/components/item-sidebar";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SkillCard } from "@/components/skill-card";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const { filteredStations, allStations, highlightedItems, loading } =
    useHideoutSearch(searchTerm);
  const { getHideoutOverallProgress } = useHideoutProgress();
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(
    "kappa-hideout-progress",
    {}
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll para a estação selecionada
  React.useEffect(() => {
    if (selectedStationId !== null) {
      // Delay maior para garantir que o DOM foi completamente atualizado e renderizado
      const scrollTimeout = setTimeout(() => {
        // Usar allStations para encontrar a estação, pois ela pode não estar no filteredStations devido ao filtro de busca
        const selectedStation = allStations.find(
          (station: any) => station.id === selectedStationId
        );
        
        if (selectedStation) {
          // Criar o ID do elemento da estação
          const stationElementId = `station-${selectedStation.id}-${selectedStation.name.replace(/\s+/g, "-").toLowerCase()}`;
          
          // Tentar encontrar o elemento várias vezes com pequenos delays
          const tryScroll = (attempts: number = 0) => {
            const stationElement = document.getElementById(stationElementId);
            
            if (stationElement) {
              // Calcular a posição do elemento com offset para ficar abaixo dos botões
              const elementTop = stationElement.getBoundingClientRect().top;
              const scrollPosition = window.pageYOffset + elementTop - 120; // 120px de offset
              
              // Scroll suave até a estação selecionada
              window.scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: "smooth"
              });
            } else if (attempts < 5) {
              // Tentar novamente após um pequeno delay
              setTimeout(() => tryScroll(attempts + 1), 100);
            }
          };
          
          tryScroll();
        }
      }, 300);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [selectedStationId, allStations]);

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

    // DEBUG: Log para entender o que está sendo contado
    console.log("=== DEBUG HIDEOUT PROGRESS ===");
    console.log("Total de estações:", allStations.length);

    allStations.forEach((station) => {
      console.log(`\n--- Estação: ${station.name} ---`);
      station.levels.forEach((level: any) => {
        console.log(
          `  Nível ${level.level}: requirements.length = ${
            level.requirements?.length || 0
          }`
        );

        // Contar apenas níveis que têm requisitos E que podem ser completados
        if (level.requirements && level.requirements.length > 0) {
          // Filtrar apenas requisitos de ITENS (mesmo que os botões)
          const itemRequirements = level.requirements.filter(
            (req: any) => req.type === "item"
          );

          // SÓ contar se tem itens para completar (mesmo que os botões)
          if (itemRequirements.length > 0) {
            totalLevels++;
            console.log(
              `    ✅ CONTADO: ${station.name} nível ${level.level} (tem ${itemRequirements.length} itens)`
            );

            // LÓGICA ULTRA SIMPLES: Usar EXATAMENTE a mesma lógica dos botões verdes!
            // Se o botão está verde, conta como COMPLETO na barra de progresso
            let isLevelComplete = false;

            // MESMA lógica dos botões: verificar se há itens incompletos
            const hasIncompleteItems = itemRequirements.some((req: any) => {
              const progressKey = `${station.name}-lvl${level.level}-${req.itemId}`;
              const found = progress[progressKey] || 0;
              const required = req.quantity || 0;
              return found < required;
            });

            // Se NÃO há itens incompletos, o nível está COMPLETO (botão verde)
            isLevelComplete = !hasIncompleteItems;

            if (isLevelComplete) {
              completedLevels++;
              console.log(
                `    🎯 COMPLETO: ${station.name} nível ${level.level}`
              );
            } else {
              console.log(
                `    ❌ INCOMPLETO: ${station.name} nível ${level.level} - INVESTIGAR!`
              );
              // DEBUG: Mostrar quais requisitos estão falhando
              itemRequirements.forEach((req: any, index: number) => {
                const progressKey = `${station.name}-lvl${level.level}-${req.itemId}`;
                const currentProgress = progress[progressKey] || 0;
                const required = req.quantity || 0;
                const reqStatus = currentProgress >= required;
                console.log(
                  `      Requisito ${index + 1} (ITEM): ${
                    req.itemId
                  } - ${currentProgress}/${required} = ${
                    reqStatus ? "✅" : "❌"
                  }`
                );
              });
            }
          } else {
            console.log(
              `    ⏭️ IGNORADO: ${station.name} nível ${level.level} (sem itens, só módulos/traders/skills)`
            );
          }
        } else {
          console.log(
            `    ⏭️ IGNORADO: ${station.name} nível ${level.level} (sem requisitos)`
          );
          // DEBUG: Verificar se é o Stash nível 1
          if (station.name === "Stash" && level.level === 1) {
            console.log(`    🔍 STASH NÍVEL 1 DETECTADO:`);
            console.log(`      - level.requirements:`, level.requirements);
            console.log(
              `      - level.requirements.length:`,
              level.requirements?.length
            );
            console.log(
              `      - level.requirements && level.requirements.length > 0:`,
              level.requirements && level.requirements.length > 0
            );
          }
        }
      });
    });

    console.log(`\n=== RESULTADO FINAL ===`);
    console.log(`Total de níveis contados: ${totalLevels}`);
    console.log(`Níveis completos: ${completedLevels}`);
    console.log(
      `Porcentagem: ${
        totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0
      }%`
    );

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
    <div className="min-h-screen bg-background dark:bg-[#101112]">
      <HeaderBar
        imageSrc="/images/Banner_hideout.png"
        title="Hideout Tracker"
        subtitle="Hideout Progress"
        showHubButton={true}
        showApiHubButton={false}
      >
        <div className="hidden md:flex w-full justify-center mt-6 mb-2">
          <div className="w-full md:pl-80 flex justify-end items-center gap-2 px-6">
            <ThemeToggle />
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
            />
          </div>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
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
          />
        </div>
      </HeaderBar>

      <div className="w-full px-3 py-8 md:px-6 md:pl-80">
        <div className="space-y-6">
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
          <div className="mb-8 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            <div className="px-6 py-2 bg-gradient-to-r from-[#5a6b4a] to-[#4a5b3a] rounded-full shadow-lg">
              <span className="text-white font-semibold text-sm">
                👥 TRADERS E SKILLS
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
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

          {/* Navegação rápida com imagens das estações */}
          <HideoutStationNavigation 
            onStationSelect={setSelectedStationId}
            selectedStationId={selectedStationId}
          />

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
             <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[1920px]:grid-cols-4 gap-6 items-stretch">
              {(() => {
                // Se uma estação está selecionada, garantir que ela esteja na lista
                let stationsToShow = filteredStations;
                if (selectedStationId !== null) {
                  const selectedStation = allStations.find(
                    (station: any) => station.id === selectedStationId
                  );
                  if (selectedStation && !filteredStations.some((s: any) => s.id === selectedStationId)) {
                    // Se a estação selecionada não está no filteredStations, adicioná-la
                    stationsToShow = [selectedStation];
                  } else {
                    // Filtrar para mostrar apenas a estação selecionada
                    stationsToShow = filteredStations.filter(
                      (station: any) => station.id === selectedStationId
                    );
                  }
                }
                
                return stationsToShow.map((station: any) => {
                  const stationElementId = `station-${station.id}-${station.name.replace(/\s+/g, "-").toLowerCase()}`;
                  return (
                    <div 
                      key={station.id} 
                      id={stationElementId}
                      className="transition-all duration-300 scroll-mt-24"
                    >
                      <HideoutCard
                        station={station}
                        progress={progress}
                        setProgress={setProgress}
                        highlightedItems={highlightedItems as Set<string>}
                        className="h-full"
                      />
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
      <Footer />
      {/* Sidebar de itens necessários - visível apenas em telas md+ */}
      <div className="hidden md:block md:w-72 md:h-screen md:fixed md:top-0 md:left-0 md:z-0 bg-background border-r border-border shadow-none overflow-y-auto overflow-x-hidden">
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
        <SheetContentNoClose side="right" className="block md:hidden p-0 w-70">
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
  );
}
