import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, RefreshCw, RotateCcw, Settings, Upload } from "lucide-react";
import React from "react";

interface SettingsDialogProps {
  handleExport: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  restoreDefaults: () => void;
  handleReset: () => void;
  iconOnly?: boolean;
  showRestoreDefaults?: boolean;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  handleExport,
  handleImport,
  restoreDefaults,
  handleReset,
  iconOnly,
  showRestoreDefaults = true,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      {iconOnly ? (
        <Button variant="ghost" size="icon" aria-label="Configurações">
          <Settings className="h-5 w-5" />
        </Button>
      ) : (
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      )}
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Configurações</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Button onClick={handleExport} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Exportar Progresso
        </Button>
        <label className="cursor-pointer">
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              Importar Progresso
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        {showRestoreDefaults && (
          <Button
            onClick={restoreDefaults}
            variant="outline"
            className="w-full bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Itens Padrão
          </Button>
        )}
        <Button onClick={handleReset} variant="destructive" className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Completo
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
