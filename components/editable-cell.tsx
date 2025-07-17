"use client";

import type React from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { QuantityInput } from "./QuantityInput";

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  type: "number" | "text" | "fir";
  className?: string;
  isItemName?: boolean; // Para permitir edição de nomes de itens customizados
}

export function EditableCell({
  value,
  onSave,
  type,
  className = "",
  isItemName = false,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleSave = () => {
    let finalValue: string | number = editValue;
    if (type === "number") {
      finalValue = editValue === "" ? "" : Number.parseInt(editValue) || 0;
    }
    onSave(finalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  // Para FIR, usar Select
  if (type === "fir") {
    const bgColor =
      value === "Yes"
        ? "bg-green-200"
        : value === "No"
        ? "bg-red-200"
        : "bg-white";

    return (
      <div className={`${bgColor} ${className} border-r border-gray-300`}>
        <Select
          value={value.toString()}
          onValueChange={(newValue) => onSave(newValue)}
        >
          <SelectTrigger className="h-8 text-xs border-0 bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-</SelectItem>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Para edição inline de números
  if (isEditing && type === "number") {
    return (
      <div className={`${className} border-r border-gray-300`}>
        <QuantityInput
          value={Number(editValue) || 0}
          onChange={(val) => {
            setEditValue(val.toString());
            onSave(val);
          }}
          min={0}
          className="-ml-2"
        />
      </div>
    );
  }

  // Para edição inline de texto
  if (isEditing && type === "text") {
    return (
      <div className={`${className} border-r border-gray-300`}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-8 text-xs border-0 p-1"
          type="text"
          autoFocus
        />
      </div>
    );
  }

  // Para nomes de itens customizados, permitir edição
  const bgColor = isItemName ? "bg-yellow-50" : "bg-white";
  const canEdit = isItemName || type === "number";

  return (
    <div
      className={`${bgColor} ${className} ${
        canEdit ? "cursor-pointer hover:bg-gray-100" : ""
      } p-1 text-xs min-h-[24px] flex items-center border-r border-gray-300`}
      onClick={() => canEdit && setIsEditing(true)}
    >
      {value || ""}
    </div>
  );
}
