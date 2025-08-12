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
import { useTarkovApi } from "@/hooks/use-tarkov-api";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

export function HideoutApiTest() {
  const {
    loading,
    error,
    items: apiItems,
    hideoutStations: apiStations,
    getHideoutRequirements,
    compareWithLocalData,
    generateChangeReport,
    syncItemsWithLocalData,
    generateItemsSyncReport,
  } = useTarkovApi();

  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runApiTest = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      console.log("🧪 Iniciando teste da API do Tarkov.dev...");

      // Testar busca de itens
      console.log("📦 Testando busca de itens...");
      console.log("Itens disponíveis:", apiItems.length);

      // Testar busca de estações do hideout
      console.log("🏠 Testando busca de estações do hideout...");
      console.log("Estações disponíveis:", apiStations.length);

      // Buscar requisitos completos
      console.log("🔍 Buscando requisitos completos...");
      const requirements = await getHideoutRequirements();
      console.log("Requisitos obtidos:", requirements);

      // Verificar dados locais
      const localData = localStorage.getItem("kappa-hideout-data");
      let localHideoutData = null;

      if (localData) {
        try {
          localHideoutData = JSON.parse(localData);
          console.log("📁 Dados locais encontrados:", localHideoutData);
        } catch (e) {
          console.log("❌ Erro ao ler dados locais:", e);
        }
      } else {
        console.log("📁 Nenhum dado local encontrado");
      }

      // Comparar dados
      if (requirements && requirements.length > 0) {
        console.log("🔄 Comparando dados locais vs API...");
        const changes = compareWithLocalData(localHideoutData || []);
        console.log("📊 Mudanças detectadas:", changes);

        // Sincronizar itens
        const localItemsData = localStorage.getItem("kappa-items-data");
        let localItems = {};
        if (localItemsData) {
          try {
            localItems = JSON.parse(localItemsData);
          } catch (e) {
            console.log("❌ Erro ao ler dados de itens locais:", e);
          }
        }

        const itemsSyncResult = syncItemsWithLocalData(localItems);
        console.log("🖼️ Sincronização de itens:", itemsSyncResult);

        // Gerar relatórios
        const report = generateChangeReport(localHideoutData || []);
        const itemsReport = generateItemsSyncReport(itemsSyncResult);
        console.log("📋 Relatório do hideout:", report);
        console.log("🖼️ Relatório de itens:", itemsReport);

        setTestResults({
          success: true,
          apiItems: apiItems.length,
          apiStations: apiStations.length,
          requirements: requirements.length,
          localData: localHideoutData ? "encontrado" : "não encontrado",
          changes,
          itemsSync: itemsSyncResult,
          report,
          itemsReport,
        });
      } else {
        setTestResults({
          success: false,
          error: "Não foi possível obter requisitos da API",
        });
      }
    } catch (err) {
      console.error("❌ Erro no teste:", err);
      setTestResults({
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const downloadApiData = async () => {
    try {
      const requirements = await getHideoutRequirements();
      const dataToExport = {
        apiItems: apiItems,
        apiStations: apiStations,
        requirements: requirements,
        exportDate: new Date().toISOString(),
        source: "Tarkov.dev API",
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tarkov-api-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar dados:", err);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Teste da API Tarkov.dev
        </CardTitle>
        <CardDescription>
          Teste e verifique a conectividade com a API oficial do Tarkov.dev
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da API */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="font-medium">
              {loading
                ? "Carregando..."
                : error
                ? "Erro na API"
                : "API Conectada"}
            </span>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Itens: {apiItems.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Estações: {apiStations.length}
            </Badge>
          </div>
        </div>

        {/* Botões de teste */}
        <div className="flex gap-2">
          <Button
            onClick={runApiTest}
            disabled={loading || isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Testando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Executar Teste
              </>
            )}
          </Button>

          <Button
            onClick={downloadApiData}
            disabled={loading || apiItems.length === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>

        {/* Resultados do teste */}
        {testResults && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-2">📊 Resultados do Teste</h4>

              {testResults.success ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Itens da API:</span>{" "}
                      {testResults.apiItems}
                    </div>
                    <div>
                      <span className="font-medium">Estações da API:</span>{" "}
                      {testResults.apiStations}
                    </div>
                    <div>
                      <span className="font-medium">Requisitos:</span>{" "}
                      {testResults.requirements}
                    </div>
                    <div>
                      <span className="font-medium">Dados Locais:</span>{" "}
                      {testResults.localData}
                    </div>
                  </div>

                  {/* Resumo das mudanças */}
                  {testResults.changes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                      <h5 className="font-medium mb-2">
                        🔄 Mudanças no Hideout:
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-100 dark:bg-green-900 rounded">
                          <div className="font-bold text-green-700 dark:text-green-300">
                            {testResults.changes.newStations?.length || 0}
                          </div>
                          <div>Novas Estações</div>
                        </div>
                        <div className="text-center p-2 bg-blue-100 dark:bg-blue-900 rounded">
                          <div className="font-bold text-blue-700 dark:text-blue-300">
                            {testResults.changes.updatedStations?.length || 0}
                          </div>
                          <div>Est. Atualizadas</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                          <div className="font-bold text-yellow-700 dark:text-yellow-300">
                            {testResults.changes.newItems?.length || 0}
                          </div>
                          <div>Novos Itens</div>
                        </div>
                        <div className="text-center p-2 bg-orange-100 dark:bg-orange-900 rounded">
                          <div className="font-bold text-orange-700 dark:text-orange-300">
                            {testResults.changes.changedQuantities?.length || 0}
                          </div>
                          <div>Qtd. Alteradas</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumo da sincronização de itens */}
                  {testResults.itemsSync && (
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded">
                      <h5 className="font-medium mb-2">
                        🖼️ Sincronização de Itens:
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-100 dark:bg-green-900 rounded">
                          <div className="font-bold text-green-700 dark:text-green-300">
                            {testResults.itemsSync.newItems?.length || 0}
                          </div>
                          <div>Novos Itens</div>
                        </div>
                        <div className="text-center p-2 bg-purple-100 dark:bg-purple-900 rounded">
                          <div className="font-bold text-purple-700 dark:text-purple-300">
                            {testResults.itemsSync.updatedIcons?.length || 0}
                          </div>
                          <div>Ícones Atualizados</div>
                        </div>
                        <div className="text-center p-2 bg-red-100 dark:bg-red-900 rounded">
                          <div className="font-bold text-red-700 dark:text-red-300">
                            {testResults.itemsSync.removedItems?.length || 0}
                          </div>
                          <div>Itens Removidos</div>
                        </div>
                        <div className="text-center p-2 bg-blue-100 dark:bg-blue-900 rounded">
                          <div className="font-bold text-blue-700 dark:text-blue-300">
                            {
                              Object.keys(
                                testResults.itemsSync.updatedItems || {}
                              ).length
                            }
                          </div>
                          <div>Total de Itens</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600 dark:text-red-400">
                  ❌ {testResults.error}
                </div>
              )}
            </div>

            {/* Relatórios detalhados */}
            <div className="space-y-4">
              {testResults.report && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    📋 Relatório do Hideout
                  </h4>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-auto max-h-60">
                    {testResults.report}
                  </pre>
                </div>
              )}

              {testResults.itemsReport && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    🖼️ Relatório de Itens e Ícones
                  </h4>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-auto max-h-60">
                    {testResults.itemsReport}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Erro da API */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Informações sobre a API */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            API oficial do Escape from Tarkov
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Dados sempre atualizados
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Requisitos completos do hideout
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
