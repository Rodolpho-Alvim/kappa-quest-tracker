import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface HeaderBarProps {
  children?: React.ReactNode;
  imageSrc?: string;
  title?: string;
  subtitle?: string;
  showHubButton?: boolean;
  showApiHubButton?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  children,
  imageSrc,
  title,
  subtitle,
  showHubButton = true,
  showApiHubButton = false,
}) => (
  <div className="bg-background shadow-lg border-b border-border">
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <div className="flex flex-row items-center gap-3 w-full md:w-auto">
          {showHubButton && (
            <Link href="/" passHref legacyBehavior>
              <a
                className="flex items-center justify-center min-w-[40px] w-10 h-10 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shadow hover:bg-zinc-200 dark:hover:bg-zinc-700 transition group mr-2"
                title="Voltar para o HUB"
              >
                <Home className="w-6 h-6 text-zinc-700 dark:text-zinc-200 group-hover:text-primary transition" />
              </a>
            </Link>
          )}
          <Image
            src={imageSrc || "/images/kappa-container.jpg"}
            alt={title || "Kappa Container"}
            width={200}
            height={200}
            className="rounded-lg shadow-md border border-yellow-400 bg-background w-14 h-14 md:w-[100px] md:h-[100px] object-cover"
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="flex flex-col items-start justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight whitespace-nowrap text-left">
              {title || "Kappa Quest Tracker"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-sm leading-tight whitespace-nowrap text-left">
              {subtitle || "Escape from Tarkov - Container Kappa Progress"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end w-full md:w-auto mt-2 md:mt-0 gap-2">
          {showApiHubButton && (
            <a
              href="/hideout/hubapi"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              title="Acessar Hub da API"
            >
              🌐 Hub API
            </a>
          )}
          {children}
        </div>
      </div>
    </div>
  </div>
);
