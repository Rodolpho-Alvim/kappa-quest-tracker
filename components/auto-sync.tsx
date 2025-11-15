"use client";

import { useTarkovApi } from "@/hooks/use-tarkov-api";
import { useEffect, useRef } from "react";

const SYNC_INTERVAL_HOURS = 6; // Intervalo mínimo entre sincronizações (em horas)
const SYNC_CHECK_KEY = "kappa-last-auto-sync";

export function AutoSync() {
  const {
    getHideoutRequirements,
    compareWithLocalData,
    syncItemsWithLocalData,
    applyChangesToLocalData,
  } = useTarkovApi();

  const hasSyncedRef = useRef(false);

  const performAutoSync = async () => {
    try {
      // Verificar última sincronização
      const lastSyncStr = localStorage.getItem(SYNC_CHECK_KEY);
      if (lastSyncStr) {
        const lastSync = new Date(lastSyncStr);
        const now = new Date();
        const hoursSinceLastSync =
          (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

        // Se já sincronizou recentemente, não fazer novamente
        if (hoursSinceLastSync < SYNC_INTERVAL_HOURS) {
          console.log(
            `[AutoSync] Sincronização ignorada. Última sync há ${hoursSinceLastSync.toFixed(
              1
            )} horas`
          );
          return;
        }
      }

      console.log("[AutoSync] Iniciando sincronização automática...");

      // Buscar dados locais do hideout
      const localHideoutDataStr = localStorage.getItem("kappa-hideout-data");
      let localHideoutData = null;
      if (localHideoutDataStr) {
        try {
          localHideoutData = JSON.parse(localHideoutDataStr);
        } catch (e) {
          console.error("[AutoSync] Erro ao ler dados do hideout:", e);
        }
      }

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
          console.error("[AutoSync] Erro ao ler dados de itens locais:", e);
        }
      }

      const itemsSyncResult = syncItemsWithLocalData(localItems);

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

      // Atualizar timestamp da última sincronização automática
      localStorage.setItem(SYNC_CHECK_KEY, new Date().toISOString());

      console.log("[AutoSync] Sincronização automática concluída com sucesso");
      console.log("[AutoSync] Estações atualizadas:", changes?.updatedStations?.length || 0);
      console.log("[AutoSync] Novos itens:", changes?.newItems?.length || 0);
      console.log("[AutoSync] Ícones atualizados:", itemsSyncResult?.updatedIcons?.length || 0);
    } catch (err) {
      console.error("[AutoSync] Erro na sincronização automática:", err);
      // Não mostrar erro ao usuário, apenas logar no console
    }
  };

  useEffect(() => {
    // Executar sincronização apenas uma vez quando o componente monta
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      // Aguardar um pouco para não bloquear o carregamento inicial da página
      const timeoutId = setTimeout(() => {
        performAutoSync();
      }, 2000); // 2 segundos após o carregamento

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []); // Executar apenas uma vez ao montar

  // Componente não renderiza nada na UI
  return null;
}

