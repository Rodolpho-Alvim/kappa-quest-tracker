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
    <div className="relative w-full bg-yellow-100 border border-yellow-300 rounded-md flex items-center gap-2 px-3 py-2 mb-4 min-h-[32px] p-2">
      <button
        onClick={() => setShowAviso(false)}
        className="absolute top-2 right-2 text-yellow-900 dark:text-yellow-100 hover:text-yellow-700"
        aria-label="Fechar aviso"
      >
        ×
      </button>
      <span className="hidden md:inline">
        <strong>Aviso importante:</strong> Recomendamos que você exporte seu
        progresso regularmente para manter um backup seguro dos seus dados.
      </span>
      <span className="inline md:hidden">
        Dica: Exporte seu progresso para backup nas configurações.
      </span>
    </div>
  );
};
