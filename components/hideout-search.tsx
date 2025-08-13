import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

interface HideoutSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const HideoutSearch: React.FC<HideoutSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative my-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
          <Input
            type="text"
            placeholder="🔍 Buscar estações ou itens..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
          />
        </div>
        {searchTerm && (
          <div className="mt-2 text-center">
            <span className="text-sm text-muted-foreground">
              Pesquisando por:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                "{searchTerm}"
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HideoutSearch;
