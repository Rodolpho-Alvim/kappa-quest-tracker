"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface NavigationSidebarProps {
  sections: {
    id: string;
    title: string;
    icon: string;
    color: string;
    completedCount: number;
    totalCount: number;
  }[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
}

export function NavigationSidebar({
  sections,
  activeSection,
  onSectionClick,
}: NavigationSidebarProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      onSectionClick(sectionId);
    }
  };

  return (
    <div className="fixed right-0 top-[55%] transform -translate-y-1/2 z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 p-2 max-w-xs">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-600 px-2 py-1">
            📋 Navegação Rápida
          </div>
          {sections.map((section) => {
            const progressPercentage =
              section.totalCount > 0
                ? Math.round(
                    (section.completedCount / section.totalCount) * 100
                  )
                : 0;

            const isActive = activeSection === section.id;

            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => scrollToSection(section.id)}
                className={`
                  w-full justify-start text-left p-1 h-auto
                  ${
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : "hover:bg-gray-100"
                  }
                  transition-all duration-200
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{section.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {section.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            isActive
                              ? "bg-white/20 text-white border-0"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {section.completedCount}/{section.totalCount}
                        </Badge>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[40px]">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isActive ? "bg-white" : "bg-green-500"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isActive ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </Button>
            );
          })}
          <div className="border-t pt-1 mt-2">
            <div className="text-xs text-gray-500 px-2">
              💡 Clique para navegar
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
