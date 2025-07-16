"use client";
import { Footer } from "@/components/Footer";
import { HeaderBar } from "@/components/HeaderBar";
import { HideoutCard } from "@/components/hideout-card";
import ItemSidebar from "@/components/item-sidebar";
import { SkillCard } from "@/components/skill-card";
import { TraderCard } from "@/components/trader-card";
import { useHideoutStations } from "@/hooks/use-hideout-stations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as React from "react";
import { useState } from "react";

const PRIMARY_VIEWS = [
  { title: "Todas", value: "all" },
  { title: "Com mais de 1 nível", value: "multi" },
];

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
  const [activeTab, setActiveTab] = useState("all");
  const { stations, loading } = useHideoutStations();
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(
    "kappa-hideout-progress",
    {}
  );
  function resetProgress() {
    setProgress({});
  }

  // Dashboard: total de níveis e completos
  const allLevels = React.useMemo(
    () =>
      stations.flatMap((s) =>
        s.levels.map((l: any) => ({ ...l, station: s.name }))
      ),
    [stations]
  );
  const completedLevels = allLevels.filter((level) =>
    getLevelCompletion(level, progress, stations)
  );
  const percent =
    allLevels.length > 0
      ? Math.round((completedLevels.length / allLevels.length) * 100)
      : 0;

  const visibleStations = React.useMemo(() => {
    if (activeTab === "multi") {
      return stations.filter((station) => station.levels.length > 1);
    }
    return stations;
  }, [activeTab, stations]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-row flex-1 min-h-0">
        {/* Conteúdo principal do Hideout */}
        <div className="flex-1 min-w-0">
          <HeaderBar />
          <main className="flex-1 max-w-5xl mx-auto w-full px-2 py-6">
            <h1 className="text-2xl font-bold mb-4">Hideout</h1>
            {/* Dashboard de progresso */}
            <div className="mb-6 p-4 bg-blue-50 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <span className="font-semibold">Progresso geral:</span>{" "}
                {completedLevels.length} / {allLevels.length} níveis completos
                <span className="ml-4 font-semibold">{percent}%</span>
              </div>
              <div className="flex-1 flex items-center ml-0 md:ml-4">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-blue-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <button
                  className="ml-4 px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold border border-red-200 hover:bg-red-200"
                  onClick={resetProgress}
                >
                  Resetar progresso
                </button>
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
            <div className="flex gap-2 mb-6">
              {PRIMARY_VIEWS.map((tab) => (
                <button
                  key={tab.value}
                  className={`px-4 py-2 rounded font-medium transition-colors border border-transparent ${
                    activeTab === tab.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-800"
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="text-center text-gray-500 py-12">
                Carregando estações do Hideout...
              </div>
            ) : visibleStations.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                Nenhuma estação encontrada para este filtro.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {visibleStations.map((station: any) => (
                  <HideoutCard
                    key={station.id}
                    station={station}
                    progress={progress}
                    setProgress={setProgress}
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
      </div>
    </div>
  );
}
