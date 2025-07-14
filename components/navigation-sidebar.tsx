"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          ${
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "hover:bg-muted"
          }
          transition-all duration-200
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        `}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Handle de arrastar */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            title="Arrastar para reordenar"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
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
                      ? "bg-primary-foreground/20 text-primary-foreground border-0"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {section.completedCount}/{section.totalCount}
                </Badge>
                <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[40px]">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? "bg-primary-foreground" : "bg-green-500"
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

const NavigationSidebar = ({
  sections,
  activeSection,
  onSectionClick,
  getSectionOrder,
  setFullSectionOrder,
  resetOrder,
}: NavigationSidebarProps) => {
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
    <div className="mt-0 md:mt-[10%]">
      <div className="flex flex-col gap-2 p-2 pt-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedSections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onSectionClick={scrollToSection}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button variant="ghost" size="sm" className="mt-4" onClick={resetOrder}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Ordem
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
