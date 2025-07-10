import Image from "next/image";
import React from "react";

interface HeaderBarProps {
  children?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => (
  <div className="bg-white shadow-lg border-b">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/kappa-container.jpg"
            alt="Kappa Container"
            width={100}
            height={100}
            className="rounded-lg shadow-md border border-yellow-400 bg-white"
            priority
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Kappa Quest Tracker
            </h1>
            <p className="text-gray-600">
              Escape from Tarkov - Container Kappa Progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </div>
  </div>
);
