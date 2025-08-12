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
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ComparisonResult {
  station: string;
  level: number;
  localItems: Array<{ itemId: string; quantity: number }>;
  apiItems: Array<{ itemId: string; name: string; quantity: number }>;
  differences: Array<{
    type: "missing" | "extra" | "quantity_mismatch";
    itemId: string;
    itemName?: string;
    localQuantity?: number;
    apiQuantity?: number;
  }>;
}

export function HideoutComparison() {
  const {
    loading,
    error,
    getHideoutRequirements,
    compareWithLocalData,
    generateChangeReport,
  } = useTarkovApi();

  const [comparisonResults, setComparisonResults] = useState<
    ComparisonResult[]
  >([]);
  const [isComparing, setIsComparing] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  // Dados locais do hideout
  const [localHideoutData, setLocalHideoutData] = useState<any>(null);

  useEffect(() => {
    // Carregar dados locais
    const localData = localStorage.getItem("kappa-hideout-data");
    if (localData) {
      try {
        setLocalHideoutData(JSON.parse(localData));
      } catch (e) {
        console.error("Erro ao ler dados locais:", e);
      }
    }
  }, []);

  const runComparison = async () => {
    setIsComparing(true);
    setComparisonResults([]);
    setSummary(null);

    try {
      console.log("🔍 Iniciando comparação detalhada...");

      // Buscar dados da API
      const apiData = await getHideoutRequirements();
      console.log("📡 Dados da API obtidos:", apiData);

      if (!apiData || apiData.length === 0) {
        throw new Error("Não foi possível obter dados da API");
      }

      // Comparar cada estação e nível
      const results: ComparisonResult[] = [];
      let totalDifferences = 0;
      let totalStations = 0;
      let totalLevels = 0;

      apiData.forEach((apiStation: any) => {
        totalStations++;

        apiStation.levels.forEach((apiLevel: any) => {
          totalLevels++;

          // Encontrar dados locais correspondentes
          const localStation = Array.isArray(localHideoutData)
            ? localHideoutData.find((s: any) => s.id === apiStation.id)
            : null;
          const localLevel =
            localStation?.levels && Array.isArray(localStation.levels)
              ? localStation.levels.find((l: any) => l.level === apiLevel.level)
              : null;

          const localItems =
            localLevel?.requirements?.filter((r: any) => r.type === "item") ||
            [];
          const apiItems = apiLevel.itemRequirements || [];

          // Comparar itens
          const differences: ComparisonResult["differences"] = [];

          // Verificar itens da API que não estão nos dados locais
          apiItems.forEach((apiItem: any) => {
            const localItem = localItems.find(
              (l: any) => l.itemId === apiItem.item.id
            );

            if (!localItem) {
              differences.push({
                type: "missing",
                itemId: apiItem.item.id,
                itemName: apiItem.item.name,
                apiQuantity: apiItem.count,
              });
              totalDifferences++;
            } else if (localItem.quantity !== apiItem.count) {
              differences.push({
                type: "quantity_mismatch",
                itemId: apiItem.item.id,
                itemName: apiItem.item.name,
                localQuantity: localItem.quantity,
                apiQuantity: apiItem.count,
              });
              totalDifferences++;
            }
          });

          // Verificar itens locais que não estão na API (extras)
          localItems.forEach((localItem: any) => {
            const apiItem = apiItems.find(
              (a: any) => a.item.id === localItem.itemId
            );

            if (!apiItem) {
              differences.push({
                type: "extra",
                itemId: localItem.itemId,
                localQuantity: localItem.quantity,
              });
              totalDifferences++;
            }
          });

          if (differences.length > 0) {
            results.push({
              station: apiStation.name,
              level: apiLevel.level,
              localItems: localItems.map((i: any) => ({
                itemId: i.itemId,
                quantity: i.quantity,
              })),
              apiItems: apiItems.map((i: any) => ({
                itemId: i.item.id,
                name: i.item.name,
                quantity: i.count,
              })),
              differences,
            });
          }
        });
      });

      setComparisonResults(results);
      setSummary({
        totalStations,
        totalLevels,
        totalDifferences,
        stationsWithDifferences: results.length,
      });

      console.log("📊 Comparação concluída:", results);
    } catch (err) {
      console.error("❌ Erro na comparação:", err);
    } finally {
      setIsComparing(false);
    }
  };

  const downloadComparisonReport = () => {
    if (!comparisonResults.length) return;

    const report = {
      summary,
      details: comparisonResults,
      exportDate: new Date().toISOString(),
      source: "Tarkov.dev API vs Dados Locais",
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hideout-comparison-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifferenceIcon = (type: string) => {
    switch (type) {
      case "missing":
        return "❌";
      case "extra":
        return "➕";
      case "quantity_mismatch":
        return "⚠️";
      default:
        return "❓";
    }
  };

  const getDifferenceColor = (type: string) => {
    switch (type) {
      case "missing":
        return "text-red-600 dark:text-red-400";
      case "extra":
        return "text-yellow-600 dark:text-yellow-400";
      case "quantity_mismatch":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Comparação Detalhada: Local vs API
        </CardTitle>
        <CardDescription>
          Compare nossos dados locais com os dados oficiais da API do Tarkov.dev
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status e resumo */}
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

          {summary && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                Estações: {summary.totalStations}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Níveis: {summary.totalLevels}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Diferenças: {summary.totalDifferences}
              </Badge>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button
            onClick={runComparison}
            disabled={loading || isComparing}
            className="flex-1"
          >
            {isComparing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Comparando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Executar Comparação
              </>
            )}
          </Button>

          <Button
            onClick={downloadComparisonReport}
            disabled={!comparisonResults.length}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Resumo da comparação */}
        {summary && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2">📊 Resumo da Comparação</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-700 dark:text-blue-300">
                  {summary.totalStations}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Estações
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700 dark:text-green-300">
                  {summary.totalLevels}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Níveis
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-700 dark:text-orange-300">
                  {summary.totalDifferences}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Diferenças
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-700 dark:text-red-300">
                  {summary.stationsWithDifferences}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  Est. com Diferenças
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resultados detalhados */}
        {comparisonResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">🔍 Diferenças Encontradas</h4>

            {comparisonResults.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium">
                    {result.station} - Nível {result.level}
                  </h5>
                  <Badge variant="outline" className="text-xs">
                    {result.differences.length} diferenças
                  </Badge>
                </div>

                <div className="space-y-2">
                  {result.differences.map((diff, diffIndex) => (
                    <div
                      key={diffIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>{getDifferenceIcon(diff.type)}</span>
                      <span className={getDifferenceColor(diff.type)}>
                        {diff.type === "missing" &&
                          `Item ausente: ${diff.itemName} (${diff.apiQuantity})`}
                        {diff.type === "extra" &&
                          `Item extra: ${diff.itemId} (${diff.localQuantity})`}
                        {diff.type === "quantity_mismatch" &&
                          `Quantidade diferente: ${diff.itemName} (Local: ${diff.localQuantity}, API: ${diff.apiQuantity})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Erro da API */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Compara dados locais com API oficial do Tarkov
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Identifica itens ausentes, extras e quantidades diferentes
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Gera relatório detalhado para correção
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
