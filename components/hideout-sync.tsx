"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTarkovApi } from "@/hooks/use-tarkov-api";
import {
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface HideoutSyncProps {
  onDataUpdate?: (newData: any) => void;
}

export function HideoutSync({ onDataUpdate }: HideoutSyncProps) {
  const {
    loading,
    error,
    refreshData,
    getHideoutRequirements,
    items: apiItems,
    compareWithLocalData,
    generateChangeReport,
    syncItemsWithLocalData,
    generateItemsSyncReport,
    applyChangesToLocalData,
  } = useTarkovApi();

  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncDetails, setSyncDetails] = useState<{
    itemsUpdated: number;
    stationsUpdated: number;
    newItems: number;
    changedQuantities: number;
    iconsUpdated: number;
    itemsRemoved: number;
  } | null>(null);

  // Dados locais do hideout
  const [localHideoutData] = useLocalStorage("kappa-hideout-data", null);

  const handleSync = async () => {
    setSyncStatus("syncing");

    try {
      // Buscar dados atualizados da API
      const apiHideoutData = await getHideoutRequirements();

      // Comparar com dados locais e identificar mudanças
      const changes = compareWithLocalData(localHideoutData || []);

      // Sincronizar itens locais com a API (incluindo ícones)
      const localItemsData = localStorage.getItem("kappa-items-data");
      let localItems = {};
      if (localItemsData) {
        try {
          localItems = JSON.parse(localItemsData);
        } catch (e) {
          console.error("Erro ao ler dados de itens locais:", e);
        }
      }

      const itemsSyncResult = syncItemsWithLocalData(localItems);

      // Calcular estatísticas das mudanças
      const stats = calculateChangesStats(changes, itemsSyncResult);

      // Aplicar mudanças aos dados locais (incluindo quantidades atualizadas)
      const updatedHideoutData = applyChangesToLocalData(
        localHideoutData || []
      );

      // Salvar dados atualizados
      const updatedData = {
        ...updatedHideoutData,
        lastSync: new Date().toISOString(),
        version: "api-v1",
        changes,
      };

      // Salvar dados do hideout no localStorage
      localStorage.setItem("kappa-hideout-data", JSON.stringify(updatedData));

      // Salvar dados de itens atualizados no localStorage
      localStorage.setItem(
        "kappa-items-data",
        JSON.stringify(itemsSyncResult.updatedItems)
      );

      // Atualizar estado
      setLastSync(new Date());
      setSyncStatus("success");
      setSyncDetails(stats);

      // Notificar componente pai
      if (onDataUpdate) {
        onDataUpdate(updatedData);
      }

      // Reset status após 3 segundos
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (err) {
      setSyncStatus("error");
      console.error("Erro na sincronização:", err);
    }
  };

  // Função para calcular estatísticas das mudanças
  const calculateChangesStats = (changes: any, itemsSyncResult?: any) => {
    return {
      itemsUpdated: changes?.updatedStations?.length || 0,
      stationsUpdated:
        (changes?.newStations?.length || 0) +
        (changes?.updatedStations?.length || 0),
      newItems: changes?.newItems?.length || 0,
      changedQuantities: changes?.changedQuantities?.length || 0,
      iconsUpdated: itemsSyncResult?.updatedIcons?.length || 0,
      itemsRemoved: itemsSyncResult?.removedItems?.length || 0,
    };
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "syncing":
        return "Sincronizando...";
      case "success":
        return "Sincronizado com sucesso!";
      case "error":
        return "Erro na sincronização";
      default:
        return "Sincronizar com Tarkov.dev";
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "bg-blue-500 hover:bg-blue-600";
      case "success":
        return "bg-green-500 hover:bg-green-600";
      case "error":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Sincronização Automática
        </CardTitle>
        <CardDescription>
          Mantenha os dados do hideout atualizados com as últimas mudanças do
          jogo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da sincronização */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>

          {lastSync && (
            <Badge variant="outline" className="text-xs">
              Última sincronização: {lastSync.toLocaleString("pt-BR")}
            </Badge>
          )}
        </div>

        {/* Detalhes da sincronização */}
        {syncDetails && syncStatus === "success" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
            <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
              <div className="font-bold text-green-700 dark:text-green-300">
                {syncDetails.stationsUpdated}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Estações
              </div>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
              <div className="font-bold text-blue-700 dark:text-blue-300">
                {syncDetails.itemsUpdated}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Itens
              </div>
            </div>
            <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
              <div className="font-bold text-yellow-700 dark:text-yellow-300">
                {syncDetails.newItems}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                Novos
              </div>
            </div>
            <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
              <div className="font-bold text-orange-700 dark:text-orange-300">
                {syncDetails.changedQuantities}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Quantidades
              </div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded">
              <div className="font-bold text-purple-700 dark:text-purple-300">
                {syncDetails.iconsUpdated}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Ícones
              </div>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
              <div className="font-bold text-red-700 dark:text-red-300">
                {syncDetails.itemsRemoved}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                Removidos
              </div>
            </div>
          </div>
        )}

        {/* Botão de sincronização */}
        <Button
          onClick={handleSync}
          disabled={loading || syncStatus === "syncing"}
          className={`w-full ${getStatusColor()}`}
        >
          {getStatusIcon()}
          {syncStatus === "syncing" ? "Sincronizando..." : "Sincronizar Agora"}
        </Button>

        {/* Botão para ver relatório detalhado */}
        {syncDetails && syncStatus === "success" && (
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                const report = generateChangeReport(localHideoutData || []);
                alert(report);
              }}
              className="w-full"
            >
              📊 Relatório do Hideout
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const localItemsData = localStorage.getItem("kappa-items-data");
                let localItems = {};
                if (localItemsData) {
                  try {
                    localItems = JSON.parse(localItemsData);
                  } catch (e) {
                    console.error("Erro ao ler dados de itens locais:", e);
                  }
                }
                const itemsSyncResult = syncItemsWithLocalData(localItems);
                const report = generateItemsSyncReport(itemsSyncResult);
                alert(report);
              }}
              className="w-full"
            >
              🖼️ Relatório de Itens e Ícones
            </Button>
          </div>
        )}

        {/* Informações sobre a API */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Dados oficiais do Escape from Tarkov
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Atualizações automáticas de requisitos
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Sincronização com mudanças do jogo
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Atualização automática de ícones e imagens
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
