import React from "react";

interface HelpSectionProps {
  showHelp: boolean;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  showHelp,
  setShowHelp,
}) => (
  <div className="mb-8 bg-card rounded-lg shadow-sm border p-6 text-card-foreground">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
        📚 Como usar o Kappa Quest Tracker
      </h2>
      <button
        onClick={() => setShowHelp((prev) => !prev)}
        className="ml-2 p-1 rounded hover:bg-muted transition"
        aria-label={showHelp ? "Ocultar ajuda" : "Mostrar ajuda"}
      >
        {showHelp ? (
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="9,17 14,12 19,17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="9,11 14,16 19,11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
    <div
      className={`collapsible ${
        showHelp ? "collapsible-open" : "collapsible-closed"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="space-y-2">
          <h3 className="font-medium text-[#bfa94a]">
            📊 Qtd. E (Quantidade Encontrada)
          </h3>
          <p className="text-muted-foreground">
            Quantos itens você já possui no seu stash ou encontrou. Atualize
            conforme coleta os itens.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-green-600">
            🎯 Qtd. R (Quantidade Requerida)
          </h3>
          <p className="text-muted-foreground">
            Quantos itens você precisa para completar a quest ou objetivo.
            Alguns podem ter requisitos específicos.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-purple-600">
            🔍 FIR (Found in Raid)
          </h3>
          <p className="text-muted-foreground">
            Se o item precisa ter status "Found in Raid" (encontrado na raid)
            para ser válido na quest.
          </p>
        </div>
      </div>
      <div className="mt-4 p-4 bg-secondary rounded-lg border border-yellow-200 text-secondary-foreground">
        <p className="text-sm text-secondary-foreground">
          <strong>💡 Dica:</strong> Use a busca para encontrar itens específicos
          rapidamente. Recomendamos que você exporte seu progresso regularmente
          para manter um backup seguro dos seus dados.
        </p>
      </div>
      <div className="my-8 flex justify-center">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/-D4S9Ar1L5s"
          title="Tutorial do Binoia sobre a planilha"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-lg shadow-lg max-w-full"
        ></iframe>
      </div>
    </div>
  </div>
);
