"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, RotateCcw } from "lucide-react";
import { useEffect } from "react";

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
  getSectionOrder: (sectionId: string) => number;
  setFullSectionOrder: (order: string[]) => void;
  resetOrder: () => void;
}

// Componente de item arrastável
function SortableSectionItem({
  section,
  isActive,
  onSectionClick,
}: {
  section: NavigationSidebarProps["sections"][0];
  isActive: boolean;
  onSectionClick: (sectionId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const progressPercentage =
    section.totalCount > 0
      ? Math.round((section.completedCount / section.totalCount) * 100)
      : 0;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={() => onSectionClick(section.id)}
        className={`
          w-full justify-start text-left p-1 h-auto
          ${isActive ? "bg-blue-500 text-white shadow-md" : "hover:bg-gray-100"}
          transition-all duration-200
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        `}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Handle de arrastar */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
            title="Arrastar para reordenar"
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>

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
    </div>
  );
}

export function NavigationSidebar({
  sections,
  activeSection,
  onSectionClick,
  getSectionOrder,
  setFullSectionOrder,
  resetOrder,
}: NavigationSidebarProps) {
  // use as funções recebidas via props, não chame o hook de novo!

  // Garante que todas as seções tenham uma ordem inicial baseada na ordem do array original
  const ensureOrder = () => {
    sections.forEach((section, idx) => {
      if (getSectionOrder(section.id) === 999) {
        setFullSectionOrder(sections.map((s) => s.id));
      }
    });
  };

  useEffect(() => {
    ensureOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sections)]);

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

  // Ordenar seções baseado apenas na ordem salva
  const sortedSections = [...sections].sort((a, b) => {
    return getSectionOrder(a.id) - getSectionOrder(b.id);
  });

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função chamada quando o drag termina
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sortedSections.findIndex(
        (section) => section.id === active.id
      );
      const newIndex = sortedSections.findIndex(
        (section) => section.id === over?.id
      );
      const newOrder = arrayMove(sortedSections, oldIndex, newIndex);
      setFullSectionOrder(newOrder.map((section) => section.id));
    }
  };

  return (
    <div className="fixed right-0 top-[55%] transform -translate-y-1/2 z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 p-2 max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="text-xs font-semibold text-gray-600">
              📋 Navegação Rápida
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetOrder}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              title="Resetar ordem das seções"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {sortedSections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    onSectionClick={scrollToSection}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="border-t pt-1 mt-2">
            <div className="text-xs text-gray-500 px-2">
              💡 Arraste para reordenar • Clique para navegar
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
