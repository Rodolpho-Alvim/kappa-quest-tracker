"use client";

import { Footer } from "@/components/Footer";
import { HeaderBar } from "@/components/HeaderBar";
import { HideoutApiTest } from "@/components/hideout-api-test";
import { HideoutComparison } from "@/components/hideout-comparison";
import { HideoutSync } from "@/components/hideout-sync";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useState } from "react";

export default function HideoutHubApiPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [progress] = useLocalStorage("kappa-hideout-progress", {});

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        title="Hideout Hub API"
        subtitle="Central de Sincronização e Comparação de Dados"
      />

      <div className="flex min-h-screen">
        {/* Sidebar com estatísticas */}
        <aside className="w-64 bg-card border-r border-border p-4 hidden lg:block">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">📊 Estatísticas</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.keys(progress).length}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Itens Rastreados
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {
                      Object.values(progress).filter(
                        (p: any) => p.found >= p.total
                      ).length
                    }
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Itens Completos
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🔗 Links Úteis</h3>
              <div className="space-y-2">
                <a
                  href="https://tarkov.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  🌐 Tarkov.dev
                </a>
                <a
                  href="https://api.tarkov.dev/graphql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  📡 API GraphQL
                </a>
                <a
                  href="/hideout"
                  className="block p-2 bg-blue-50 dark:bg-blue-900 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  🏠 Voltar ao Hideout
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-2 py-6">
          {/* Header da página */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <h1 className="text-4xl font-bold">🚀 Hub da API Tarkov.dev</h1>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Configurações"
              >
                ⚙️
              </button>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Central de sincronização, comparação e análise dos dados oficiais
              do Escape from Tarkov
            </p>
          </div>

          {/* Grid de componentes */}
          <div className="grid gap-6">
            {/* Teste da API */}
            <div>
              <HideoutApiTest />
            </div>

            {/* Sincronização com API */}
            <div>
              <HideoutSync
                onDataUpdate={(newData) => {
                  console.log("Dados atualizados da API:", newData);
                  // Aqui você pode implementar a lógica para atualizar
                  // os dados locais com as informações da API
                }}
              />
            </div>

            {/* Comparação Detalhada */}
            <div>
              <HideoutComparison />
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              💡 Sobre a API Tarkov.dev
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">🎯 O que é?</h3>
                <p className="text-muted-foreground">
                  A API oficial do Tarkov.dev fornece dados atualizados em tempo
                  real sobre todos os aspectos do Escape from Tarkov, incluindo
                  requisitos do hideout, itens, traders e muito mais.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔧 Como funciona?</h3>
                <p className="text-muted-foreground">
                  Utilizamos GraphQL para buscar dados específicos, comparar com
                  nossos dados locais e identificar automaticamente mudanças,
                  novos itens e requisitos atualizados.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 Benefícios</h3>
                <p className="text-muted-foreground">
                  Dados sempre corretos, atualizações automáticas, identificação
                  de mudanças e sincronização perfeita com as últimas alterações
                  do jogo.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🛡️ Segurança</h3>
                <p className="text-muted-foreground">
                  Apenas leitura de dados públicos, sem envio de informações
                  pessoais. Seu progresso fica salvo localmente no navegador.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
