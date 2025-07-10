import React from "react";

interface AvisoBannerProps {
  showAviso: boolean;
  setShowAviso: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AvisoBanner: React.FC<AvisoBannerProps> = ({
  showAviso,
  setShowAviso,
}) => {
  if (!showAviso) return null;
  return (
    <div className="p-4 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 relative">
      <button
        onClick={() => setShowAviso(false)}
        className="absolute top-2 right-2 text-yellow-900 dark:text-yellow-100 hover:text-yellow-700"
        aria-label="Fechar aviso"
      >
        ×
      </button>
      <strong>Aviso importante:</strong> Atualizamos a lista de itens e isso
      pode afetar o seu progresso salvo. Caso perceba inconsistências,
      recomendamos <b>limpar o progresso salvo</b> nas configurações do site
      para evitar problemas.
    </div>
  );
};
