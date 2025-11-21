"use client";
import { useHideoutStations } from "@/hooks/use-hideout-stations";
import { Button } from "@/components/ui/button";
import React from "react";
import { X } from "lucide-react";

// Mapeamento de nomes de estação para arquivos de imagem (mesmo do hideout-card.tsx)
const STATION_IMAGE_MAP: Record<string, string> = {
  "Air Filtering Unit": "/images/air-filtering-unit.png",
  "Bitcoin Farm": "/images/bitcoin-farm.png",
  "Booze Generator": "/images/booze-generator.png",
  "Cultist Circle": "/images/cultist-circle.png",
  "Defective Wall": "https://assets.tarkov.dev/station-defective-wall.png",
  "Gear Rack": "/images/Gear_Rack_Portrait.png",
  Generator: "/images/Generator_Portrait.png",
  Gym: "/images/Gym_Portrait.png",
  "Hall of Fame": "/images/Hall_of_Fame_Portrait.png",
  Heating: "/images/Heating_Portrait.png",
  Illumination: "/images/Illumination_Portrait.png",
  "Intelligence Center": "/images/Intelligence_Center_Portrait.png",
  Lavatory: "/images/Lavatory_Portrait.png",
  Library: "/images/Library_Portrait.png",
  Medstation: "/images/Medstation_Portrait.png",
  "Nutrition Unit": "/images/Nutrition_Unit_Portrait.png",
  "Rest Space": "/images/Rest_Space_Portrait.png",
  "Scav Case": "/images/Scav_Case_Portrait.png",
  Security: "/images/Security_Portrait.png",
  "Shooting Range": "/images/Shooting_Range_Portrait.png",
  "Solar Power": "/images/Solar_power_Portrait.png",
  Stash: "/images/Stash_Portrait.png",
  Vents: "/images/Vents_Portrait.png",
  "Water Collector": "/images/Water_Collector_Portrait.png",
  "Weapon Rack": "/images/Weapon_Rack_Portrait.png",
  Workbench: "/images/Workbench_Portrait.png",
};

interface HideoutStationNavigationProps {
  onStationSelect: (stationId: number | null) => void;
  selectedStationId: number | null;
}

export function HideoutStationNavigation({ 
  onStationSelect, 
  selectedStationId 
}: HideoutStationNavigationProps) {
  const { stations, loading } = useHideoutStations();

  const handleStationClick = (stationId: number) => {
    // Se a mesma estação for clicada novamente, deselecionar
    if (selectedStationId === stationId) {
      onStationSelect(null);
    } else {
      onStationSelect(stationId);
    }
  };

  const getStationImage = (stationName: string, stationId: number): string => {
    // Primeiro tentar o mapeamento direto
    if (STATION_IMAGE_MAP[stationName]) {
      return STATION_IMAGE_MAP[stationName];
    }
    
    // Fallback para imagem local baseada no nome
    const fallbackImage = `/images/${stationName
      .toLowerCase()
      .replace(/\s+/g, "-")}.png`;
    
    return fallbackImage;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 justify-center items-center p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Botão para mostrar todas as estações */}
        {selectedStationId !== null && (
          <Button
            onClick={() => onStationSelect(null)}
            variant="outline"
            className="h-12 px-3 rounded-lg hover:scale-110 transition-all duration-300 hover:shadow-lg border-2 border-[#5a6b4a] dark:border-[#5a6b4a] bg-[#5a6b4a] dark:bg-[#5a6b4a] hover:bg-[#4a5b3a] dark:hover:bg-[#4a5b3a] text-white font-semibold text-sm"
            title="Mostrar todas as estações"
          >
            <X className="w-4 h-4 mr-1.5" />
            Todas
          </Button>
        )}
        
        {stations.map((station: any) => {
          const imagePath = getStationImage(station.name, station.id);
          const isSelected = selectedStationId === station.id;
          return (
            <Button
              key={station.id}
              onClick={() => handleStationClick(station.id)}
              variant="outline"
              className={`relative group h-12 w-12 p-1.5 rounded-lg hover:scale-110 transition-all duration-300 hover:shadow-lg border-2 ${
                isSelected
                  ? "border-[#5a6b4a] dark:border-[#5a6b4a] bg-[#5a6b4a]/20 dark:bg-[#5a6b4a]/30 ring-2 ring-[#5a6b4a] ring-offset-1"
                  : "hover:border-[#5a6b4a] dark:hover:border-[#5a6b4a] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title={station.name}
            >
              <img
                src={imagePath}
                alt={station.name}
                className="w-full h-full object-contain rounded"
                onError={(e) => {
                  // Se a imagem local falhar, tentar a API do Tarkov.dev
                  const target = e.currentTarget;
                  target.src = `https://assets.tarkov.dev/${station.id}-icon.webp`;
                  target.onerror = () => {
                    // Se ainda falhar, esconder a imagem
                    target.style.display = "none";
                  };
                }}
              />
              {/* Tooltip com nome da estação */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {station.name}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

