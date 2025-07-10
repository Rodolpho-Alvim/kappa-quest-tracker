import React from "react";

export const Footer: React.FC = () => (
  <footer className="w-full py-4 mt-12 flex justify-center items-center text-sm text-muted-foreground">
    <span>
      Criado por{" "}
      <a
        href="https://www.rodolphoalvim.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary transition"
      >
        Rodolpho Alvim
      </a>
    </span>
  </footer>
);
