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
import { useItemsMap } from "@/hooks/use-items-map";
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
import React, { useState } from "react";
import { QuantityInput } from "./QuantityInput";

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

// Mapeamento manual para exceções conhecidas (adicione mais conforme necessário)
const ITEM_NAME_EXCEPTIONS: Record<string, string> = {
  Salewa: "544fb25a4bdc2dfb738b4567",
  "Graphics card": "5d1b371186f774253763a656",
  Tushonka: "57347da92459774491567cf5", // Large
  Tushonkinha: "57347d7224597744596b4e72", // Small
  "OFZ 30x165mm shell": "5d0379a886f77420407aa271",
  "Any 7.62x51mm NATO ammo pack": "648984e3f09d032aa9399d53",
  "Killa's helmet": "/images/killa-helmet.png",
  "Reshala's Golden TT": "5b3b713c5acfc4330140bd8d",
  "USEC Dogtags": "59f32c3b86f77472a31742f0",
  "BEAR Dogtags": "59f32bb586f774757e1e8442",
  "USEC PMC Dogtags": "59f32c3b86f77472a31742f0",
  "Inseq gas pipe wrench": "66b37f114410565a8f6789e2",
  "Tamatthi kunai knife replica": "66b37ea4c5d72b0277488439",
  "Viibiin sneaker": "66b37eb4acff495a29492407",
  "West 219/220": "5a0ee34586f774023b6ee092",
  // Adicione outros casos especiais aqui
};

// Função para normalizar nomes
function normalize(str?: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

// Estilo CSS customizado para o efeito de zoom
const zoomStyle = `
  .item-zoom {
    transition: transform 0.3s;
    transform-origin: 20% 50%;
    position: relative;
    z-index: 1;
  }
  .item-zoom:hover {
    transform: scale(2);
    z-index: 9999 !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    background: #222;
  }
`;

const ItemRowComponent = ({
  item,
  sectionType,
  userProgress,
  onProgressUpdate,
  onItemUpdate,
  onDeleteItem,
  isEven,
}: ItemRowProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.item);
  const { itemsMap } = useItemsMap();

  // Lógica automática de completo: qtdE >= qtdR (e FIR, se necessário)
  const qtdE = Number(userProgress?.qtdE ?? (item as any).qtdE ?? 0);
  const qtdR = Number(userProgress?.qtdR ?? (item as any).qtdR ?? 0);
  const firRequired =
    (item as any).fir === "Yes" || userProgress?.fir === "Yes";
  const firOk =
    !firRequired || userProgress?.fir === "Yes" || (item as any).fir === "Yes";
  const isCompleted = qtdE >= qtdR && firOk && qtdR > 0;

  const bgColor = isEven ? "bg-muted/50" : "bg-background";
  const completedBg = isCompleted
    ? "bg-green-500/10 border-l-4 border-l-green-500"
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
      <div className={`${bgColor} p-4 border-b border-border`}>
        <div className="flex items-center justify-center">
          <span className="font-bold text-lg text-foreground text-center">
            {item.item}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgColor} ${completedBg} p-4 border-b border-border hover:bg-muted transition-colors group`}
    >
      <style dangerouslySetInnerHTML={{ __html: zoomStyle }} />
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
              <div className="flex items-center gap-2">
                {/* Imagem do item antes do nome */}
                <div className="relative" style={{ overflow: "visible" }}>
                  {(() => {
                    // 1. Tenta pelo id se for um hash válido
                    const isValidId =
                      typeof item.id === "string" &&
                      /^[a-f0-9]{24}$/.test(item.id);
                    if (isValidId) {
                      return (
                        <img
                          src={`https://assets.tarkov.dev/${item.id}-icon.webp`}
                          srcSet={`https://assets.tarkov.dev/${item.id}-icon.webp 1x, https://assets.tarkov.dev/${item.id}-icon.webp 2x`}
                          alt={item.item}
                          className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border item-zoom"
                          style={{
                            verticalAlign: "middle",
                          }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      );
                    }
                    // 2. Tenta pelo nome normalizado
                    const normalizedName = normalize(item.item);
                    const itemIdByName = Object.keys(itemsMap).find(
                      (id) => normalize(itemsMap[id]) === normalizedName
                    );
                    if (itemIdByName) {
                      return (
                        <img
                          src={`https://assets.tarkov.dev/${itemIdByName}-icon.webp`}
                          srcSet={`https://assets.tarkov.dev/${itemIdByName}-icon.webp 1x, https://assets.tarkov.dev/${itemIdByName}-icon.webp 2x`}
                          alt={item.item}
                          className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border item-zoom"
                          style={{ verticalAlign: "middle" }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      );
                    }
                    // 2b. Fuzzy matching: tenta encontrar por partes do nome
                    const words = normalizedName.split(/\s+/).filter(Boolean);
                    let fuzzyId: string | undefined;
                    if (words.length > 0) {
                      // Tenta com as duas primeiras palavras
                      const search = words.slice(0, 2).join("");
                      fuzzyId = Object.keys(itemsMap).find((id) =>
                        normalize(itemsMap[id]).includes(search)
                      );
                    }
                    if (!fuzzyId && words.length > 0) {
                      // Tenta com a primeira palavra
                      const search = words[0];
                      fuzzyId = Object.keys(itemsMap).find((id) =>
                        normalize(itemsMap[id]).includes(search)
                      );
                    }
                    if (fuzzyId) {
                      return (
                        <img
                          src={`https://assets.tarkov.dev/${fuzzyId}-icon.webp`}
                          srcSet={`https://assets.tarkov.dev/${fuzzyId}-icon.webp 1x, https://assets.tarkov.dev/${fuzzyId}-icon.webp 2x`}
                          alt={item.item}
                          className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border item-zoom"
                          style={{ verticalAlign: "middle" }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      );
                    }
                    // 3. Tenta pelo mapeamento manual
                    const exceptionId = ITEM_NAME_EXCEPTIONS[item.item];
                    if (exceptionId) {
                      if (exceptionId.startsWith("/")) {
                        // Caminho local (public/images)
                        return (
                          <img
                            src={exceptionId}
                            alt={item.item}
                            className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border item-zoom"
                            style={{ verticalAlign: "middle" }}
                          />
                        );
                      } else if (exceptionId.startsWith("http")) {
                        // URL externa
                        return (
                          <img
                            src={exceptionId}
                            alt={item.item}
                            className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border item-zoom"
                            style={{ verticalAlign: "middle" }}
                          />
                        );
                      } else {
                        // ID do tarkov.dev
                        return (
                          <img
                            src={`https://assets.tarkov.dev/${exceptionId}-icon.webp`}
                            srcSet={`https://assets.tarkov.dev/${exceptionId}-icon.webp 1x, https://assets.tarkov.dev/${exceptionId}-icon.webp 2x`}
                            alt={item.item}
                            className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border item-zoom"
                            style={{ verticalAlign: "middle" }}
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        );
                      }
                    }
                    // 4. Placeholder
                    return (
                      <img
                        src="/placeholder-logo.png"
                        alt="Sem imagem"
                        className="inline-block w-12 h-12 mr-2 align-middle rounded bg-muted object-contain border opacity-40"
                        style={{ verticalAlign: "middle" }}
                      />
                    );
                  })()}
                </div>
                <span
                  className={`font-medium text-sm leading-tight flex items-center ${
                    isCompleted ? "line-through text-muted-foreground" : ""
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
                {/* Só mostra o botão de editar se for item customizado */}
                {item.isCustom && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lado direito: Campos editáveis */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Qtd. E - Quantidade Encontrada */}
          <div className="flex flex-col items-center min-w-[60px]">
            <label
              className="text-xs text-muted-foreground mb-1"
              title="Quantidade Encontrada"
            >
              Qtd. E
            </label>
            <QuantityInput
              value={Number(getValue("qtdE", 0))}
              onChange={(val) => onProgressUpdate(item.id, "qtdE", val)}
              min={0}
              className="w-14 h-8 text-xs -ml-2"
            />
          </div>

          {/* Qtd. R - Quantidade Requerida */}
          <div className="flex flex-col items-center min-w-[70px]">
            <label
              className="text-xs text-muted-foreground mb-1"
              title="Quantidade Requerida"
            >
              Qtd. R
            </label>
            <QuantityInput
              value={Number(getValue("qtdR", 0))}
              onChange={(val) => onProgressUpdate(item.id, "qtdR", val)}
              min={0}
              className="w-16 h-8 text-xs -ml-2"
            />
          </div>

          {/* Coluna Barter apenas para chavesQuests, logo após Qtd. R */}
          {sectionType === "chavesQuests" && (
            <div className="flex flex-col items-center min-w-[70px]">
              <label
                className="text-xs text-muted-foreground mb-1"
                title="Barter"
              >
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
                className="text-xs text-muted-foreground mb-1"
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
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            title="Deletar item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ItemRow = React.memo(ItemRowComponent);
