"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { QuestItem, UserProgress } from "@/types/quest-item";
import { Check, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { EditableCell } from "./editable-cell";

interface QuestItemRowProps {
  item: QuestItem;
  progress: UserProgress[string] | undefined;
  onProgressUpdate: (itemId: string, progress: UserProgress[string]) => void;
  onItemUpdate: (itemId: string, field: keyof QuestItem, value: string) => void;
}

export function QuestItemRow({
  item,
  progress,
  onProgressUpdate,
  onItemUpdate,
}: QuestItemRowProps) {
  const [notes, setNotes] = useState(progress?.notes || "");
  const [isEditing, setIsEditing] = useState<keyof QuestItem | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleProgressToggle = (completed: boolean) => {
    onProgressUpdate(item.id, {
      completed,
      notes: progress?.notes || "",
      lastUpdated: Date.now(),
    });
  };

  const handleNotesUpdate = () => {
    onProgressUpdate(item.id, {
      completed: progress?.completed || false,
      notes,
      lastUpdated: Date.now(),
    });
  };

  const handleFieldEdit = (field: keyof QuestItem, value: string) => {
    setIsEditing(field);
    setEditValue(value);
  };

  const handleFieldSave = (field: keyof QuestItem) => {
    onItemUpdate(item.id, field, editValue);
    setIsEditing(null);
  };

  const handleFieldCancel = () => {
    setIsEditing(null);
    setEditValue("");
  };

  const renderEditableCell = (field: keyof QuestItem, value: string) => {
    if (isEditing === field) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFieldSave(field);
              if (e.key === "Escape") handleFieldCancel();
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => handleFieldSave(field)}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleFieldCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px]"
        onClick={() => handleFieldEdit(field, value)}
      >
        {value || "-"}
      </div>
    );
  };

  return (
    <tr
      className={`border-b hover:bg-gray-50 ${
        progress?.completed ? "bg-green-50" : ""
      }`}
    >
      <td className="p-2 border-r">
        <Checkbox
          checked={progress?.completed || false}
          onCheckedChange={handleProgressToggle}
        />
      </td>
      <td className="p-2 border-r text-sm font-medium">
        <EditableCell
          value={item.item}
          onSave={(val) => onItemUpdate(item.id, "item", String(val))}
          type="text"
          isItemName={true}
        />
      </td>
      <td className="p-2 border-r text-sm">
        <EditableCell
          value={item.qtdE}
          onSave={(val) => onItemUpdate(item.id, "qtdE", String(val))}
          type="number"
        />
      </td>
      <td className="p-2 border-r text-sm">
        <EditableCell
          value={item.qtdR}
          onSave={(val) => onItemUpdate(item.id, "qtdR", String(val))}
          type="number"
        />
      </td>
      <td className="p-2 border-r text-sm">
        <EditableCell
          value={item.fir}
          onSave={(val) => onItemUpdate(item.id, "fir", String(val))}
          type="fir"
        />
      </td>
      <td className="p-2 border-r text-sm">
        <EditableCell
          value={item.streamerItems}
          onSave={(val) => onItemUpdate(item.id, "streamerItems", String(val))}
          type="text"
        />
      </td>
      <td className="p-2 border-r text-sm">
        <EditableCell
          value={item.craftsProvaveis}
          onSave={(val) =>
            onItemUpdate(item.id, "craftsProvaveis", String(val))
          }
          type="text"
        />
      </td>
      <td className="p-2 border-r text-sm">
        <EditableCell
          value={item.hideoutImportante}
          onSave={(val) =>
            onItemUpdate(item.id, "hideoutImportante", String(val))
          }
          type="text"
        />
      </td>
      <td className="p-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MessageSquare className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notas - {item.item}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione suas notas aqui..."
                rows={4}
              />
              <Button onClick={handleNotesUpdate}>Salvar Notas</Button>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
