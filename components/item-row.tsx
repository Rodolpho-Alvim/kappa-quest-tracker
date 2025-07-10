"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CraftItem,
  HideoutItem,
  QuestItem,
  RecompensaItem,
  SampleItem,
  StreamerItem,
  TrocaItem,
  UserProgress,
} from "@/types/quest-data";
import { Check, Edit3, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ItemRowProps {
  item:
    | QuestItem
    | SampleItem
    | RecompensaItem
    | TrocaItem
    | StreamerItem
    | CraftItem
    | HideoutItem;
  sectionType:
    | "main"
    | "samples"
    | "recompensas-quests"
    | "troca-itens"
    | "streamer"
    | "craft"
    | "hideout"
    | "barter-gunsmith"
    | "barter-chaves"
    | "dorm206"
    | "portable-bunkhouse"
    | "dorm303"
    | "chavesQuests";
  userProgress?: UserProgress[string];
  onProgressUpdate: (itemId: string, field: string, value: any) => void;
  onItemUpdate: (itemId: string, field: string, value: any) => void;
  onDeleteItem: (itemId: string) => void;
  isEven: boolean;
}

export function ItemRow({
  item,
  sectionType,
  userProgress,
  onProgressUpdate,
  onItemUpdate,
  onDeleteItem,
  isEven,
}: ItemRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.item);

  // Lógica automática de completo: qtdE >= qtdR (e FIR, se necessário)
  const qtdE = Number(userProgress?.qtdE ?? (item as any).qtdE ?? 0);
  const qtdR = Number(userProgress?.qtdR ?? (item as any).qtdR ?? 0);
  const firRequired =
    (item as any).fir === "Yes" || userProgress?.fir === "Yes";
  const firOk =
    !firRequired || userProgress?.fir === "Yes" || (item as any).fir === "Yes";
  const isCompleted = qtdE >= qtdR && firOk && qtdR > 0;

  const bgColor = isEven ? "bg-gray-50" : "bg-white";
  const completedBg = isCompleted
    ? "bg-green-50 border-l-4 border-l-green-500 bg-opacity-60"
    : "";

  // Verificar se é uma referência (TARCONE, OU)
  const isReference = (item as any).isReference === true;

  const handleNameSave = () => {
    onItemUpdate(item.id, "item", editName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditName(item.item);
    setIsEditingName(false);
  };

  const getValue = (field: string, defaultValue: any = "") => {
    return (
      userProgress?.[field as keyof UserProgress[string]] ??
      (item as any)[field] ??
      defaultValue
    );
  };

  const getFirValue = () => {
    const value = getValue("fir", "");
    return value === "" || value === "N/A" ? "-" : value;
  };

  // Se for uma referência, renderizar de forma diferente
  if (isReference) {
    return (
      <div className={`${bgColor} p-4 border-b`}>
        <div className="flex items-center justify-center">
          <span className="font-bold text-lg text-gray-700 text-center">
            {item.item}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgColor} ${completedBg} p-4 border-b hover:bg-gray-100 transition-colors group`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Lado esquerdo: Nome */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") handleNameCancel();
                  }}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleNameSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleNameCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span
                  className={`font-medium text-sm leading-tight ${
                    isCompleted ? "line-through text-gray-500" : ""
                  }`}
                  title={item.item}
                >
                  {item.item}
                  {isCompleted && (
                    <span className="ml-2 text-green-600" title="Completo">
                      ✓
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Lado direito: Campos editáveis */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Qtd. E - Quantidade Encontrada */}
          <div className="flex flex-col items-center min-w-[60px]">
            <label
              className="text-xs text-gray-500 mb-1"
              title="Quantidade Encontrada"
            >
              Qtd. E
            </label>
            <Input
              type="number"
              value={getValue("qtdE")}
              onChange={(e) =>
                onProgressUpdate(item.id, "qtdE", e.target.value)
              }
              className="w-14 h-8 text-center text-xs"
              placeholder="0"
              title="Quantidade que você já encontrou/possui"
            />
          </div>

          {/* Qtd. R - Quantidade Requerida */}
          <div className="flex flex-col items-center min-w-[70px]">
            <label
              className="text-xs text-gray-500 mb-1"
              title="Quantidade Requerida"
            >
              Qtd. R
            </label>
            <Input
              value={getValue("qtdR")}
              onChange={(e) =>
                onProgressUpdate(item.id, "qtdR", e.target.value)
              }
              className="w-16 h-8 text-center text-xs"
              placeholder="-"
              title="Quantidade necessária para completar a quest"
            />
          </div>

          {/* Coluna Barter apenas para chavesQuests, logo após Qtd. R */}
          {sectionType === "chavesQuests" && (
            <div className="flex flex-col items-center min-w-[70px]">
              <label className="text-xs text-gray-500 mb-1" title="Barter">
                Barter
              </label>
              <Select
                value={
                  getValue("barter", "-") === "Yes"
                    ? "Yes"
                    : getValue("barter", "-") === "No"
                    ? "No"
                    : "-"
                }
                onValueChange={(value) =>
                  onProgressUpdate(
                    item.id,
                    "barter",
                    value === "-" ? "" : value
                  )
                }
              >
                <SelectTrigger
                  className="w-16 h-8 text-xs"
                  title="Pode ser trocado?"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">-</SelectItem>
                  <SelectItem value="Yes">Sim</SelectItem>
                  <SelectItem value="No">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* FIR - Found in Raid (apenas para seções que têm) */}
          {(sectionType === "main" ||
            sectionType === "samples" ||
            sectionType === "recompensas-quests" ||
            sectionType === "streamer") && (
            <div className="flex flex-col items-center min-w-[70px]">
              <label
                className="text-xs text-gray-500 mb-1"
                title="Found in Raid (Encontrados na Raid)"
              >
                FIR
              </label>
              <Select
                value={getFirValue()}
                onValueChange={(value) =>
                  onProgressUpdate(item.id, "fir", value === "-" ? "" : value)
                }
              >
                <SelectTrigger
                  className="w-16 h-8 text-xs"
                  title="Precisa ser encontrado na raid?"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">-</SelectItem>
                  <SelectItem value="Yes">Sim</SelectItem>
                  <SelectItem value="No">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botão deletar */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteItem(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
            title="Deletar item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
