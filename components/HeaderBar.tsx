import Image from "next/image";
import React from "react";

interface HeaderBarProps {
  children?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => (
  <div className="bg-background shadow-lg border-b border-border">
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full">
          <Image
            src="/images/kappa-container.jpg"
            alt="Kappa Container"
            width={60}
            height={60}
            className="rounded-lg shadow-md border border-yellow-400 bg-background w-14 h-14 md:w-[100px] md:h-[100px] object-cover"
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="flex flex-col items-center w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center leading-tight whitespace-nowrap">
              Kappa Quest Tracker
            </h1>
            <p className="text-muted-foreground text-sm md:text-sm text-center leading-tight whitespace-nowrap">
              Escape from Tarkov - Container Kappa Progress
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end w-full md:w-auto mt-2 md:mt-0 gap-2">
          {children}
        </div>
      </div>
    </div>
  </div>
);
